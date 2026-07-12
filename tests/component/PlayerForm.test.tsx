import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerForm } from "@/components/PlayerForm";
import { useLeagueStore } from "@/store/leagueStore";
import { useGitHubData } from "@/hooks/useGitHubData";
import { populatePlayerForm, resetPlayerForm } from "@/lib/playerFormUtils";
import {
  getMockLeagueData,
  getMockPlayerById,
  getMockPlayerByTeamId,
  getMockTeamById,
} from "tests/fixtures/mockSelectors";

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
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

const mockUseLeagueStore = useLeagueStore as unknown as jest.Mock;
const mockUseGitHubData = useGitHubData as unknown as jest.Mock;

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  editingPlayerId: null,
  onSave: jest.fn(),
};

const renderPlayerForm = (
  props: Partial<React.ComponentProps<typeof PlayerForm>> = {},
) => {
  return render(<PlayerForm {...defaultProps} {...props} />);
};

const data = getMockLeagueData();

const mockStoreBase = (overrides = {}) => ({
  ...data,
  addPlayer: jest.fn(),
  editPlayer: jest.fn(),
  ...overrides,
});

const mockGetState = () => {
  (useLeagueStore as unknown as { getState: jest.Mock }).getState = jest
    .fn()
    .mockReturnValue({
      players: data.players,
      teams: data.teams,
      matches: data.matches,
    });
};

const setMockStore = (overrides = {}) =>
  mockUseLeagueStore.mockReturnValue(mockStoreBase(overrides));

const setMockGitHub = () =>
  mockUseGitHubData.mockReturnValue({ uploadImage: jest.fn() });

const setMockPopulatePlayerForm = (overrides = {}) =>
  (populatePlayerForm as jest.Mock).mockReturnValue({
    name: "Test Player",
    teamId: "team-1",
    image: null,
    ...overrides,
  });

const setMockResetPlayerForm = () =>
  (resetPlayerForm as jest.Mock).mockReturnValue({
    name: "",
    teamId: "team-1",
    image: null,
  });

const playerId = getMockPlayerById(data, "player-1").id;

const getAddPlayerButton = () =>
  screen.getByRole("button", { name: /add player/i });
const getUpdatePlayerButton = () =>
  screen.getByRole("button", { name: /update player/i });
const getPlayerNameField = () => screen.getByLabelText(/player name/i);

const submitPlayerForm = async (
  name: string = "",
  mode: "add" | "update" = "add",
) => {
  if (name) await userEvent.type(getPlayerNameField(), name);
  await userEvent.click(
    mode === "add" ? getAddPlayerButton() : getUpdatePlayerButton(),
  );
};

