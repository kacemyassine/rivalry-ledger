import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerForm } from "@/components/PlayerForm";
import { useLeagueStore } from "@/store/leagueStore";
import { useGitHubData } from "@/hooks/useGitHubData";
import {
  populatePlayerForm,
  resetPlayerForm,
} from "@/lib/playerFormUtils";
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
  AlertCircle: () => <div data-testId="alert-circle-icon" />,
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
    });
  });
  test("renders 'Add New Player' title when not editing", () => {
    renderPlayerForm({ editingPlayerId: null });
    expect(screen.getByText(/add new player/i)).toBeInTheDocument();
  });
  test("renders 'Edit Player' title when editing", () => {
    renderPlayerForm({
      editingPlayerId: getMockPlayerByTeamId(data, "team-1").id,
    });
    expect(screen.getByText(/edit player/i));
  });
  test("renders User icon when adding a new player (no image)", () => {
    renderPlayerForm({ editingPlayerId: null });
    const image = screen.queryByAltText("Player");
    expect(image).not.toBeInTheDocument();
  });
  test("renders User icon when editing a player with no image", () => {
    const player = { ...getMockPlayerById(data, "player-1"), image: null };
    renderPlayerForm({ editingPlayerId: player.id });
    const image = screen.queryByAltText("Player");
    expect(image).not.toBeInTheDocument();
  });
  test("renders player image when editing a player with an image", () => {
    const player = {
      ...getMockPlayerById(data, "player-1"),
      image: "images/player-Image.png",
    };
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
    renderPlayerForm({ editingPlayerId: null });
    const addButton = screen.getByText(/add player/i);
    expect(addButton).toBeInTheDocument();
  });
  test("renders 'Update Player' submit button when editing", () => {
    const playerId = getMockPlayerById(data, "player-1").id;
    renderPlayerForm({ editingPlayerId: playerId });
    const updateButton = screen.getByText(/update player/i);
    expect(updateButton).toBeInTheDocument();
  });

  test("renders info message when editing a player", () => {
    const playerId = getMockPlayerById(data, "player-1").id;
    renderPlayerForm({ editingPlayerId: playerId });
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });
});

describe("PlayerForm - form behavior", () => {
  const data = getMockLeagueData();
  test("populates form fields when editing a player", () => {
    const playerId = getMockPlayerById(data, "player-1").id;
    renderPlayerForm({ editingPlayerId: playerId });
    const playerNameField = screen.getByLabelText(/player name/i);
    const PlayerTeamField = screen.getByRole("combobox");
    expect(playerNameField).toHaveValue("Test Player");
    expect(PlayerTeamField).toHaveTextContent(
      getMockTeamById(data, "team-1").name,
    );
  });
  test("resets form fields when adding a new player", () => {
    renderPlayerForm();
    const playerNameField = screen.getByLabelText(/player name/i);
    const PlayerTeamField = screen.getByLabelText(/team/i);
    expect(playerNameField).toHaveValue("");
    // displaying first team name by default since its the team name with index 0
    expect(PlayerTeamField).toHaveTextContent(
      getMockTeamById(data, "team-1").name,
    );
  });
  test.todo("submit button is disabled when uploading");
  test("does not submit when name is empty", async () => {
    const addPlayer = jest.fn();
    mockUseLeagueStore.mockReturnValue({
      ...data,
      addPlayer,
      editPlayer: jest.fn(),
    });
    renderPlayerForm();
    await userEvent.click(screen.getByRole("button", { name: /add player/i }));
    expect(addPlayer).not.toHaveBeenCalled();
  });

  test("displays error when player name is empty", async () => {
    renderPlayerForm();
    await userEvent.click(screen.getByLabelText(/player name/i));
    await userEvent.click(screen.getByRole("button", { name: /add player/i }));
    expect(screen.getByTestId("form-error")).toBeInTheDocument();
    expect(screen.getByTestId("form-error")).toHaveTextContent(
      /player name is required/i,
    );
  });
  test("displays error when addPlayer throws", async () => {
  const addPlayer = jest.fn().mockImplementation(() => {
    throw new Error("Player already exists");
  });
  mockUseLeagueStore.mockReturnValue({
    ...data,
    addPlayer,
    editPlayer: jest.fn(),
  });
  renderPlayerForm();
  await userEvent.type(screen.getByLabelText(/player name/i), "John Doe");
  await userEvent.click(screen.getByRole("button", { name: /add player/i }));
  expect(screen.getByTestId("form-error")).toHaveTextContent("Player already exists");
});

test("displays error when editPlayer throws", async () => {
  const editPlayer = jest.fn().mockImplementation(() => {
    throw new Error("Player not found");
  });
  mockUseLeagueStore.mockReturnValue({
    ...data,
    addPlayer: jest.fn(),
    editPlayer,
  });
  const playerId = getMockPlayerById(data, "player-1").id;
  renderPlayerForm({ editingPlayerId: playerId });
  await userEvent.clear(screen.getByLabelText(/player name/i));
  await userEvent.type(screen.getByLabelText(/player name/i), "New Name");
  await userEvent.click(screen.getByRole("button", { name: /update player/i }));
  expect(screen.getByTestId("form-error")).toHaveTextContent("Player not found");
});

test("clears error when user starts typing", async () => {
  const addPlayer = jest.fn().mockImplementation(() => {
    throw new Error("Player already exists");
  });
  mockUseLeagueStore.mockReturnValue({
    ...data,
    addPlayer,
    editPlayer: jest.fn(),
  });
  renderPlayerForm();
  await userEvent.type(screen.getByLabelText(/player name/i), "John Doe");
  await userEvent.click(screen.getByRole("button", { name: /add player/i }));
  expect(screen.getByTestId("form-error")).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText(/player name/i), "x");
  expect(screen.queryByTestId("form-error")).not.toBeInTheDocument();
});
});

