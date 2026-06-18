import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopScorers } from "@/components/TopScorers";
import { useLeagueStore } from "@/store/leagueStore";
import { getMockLeagueData } from "tests/fixtures/mockSelectors";
import { sortPlayers } from "@/lib/scorersUtils";
import { LeagueData } from "@/lib/githubUtils";

jest.mock("@/store/leagueStore", () => ({
  useLeagueStore: jest.fn(),
}));

// Required to prevent import.meta.env error triggered by mockSelectors.ts => useGitHubData import chain
jest.mock("@/hooks/useGitHubData", () => ({
  useGitHubData: jest.fn(),
}));

jest.mock("@/components/ImageLightbox");

jest.mock("lucide-react", () => ({
  User: () => <div data-testid="user-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Edit2: () => <div data-testid="edit-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
}));

const defaultProps = {
  onEditPlayer: jest.fn(),
  hideButtons: true,
  theme: "default" as const,
};

const renderTopScorers = (
  props: Partial<React.ComponentProps<typeof TopScorers>> = {},
) => {
  return render(<TopScorers {...defaultProps} {...props} />);
};

const mockUseLeagueStore = useLeagueStore as unknown as jest.Mock;

let data: LeagueData;

beforeEach(() => {
  data = getMockLeagueData({ withScorers: true });
  setMockStore();
});

const setMockStore = (overrides = {}) =>
  mockUseLeagueStore.mockReturnValue({
    ...data,
    ...overrides,
  });

afterEach(() => {
  jest.clearAllMocks();
});

const getPlayersRows = () => screen.getAllByTestId(/player-row/);

const getShowAllButton = (exists: boolean = true) =>
    exists
      ? screen.getByRole("button", { name: /show all/i })
      : screen.queryByRole("button", { name: /show all/i });

describe("TopScorers - rendering", () => {
  test("renders the 'Top Scorers' heading", () => {
    renderTopScorers();
    expect(
      screen.getByRole("heading", { name: /top scorers/i }),
    ).toBeInTheDocument();
  });
  test("renders empty state when there are no players", () => {
    setMockStore({ players: [] });
    renderTopScorers();
    expect(screen.getByText(/no players/i)).toBeInTheDocument();
  });
  test("renders all players with goals by default", () => {
    const scorers = data.players.filter((p) => (p.goals || 0) > 0);
    setMockStore();
    renderTopScorers();
    expect(getPlayersRows().length).toBe(scorers.length);
  });
  test("renders player name and team name", () => {
    renderTopScorers();
    const players = data.players.filter((p) => (p.goals || 0) > 0);
    players.forEach((player) => {
      const row = getPlayersRows().find((r) =>
        r.textContent?.includes(player.name),
      );
      expect(row).toBeDefined();
      const teamName = data.teams.find((t) => t.id === player.teamId)!.name;
      expect(row).toHaveTextContent(teamName);
    });
  });
  test("renders goal count for each player", () => {
    renderTopScorers();
    const players = data.players.filter((p) => (p.goals || 0) > 0);
    players.forEach((player) => {
      const row = getPlayersRows().find((r) =>
        r.textContent?.includes(player.name),
      );
      expect(row).toBeDefined();
      expect(row).toHaveTextContent(`${player.goals}goals`);
    });
  });
  test("renders User icon when player has no image", () => {
    // Ensure at least one player has no image
    data.players[0] = { ...data.players[0], image: null };
    setMockStore();
    renderTopScorers();
    expect(screen.getAllByTestId("user-icon").length).toBeGreaterThan(0);
  });
  test("renders img when player has an image", () => {
    const targetPlayer = {
      ...data.players[0],
      name: "Unique Test Player",
      image: "Images/player1.jpg",
      goals: 99,
    };
    data.players[0] = targetPlayer;
    setMockStore();
    renderTopScorers();
    const playerImg = screen.getByAltText(targetPlayer.name);
    expect(playerImg).toBeInTheDocument();
    expect(playerImg).toHaveAttribute("src", "Images/player1.jpg");
  });
});

describe("TopScorers - sorting & filtering", () => {
  // Sorting logic is covered by scorersUtils unit tests
  // test("sorts players by goals descending");
  // test("sorts players with same goals by team points descending");
  // test("sorts players with same goals and team points by goal difference descending");
  // test("sorts players with same goals alphabetically");
  test("hides non-scorers by default", () => {
    const nonScorers = data.players.filter((p) => (p.goals || 0) === 0);
    renderTopScorers();
    expect(getPlayersRows().length).toBe(
      data.players.length - nonScorers.length,
    );
  });
  test("shows all players after clicking show all", async () => {
    data.players = [
      { id: "1", name: "Scorer Player", teamId: "team1", goals: 5, image: "" },
      {
        id: "2",
        name: "Non-Scorer Player",
        teamId: "team1",
        goals: 0,
        image: "",
      },
    ];
    setMockStore();
    renderTopScorers();
    await userEvent.click(getShowAllButton()!);
    expect(getPlayersRows().length).toBe(data.players.length);
  });

  test("hides show all button when all players have goals", () => {
    data.players = data.players.map((p) => ({ ...p, goals: p.goals || 1 }));
    setMockStore();
    renderTopScorers();
    expect(
      getShowAllButton(false)
    ).not.toBeInTheDocument();
  });
  test("shows show all button when there are non-scorers", async () => {
    data.players[0].goals = 0;
    setMockStore();
    renderTopScorers();
    expect(getShowAllButton()).toBeInTheDocument();
  });
});

describe("TopScorers - buttons", () => {
  const getEditIcon = (exists: boolean = true) =>
  exists ? screen.getByTestId("edit-icon") : screen.queryByTestId("edit-icon");

const getTrashIcon = (exists: boolean = true) =>
  exists ? screen.getByTestId("trash-icon") : screen.queryByTestId("trash-icon");

const getEditButtons = () => screen.getAllByTestId("edit-icon");

const getDeleteButtons = () =>
  screen.getAllByTestId("trash-icon").map((icon) => icon.closest("button")!);

  test("hides edit and delete buttons when hideButtons is true (unauthenticated)", () => {
    renderTopScorers({ hideButtons: true });
    expect(getEditIcon(false)).not.toBeInTheDocument();
    expect(getTrashIcon(false)).not.toBeInTheDocument();
  });
  test("calls onEditPlayer with correct id when edit is clicked", async () => {
    const onEditPlayer = jest.fn();
    renderTopScorers({ hideButtons: false, onEditPlayer });
    await userEvent.click(getEditButtons()[0]);
    const sorted = sortPlayers(data.players, data.teams);
    const scorers = sorted.filter((p) => (p.goals || 0) > 0);
    expect(onEditPlayer).toHaveBeenCalledWith(scorers[0].id);
  });
  test("delete button is disabled when player has goals", () => {
    renderTopScorers({ hideButtons: false });
    getDeleteButtons().forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  test("delete button is disabled when team has 23 or fewer players", async () => {
    data.players = Array.from({ length: 23 }, (_, i) => ({
      id: `player-${i}`,
      name: `Player ${i}`,
      teamId: "team-1",
      goals: 0,
      image: "",
    }));
    setMockStore();
    renderTopScorers({ hideButtons: false });
    await userEvent.click(getShowAllButton()!);
    getDeleteButtons().forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
