import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeagueHeader } from "@/components/LeagueHeader";
import { useLeagueStore } from "@/store/leagueStore";
import {
  getMockLeagueData,
  getMockTeamById,
} from "tests/fixtures/mockSelectors";
import { ImageLightbox } from "@/components/ImageLightbox";


jest.mock("@/store/leagueStore", () => ({
  useLeagueStore: jest.fn(),
}));

jest.mock("@/hooks/useGitHubData", () => ({
  useGitHubData: jest.fn(() => ({
    uploadImage: jest.fn().mockReturnValue("path/to/image"),
  })),
}));

jest.mock("@/components/ImageLightbox", () => ({
  ImageLightbox: jest.fn(() => null),
}));

jest.mock("lucide-react", () => ({
  Trophy: () => <div data-testid="trophy-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Camera: () => <div data-testid="camera-icon" />,
}));

const mockUseLeagueStore = useLeagueStore as unknown as jest.Mock;

const renderLeagueHeader = (
  props: Partial<React.ComponentProps<typeof LeagueHeader>> = {},
) => {
  return render(
    <LeagueHeader theme="default" allowLogoUpload={false} {...props} />,
  );
};

const data = getMockLeagueData();

afterEach(() => {
    jest.clearAllMocks();
  });

describe("LeagueHeader - rendering", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  beforeEach(() => {
    mockUseLeagueStore.mockReturnValue({
      ...data,
      leagueName: data.leagueConfig!.name,
    });
  });
  test("renders league name in uppercase", () => {
    renderLeagueHeader();
    const leagueName = screen.getByTestId("league-title");
    expect(leagueName).toBeInTheDocument();
    expect(leagueName).toHaveTextContent(data.leagueConfig!.name.toUpperCase());
  });
  test("renders subtitle with targetMatches and teams count", () => {
    renderLeagueHeader();
    const subtitle = screen.getByTestId("league-subtitle");
    expect(subtitle).toBeInTheDocument();
  });
  test("renders correct targetMatches and teams count in subtitle", () => {
    renderLeagueHeader();
    const subtitle = screen.getByTestId("league-subtitle");
    expect(subtitle).toHaveTextContent(`${data.targetMatches} Matches`);
    expect(subtitle).toHaveTextContent(`${data.teams.length} Teams`);
  });
  test("renders both team names", () => {
    const team1 = getMockTeamById(data, "team-1");
    const team2 = getMockTeamById(data, "team-2");
    renderLeagueHeader();
    expect(screen.getByText(team1.name)).toBeInTheDocument();
    expect(screen.getByText(team2.name)).toBeInTheDocument();
  });
  test("renders both coach names", () => {
    const team1 = getMockTeamById(data, "team-1");
    const team2 = getMockTeamById(data, "team-2");
    renderLeagueHeader();
    expect(screen.getByText(new RegExp(team1.coach))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(team2.coach))).toBeInTheDocument();
  });
  test("renders Shield icon when team has no logo", () => {
    mockUseLeagueStore.mockReturnValue({
      ...getMockLeagueData(),
      leagueName: data.leagueConfig!.name,
      teams: data.teams.map((team) => ({ ...team, logo: "" })),
    });
    renderLeagueHeader();
    expect(screen.getAllByTestId("shield-icon")).toHaveLength(2);
  });

  test("renders img when team has a logo", () => {
    mockUseLeagueStore.mockReturnValue({
      ...getMockLeagueData(),
      leagueName: data.leagueConfig!.name,
      teams: data.teams.map((team) => ({
        ...team,
        logo: "images/example-image.png",
      })),
    });
    const team1 = getMockTeamById(data, "team-1");
    const team2 = getMockTeamById(data, "team-2");
    renderLeagueHeader();
    expect(screen.getByRole("img", { name: team1.name })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: team2.name })).toBeInTheDocument();
  });
});
describe("LeagueHeader - progress bar", () => {
  test.each([
  { matchCount: 0, targetMatches: 10, expected: "0%" },
  { matchCount: 5, targetMatches: 10, expected: "50%" },
  { matchCount: 10, targetMatches: 10, expected: "100%" },
])("renders $expected when $matchCount out of $targetMatches matches played", ({ matchCount, targetMatches, expected }) => {
  mockUseLeagueStore.mockReturnValue({
    ...getMockLeagueData(),
    leagueName: data.leagueConfig!.name,
    matches: getMockLeagueData({ withMatches: true }).matches.slice(0, matchCount),
    targetMatches,
  });
  renderLeagueHeader();
  expect(screen.getByTestId("progress-bar")).toHaveTextContent(expected);
});
  test("renders 'Beginning Soon' when no matches played", () => {
    mockUseLeagueStore.mockReturnValue({
        ...getMockLeagueData(),
        leagueName: data.leagueConfig!.name,
        matches: [],
    })
    renderLeagueHeader();
    expect(screen.getByTestId("progress-bar")).toHaveTextContent(new RegExp('beginning soon', 'i'));
  });
  test.each([
  { matchCount: 1 },
  { matchCount: 9 },
])("renders 'In Progress' when $matchCount matches played", ({ matchCount }) => {
  mockUseLeagueStore.mockReturnValue({
    ...getMockLeagueData(),
    leagueName: data.leagueConfig!.name,
    matches: getMockLeagueData({ withMatches: true }).matches.slice(0, matchCount),
    targetMatches: 10,
  });
  renderLeagueHeader();
  expect(screen.getByTestId("progress-bar")).toHaveTextContent(/in progress/i);
});
  test("renders 'Finished' when target matches reached", () => {
    mockUseLeagueStore.mockReturnValue({
    ...getMockLeagueData(),
    leagueName: data.leagueConfig!.name,
    matches: getMockLeagueData({ withMatches: true }).matches,
    targetMatches: 11,
  });
  renderLeagueHeader();
  expect(screen.getByTestId("progress-bar")).toHaveTextContent(/finished/i);
  });
  });

describe("LeagueHeader - logo interactions", () => {
  test("opens lightbox when logo clicked and allowLogoUpload is false", async () => {
    const team = getMockTeamById(data, "team-1");
    mockUseLeagueStore.mockReturnValue({
  ...getMockLeagueData(),
  leagueName: data.leagueConfig!.name,
  teams: data.teams.map((team) => ({ ...team, logo: "images/example-logo.png" })),
});
    renderLeagueHeader({allowLogoUpload: false});
    const image = screen.getByRole('img', { name:team.name });
    await userEvent.click(image);
    expect(ImageLightbox).toHaveBeenCalled();
})
  test("does not open lightbox when no logo and allowLogoUpload is false", async () => {
    mockUseLeagueStore.mockReturnValue({
  ...getMockLeagueData(),
  leagueName: data.leagueConfig!.name,
  teams: data.teams.map((team) => ({ ...team, logo: "" })),
});
    renderLeagueHeader({allowLogoUpload: false});
    const sheildIcon = screen.getAllByTestId("shield-icon");
    await userEvent.click(sheildIcon[0]);
    
    expect(ImageLightbox).not.toHaveBeenCalled();

  });
  test("renders file input when allowLogoUpload is true", () => {
  const { container } = renderLeagueHeader({ allowLogoUpload: true });
  expect(container.querySelectorAll('input[type="file"]')).toHaveLength(2);
});

test("does not render file input when allowLogoUpload is false", () => {
  const { container } = renderLeagueHeader({ allowLogoUpload: false });
  expect(container.querySelectorAll('input[type="file"]')).toHaveLength(0);
});
});