// Default mock setup for every test in this file. Individual tests can
// still call setMockStore(...) / setMockPopulatePlayerForm(...) etc.
// themselves to override, but no describe block should depend on another
// block's beforeEach having already run earlier in file order.
beforeEach(() => {
  setMockStore();
  setMockGitHub();
  setMockPopulatePlayerForm();
  setMockResetPlayerForm();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("PlayerForm - rendering", () => {
  const getFormTitle = (text: RegExp) => screen.getByText(text);
  const getPlayerImage = (exists: boolean = true) =>
    exists ? screen.getByAltText("Player") : screen.queryByAltText("Player");

  test("renders 'Add New Player' title when not editing", () => {
    renderPlayerForm({ editingPlayerId: null });
    expect(getFormTitle(/add new player/i)).toBeInTheDocument();
  });
  test("renders 'Edit Player' title when editing", () => {
    renderPlayerForm({
      editingPlayerId: getMockPlayerByTeamId(data, "team-1").id,
    });
    expect(getFormTitle(/edit player/i)).toBeInTheDocument();
  });
  test("renders User icon when adding a new player (no image)", () => {
    renderPlayerForm({ editingPlayerId: null });
    expect(getPlayerImage(false)).not.toBeInTheDocument();
  });
  test("renders User icon when editing a player with no image", () => {
    const player = { ...getMockPlayerById(data, "player-1"), image: null };
    renderPlayerForm({ editingPlayerId: player.id });
    expect(getPlayerImage(false)).not.toBeInTheDocument();
  });
  test("renders player image when editing a player with an image", () => {
    setMockPopulatePlayerForm({ image: "images/player-Image.png" });
    renderPlayerForm({
      editingPlayerId: getMockPlayerById(data, "player-1").id,
    });
    const image = getPlayerImage();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "images/player-Image.png");
  });
  test("renders 'Add Player' submit button when not editing", () => {
    renderPlayerForm({ editingPlayerId: null });
    expect(getAddPlayerButton()).toBeInTheDocument();
  });
  test("renders 'Update Player' submit button when editing", () => {
    renderPlayerForm({ editingPlayerId: playerId });
    expect(getUpdatePlayerButton()).toBeInTheDocument();
  });

  test("renders info message when editing a player", () => {
    renderPlayerForm({ editingPlayerId: playerId });
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });
});

describe("PlayerForm - form behavior", () => {
  const getPlayerTeamField = () => screen.getByRole("combobox");
  const getFormError = (exists: boolean = true) =>
    exists
      ? screen.getByTestId("form-error")
      : screen.queryByTestId("form-error");
  const playerTeam = getMockTeamById(data, "team-1").name;
  test("populates form fields when editing a player", () => {
    renderPlayerForm({ editingPlayerId: playerId });
    expect(getPlayerNameField()).toHaveValue("Test Player");
    expect(getPlayerTeamField()).toHaveTextContent(playerTeam);
  });
  test("resets form fields when adding a new player", () => {
    renderPlayerForm();
    const playerNameField = screen.getByLabelText(/player name/i);
    const PlayerTeamField = screen.getByLabelText(/team/i);
    expect(playerNameField).toHaveValue("");
    // displaying first team name by default since its the team name with index 0
    expect(PlayerTeamField).toHaveTextContent(playerTeam);
  });
  test.todo("submit button is disabled when uploading");
  test("does not submit when name is empty", async () => {
    const addPlayer = jest.fn();
    setMockStore({ addPlayer });
    renderPlayerForm();
    await submitPlayerForm("", "add");
    expect(addPlayer).not.toHaveBeenCalled();
  });

  test("displays error when player name is empty", async () => {
    renderPlayerForm();
    await submitPlayerForm("", "add");
    expect(getFormError()).toBeInTheDocument();
    expect(getFormError()).toHaveTextContent(/player name is required/i);
  });
  test("displays error when addPlayer throws", async () => {
    const addPlayer = jest.fn().mockImplementation(() => {
      throw new Error("Player already exists");
    });
    setMockStore({ addPlayer });
    renderPlayerForm();
    await submitPlayerForm("John Doe", "add");
    expect(getFormError()).toHaveTextContent("Player already exists");
  });

  test("displays error when editPlayer throws", async () => {
    const editPlayer = jest.fn().mockImplementation(() => {
      throw new Error("Player not found");
    });
    setMockStore({ editPlayer });
    renderPlayerForm({ editingPlayerId: playerId });
    const playerNameField = getPlayerNameField();
    await userEvent.clear(playerNameField);
    await submitPlayerForm("New Name", "update");
    expect(getFormError()).toHaveTextContent("Player not found");
  });

  test("clears error when user starts typing", async () => {
    const addPlayer = jest.fn().mockImplementation(() => {
      throw new Error("Player already exists");
    });
    setMockStore({ addPlayer });
    renderPlayerForm();
    const playerNameField = getPlayerNameField();
    await submitPlayerForm("John Doe", "add");
    expect(getFormError()).toBeInTheDocument();
    await userEvent.type(playerNameField, "x");
    expect(getFormError(false)).not.toBeInTheDocument();
  });
});

describe("PlayerForm - actions", () => {
  beforeEach(() => {
    mockGetState();
  });
  test("calls addPlayer when submitting a new player", async () => {
    const addPlayer = jest.fn();
    setMockStore({ addPlayer });
    renderPlayerForm();
    await submitPlayerForm("John Doe", "add");
    expect(addPlayer).toHaveBeenCalled();
  });
  test("calls editPlayer when submitting an edited player", async () => {
    const editPlayer = jest.fn();
    setMockStore({ editPlayer });
    renderPlayerForm({ editingPlayerId: playerId });
    await submitPlayerForm("New Name", "update");
    expect(editPlayer).toHaveBeenCalled();
  });
  test("calls onOpenChange with false after successful submit (when adding)", async () => {
    const onOpenChange = jest.fn();
    renderPlayerForm({ onOpenChange });
    await submitPlayerForm("John Doe", "add");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("calls onOpenChange with false after successful submit (when editing)", async () => {
    const onOpenChange = jest.fn();
    renderPlayerForm({ editingPlayerId: playerId, onOpenChange });
    await submitPlayerForm("New Name", "update");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("calls onSave with updated state after submit", async () => {
    const onSave = jest.fn();
    renderPlayerForm({ onSave });
    await submitPlayerForm("John Doe", "add");
    expect(onSave).toHaveBeenCalled();
  });
});