import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerForm } from "@/components/PlayerForm";
import { useLeagueStore } from "@/store/leagueStore";
import { useGitHubData } from "@/hooks/useGitHubData";
import { populatePlayerForm, resetPlayerForm, generateImageFilename } from "@/lib/playerFormUtils";
import { getMockLeagueData, getMockPlayerById, getMockPlayerByTeamId } from "tests/fixtures/mockSelectors";

jest.mock("@/store/leagueStore", () => ({
  useLeagueStore: jest.fn(),
}));

jest.mock("@/hooks/useGitHubData", () => ({
  useGitHubData: jest.fn(),
}));

jest.mock("@/lib/playerFormUtils", () => ({
  populatePlayerForm: jest.fn(),
  resetPlayerForm: jest.fn(),
  generateImageFilename: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  User: () => <div data-testid="user-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  X: () => <div data-testid="x-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Info: () => <div data-testid="info-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));


const mockUseLeagueStore = useLeagueStore as unknown as jest.Mock;
const mockUseGitHubData = useGitHubData as unknown as jest.Mock;

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  editingPlayerId: null,
  onSave: jest.fn(),
};

const renderPlayerForm = (props: Partial<React.ComponentProps<typeof PlayerForm>> = {}) => {
  return render(<PlayerForm {...defaultProps} {...props} />);
};

afterEach(() => {
  jest.clearAllMocks();
});
describe("PlayerForm - rendering", () => {
    const data = getMockLeagueData();
    beforeEach(() => {
    mockUseLeagueStore.mockReturnValue({
      ...data,
      addPlayer: jest.fn(),
      editPlayer: jest.fn(),
    });
    mockUseGitHubData.mockReturnValue({
      uploadImage: jest.fn(),
    });
    (resetPlayerForm as jest.Mock).mockReturnValue({
      name: "",
      teamId: "team-1",
      image: null,
    });
    (populatePlayerForm as jest.Mock).mockReturnValue({
        name: "Test Player",
        teamId: "team-1",
        image: null,
    })
  });
  test("renders 'Add New Player' title when not editing", () => {
    renderPlayerForm({ editingPlayerId: null });
    expect(screen.getByText(/add new player/i)).toBeInTheDocument();

  });
  test("renders 'Edit Player' title when editing", () => {
    renderPlayerForm({ editingPlayerId: getMockPlayerByTeamId(data, "team-1").id});
    expect(screen.getByText(/edit player/i));
  });
  test("renders User icon when adding a new player (no image)", () => {
    renderPlayerForm({ editingPlayerId: null});
    const image = screen.queryByAltText("Player");
    expect(image).not.toBeInTheDocument();
});
  test("renders User icon when editing a player with no image", () => {
    const player = {...getMockPlayerById(data, "player-1"), image: null};
    renderPlayerForm({ editingPlayerId: player.id});
    const image = screen.queryByAltText("Player");
    expect(image).not.toBeInTheDocument();
  });
  test("renders player image when editing a player with an image", () => {
  const player = { ...getMockPlayerById(data, "player-1"), image: "images/player-Image.png" };
  (populatePlayerForm as jest.Mock).mockReturnValue({
    name: player.name,
    teamId: player.teamId,
    image: "images/player-Image.png",
  });
  renderPlayerForm({ editingPlayerId: player.id });
  const image = screen.getByAltText("Player");
  expect(image).toBeInTheDocument();
  expect(image).toHaveAttribute("src", "images/player-Image.png");
});
  test("renders 'Add Player' submit button when not editing", () => {
    renderPlayerForm({editingPlayerId: null});
    const addButton = screen.getByText(/add player/i);
    expect(addButton).toBeInTheDocument();
  });
  test("renders 'Update Player' submit button when editing", () => {
    const playerId = getMockPlayerById(data, "player-1").id;
    renderPlayerForm({editingPlayerId: playerId});
    const updateButton = screen.getByText(/update player/i);
    expect(updateButton).toBeInTheDocument();
});
  
  test("renders info message when editing a player", () => {
    const playerId = getMockPlayerById(data, "player-1").id;
    renderPlayerForm({editingPlayerId: playerId});
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });
});

describe("PlayerForm - form behavior", () => {
  test("populates form fields when editing a player", () => {});
  test("resets form fields when adding a new player", () => {});
  test("disables team select when player has goals", () => {});
  test("submit button is disabled when uploading", () => {});
  test("does not submit when name is empty", () => {});
});

describe("PlayerForm - actions", () => {
  test("calls addPlayer when submitting a new player", () => {});
  test("calls editPlayer when submitting an edited player", () => {});
  test("calls onOpenChange with false after successful submit", () => {});
  test("calls onSave with updated state after submit", () => {});
});