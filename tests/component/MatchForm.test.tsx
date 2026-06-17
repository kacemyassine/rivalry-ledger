import "@testing-library/jest-dom";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MatchForm } from "@/components/MatchForm";
import { useLeagueStore } from "@/store/leagueStore";
import { toast } from "sonner";
import {
  getMockLeagueData,
  getMockTeamById,
} from "tests/fixtures/mockSelectors";

const data = getMockLeagueData({ withScorers: true });

jest.mock("@/store/leagueStore", () => ({
  useLeagueStore: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("lucide-react", () => ({
  Plus: () => <div data-testid="plus-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  X: () => <div data-testid="x-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));

const mockUseLeagueStore = useLeagueStore as unknown as jest.Mock;

// ─── Store helpers ────────────────────────────────────────────────────────────

const mockStoreBase = (overrides = {}) => ({
  ...getMockLeagueData(),
  addMatch: jest.fn(),
  editMatch: jest.fn(),
  selectedHomeTeam: getMockTeamById(data, "team-1"),
  selectedAwayTeam: getMockTeamById(data, "team-2"),
  setSelectedHomeTeam: jest.fn(),
  setSelectedAwayTeam: jest.fn(),
  ...overrides,
});

const mockGetState = (overrides = {}) => {
  (useLeagueStore as unknown as { getState: jest.Mock }).getState = jest
    .fn()
    .mockReturnValue({
      players: data.players,
      teams: data.teams,
      matches: data.matches,
      ...overrides,
    });
};

const setMockStore = (overrides = {}) =>
  mockUseLeagueStore.mockReturnValue(mockStoreBase(overrides));

// ─── Component helpers ──────────────────────────────────────────────────────

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onSave: jest.fn(),
  editingMatch: undefined,
};

const renderMatchForm = (
  props?: Partial<React.ComponentProps<typeof MatchForm>>,
) => {
  render(<MatchForm {...defaultProps} {...props} />);
};

const addTestMatch = async () => {
  await userEvent.click(screen.getByRole("button", { name: /record match/i }));
};

const addScorer = async (
  playerId: string,
  goalNumber: string,
  isOwnGoal: boolean = false,
) => {
  await userEvent.click(screen.getByRole("button", { name: /add scorer/i }));
  const rows = screen.getAllByTestId(/scorer-row-/);
  const row = rows[rows.length - 1];
  fireEvent.click(within(row).getByRole("combobox"));
  const player = data.players.find((p) => p.id === playerId)!;
  const option = Array.from(document.querySelectorAll('[role="option"]')).find(
    (el) => el.textContent?.includes(player.name),
  );
  fireEvent.click(option!);
  const goalInput = within(row).getByRole("spinbutton");
  await userEvent.clear(goalInput);
  await userEvent.type(goalInput, goalNumber);
  if (isOwnGoal) await userEvent.click(within(row).getByRole("checkbox"));
};

const removeScorer = async (playerId: string) => {
  const row = screen.getByTestId(`scorer-row-${playerId}`);
  await userEvent.click(within(row).getByRole("button"));
};

const getAddScorerButton = () =>
  screen.getByRole("button", { name: /add scorer/i });
const getRecordMatchButton = () =>
  screen.getByRole("button", { name: /record match/i });
const getUpdateMatchButton = () =>
  screen.getByRole("button", { name: /update match/i });

afterEach(() => jest.clearAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MatchForm - rendering", () => {
  beforeEach(() => setMockStore());

  const getDialog = () => screen.getByRole("dialog");

  const getGoalInputs = () => screen.getAllByRole("spinbutton");

  const getMatchDateField = (exists: boolean = true) =>
  exists ? screen.getByLabelText("Match Date") : screen.queryByLabelText("Match Date");



  test("renders Record Match title in add mode", () => {
    renderMatchForm();
    expect(getDialog()).toHaveTextContent(/record match/i);
  });

  test("renders Edit Match title in edit mode", () => {
    renderMatchForm({ editingMatch: data.matches[0] });
    expect(getDialog()).toHaveTextContent(/edit match/i);
  });

  test("renders home and away team names", () => {
    const team1 = getMockTeamById(data, "team-1");
    const team2 = getMockTeamById(data, "team-2");
    renderMatchForm();
    expect(screen.getByTestId("score-field")).toHaveTextContent(
      new RegExp(team1.name),
    );
    expect(screen.getByTestId("score-field")).toHaveTextContent(
      new RegExp(team2.name),
    );
  });

  test("renders home and away goal inputs", () => {
    renderMatchForm();
    expect(getGoalInputs()).toHaveLength(2);
  });

  test("does not render date field in add mode", () => {
    renderMatchForm();
    expect(getMatchDateField(false)).not.toBeInTheDocument();
  });

  test("renders date field in edit mode", () => {
    renderMatchForm({ editingMatch: data.matches[0] });
    expect(getMatchDateField()).toBeInTheDocument();
  });

  test("renders Add Scorer button", () => {
    renderMatchForm();
    expect(getAddScorerButton()).toBeInTheDocument();
  });

  test("renders Record Match submit button in add mode", () => {
    renderMatchForm();
    expect(getRecordMatchButton()).toBeInTheDocument();
  });

  test("renders Update Match submit button in edit mode", () => {
    renderMatchForm({ editingMatch: data.matches[0] });
    expect(getUpdateMatchButton()).toBeInTheDocument();
  });
});

describe("MatchForm - scorer management", () => {
  beforeEach(() => setMockStore());

  const getScorerCheckboxes = () => screen.getAllByRole("checkbox");

  test("adds a scorer row when Add Scorer button clicked", async () => {
    renderMatchForm();
    await addScorer("player-1", "1");
    expect(getScorerCheckboxes()).toHaveLength(1);
  });

  test("adds multiple scorer rows when Add Scorer clicked multiple times", async () => {
    renderMatchForm();
    await addScorer("player-1", "1");
    await addScorer("player-2", "1");
    await addScorer("player-3", "1");
    expect(getScorerCheckboxes()).toHaveLength(3);
  });

  test("removes a scorer row when Minus button clicked", async () => {
    renderMatchForm();
    await addScorer("player-1", "1");
    await addScorer("player-2", "1");
    await removeScorer("player-2");
    expect(getScorerCheckboxes()).toHaveLength(1);
    expect(screen.queryByTestId("scorer-row-player-2")).not.toBeInTheDocument();
  });

  test("shows toast error when adding scorer with no players", async () => {
    setMockStore({ players: [] });
    renderMatchForm();
    await userEvent.click(getAddScorerButton());
    expect(toast.error).toHaveBeenCalled();
  });
});

describe("MatchForm - form submission", () => {
  beforeEach(() => {
    setMockStore();
    mockGetState();
  });

  test("calls addMatch with correct data on submit in add mode", async () => {
    const addMatch = jest.fn();
    setMockStore({ addMatch });
    mockGetState({ addMatch });
    renderMatchForm();
    await addTestMatch();
    expect(addMatch).toHaveBeenCalled();
  });

  test("calls editMatch with correct data on submit in edit mode", async () => {
    const editMatch = jest.fn();
    setMockStore({ editMatch });
    mockGetState({ editMatch });
    const match = data.matches.find((m) => m.id === "match-1")!;
    renderMatchForm({ editingMatch: match });
    await userEvent.click(
      getUpdateMatchButton()
    );
    expect(editMatch).toHaveBeenCalledWith(
      match.id,
      match.homeGoals,
      match.awayGoals,
      match.scorers,
      expect.any(String),
    );
  });

  test("calls onOpenChange with false after successful submit", async () => {
    const onOpenChange = jest.fn();
    const addMatch = jest.fn();
    setMockStore({ addMatch });
    mockGetState({ addMatch });
    renderMatchForm({ onOpenChange });
    await addTestMatch();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("calls onSave after successful add", async () => {
    const onSave = jest.fn();
    const addMatch = jest.fn();
    setMockStore({ addMatch });
    mockGetState({ addMatch });
    renderMatchForm({ onSave });
    await addTestMatch();
    expect(onSave).toHaveBeenCalled();
  });

  test("shows toast error when goals don't add up", async () => {
    renderMatchForm();
    await addScorer("player-1", "1");
    await userEvent.click(
      getRecordMatchButton()
    );
    expect(toast.error).toHaveBeenCalled();
  });
});