describe("PlayerForm - actions", () => {
  const data = getMockLeagueData();
  beforeAll(() => {
  Object.defineProperty(useLeagueStore, 'getState', {
    value: jest.fn().mockReturnValue({
      players: data.players,
      teams: data.teams,
      matches: data.matches,
    }),
    writable: true,
  });
});
  afterEach(() => {
    jest.clearAllMocks();
  })
  test("calls addPlayer when submitting a new player", async () => {
    const addPlayer = jest.fn();
    mockUseLeagueStore.mockReturnValue({
      ...data,
      addPlayer,
      editPlayer: jest.fn(),
    })
    renderPlayerForm();
    await userEvent.type(screen.getByLabelText(/player name/i), "John Doe");
    await userEvent.click(screen.getByRole("button", { name: /add player/i }));
    expect(addPlayer).toHaveBeenCalled();
  });
  test("calls editPlayer when submitting an edited player", async () => {
    const editPlayer = jest.fn();
    const playerId = getMockPlayerById(data, "player-1").id
    mockUseLeagueStore.mockReturnValue({
      ...data,
      addPlayer: jest.fn(),
      editPlayer,
    })
    renderPlayerForm({editingPlayerId: playerId})
    await userEvent.type(screen.getByLabelText(/player name/i), "New Name");
    await userEvent.click(screen.getByRole("button", { name: /update player/i }));
    expect(editPlayer).toHaveBeenCalled();
  });
  test("calls onOpenChange with false after successful submit (when adding)", async () => {
  const onOpenChange = jest.fn();
  jest.spyOn(useLeagueStore, 'getState').mockReturnValue({
  players: data.players,
  teams: data.teams,
  matches: data.matches,
} as any);
  renderPlayerForm({ onOpenChange });
  await userEvent.type(screen.getByLabelText(/player name/i), "John Doe");
  await userEvent.click(screen.getByRole("button", { name: /add player/i }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("calls onOpenChange with false after successful submit (when editing)", async () => {
  const onOpenChange = jest.fn();
  const playerId = getMockPlayerById(data, "player-1").id;
  mockUseLeagueStore.mockReturnValue({
    ...data,
    addPlayer: jest.fn(),
    editPlayer: jest.fn(),
  });
  renderPlayerForm({ editingPlayerId: playerId, onOpenChange });
  await userEvent.type(screen.getByLabelText(/player name/i), "New Name");
  await userEvent.click(screen.getByRole("button", { name: /update player/i }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("calls onSave with updated state after submit", async () => {
  const onSave = jest.fn();
  mockUseLeagueStore.mockReturnValue({
    ...data,
    addPlayer: jest.fn(),
    editPlayer: jest.fn(),
  });
  renderPlayerForm({ onSave });
  await userEvent.type(screen.getByLabelText(/player name/i), "John Doe");
  await userEvent.click(screen.getByRole("button", { name: /add player/i }));
  expect(onSave).toHaveBeenCalled();
});
});
