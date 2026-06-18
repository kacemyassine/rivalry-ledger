import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MatchHistory } from "@/components/MatchHistory";
import { useLeagueStore } from "@/store/leagueStore";
import {
  getMockMatchById,
  getMockLeagueData,
  getMockTeamById,
} from "tests/fixtures/mockSelectors";

jest.mock("@/store/leagueStore", () => ({
  useLeagueStore: jest.fn(),
}));

const mockUseLeagueStore = useLeagueStore as unknown as jest.Mock;

jest.mock("lucide-react", () => ({
  Shield: () => <div data-testid="shield-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  X: () => <div data-testid="x-icon" />,
  Edit2: () => <div data-testid="edit2-icon" />,
  Trash2: () => <div data-testid="trash2-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
}));

const defaultProps = {
  theme: "default" as const,
  onEditMatch: jest.fn(),
  onDeleteMatch: jest.fn(),
};

const data = getMockLeagueData({ withScorers: true });

const mockStoreBase = (overrides = {}) => ({
  matches: [],
  teams: getMockLeagueData().teams,
  players: getMockLeagueData().players,
  ...overrides,
});

const setMockStore = (overrides = {}) =>
  mockUseLeagueStore.mockReturnValue(mockStoreBase(overrides));

const renderMatchHistory = (
  props?: Partial<React.ComponentProps<typeof MatchHistory>>,
) => {
  render(<MatchHistory {...defaultProps} {...props} />);
};

const getMatchesNumbers = () => screen.getAllByText(/#\d+/);

const getThreeDotsButton = (matchId: string) =>
  within(getMatchRow(matchId)).getByRole("button");

const getMatchRow = (matchId: string) => screen.getByTestId(matchId);
const displayedMatches = [...data.matches].reverse().slice(0, 10);
const lastPlayedMatchId = displayedMatches[0].id;

// Default store state for every test in this file. Individual tests can
// still call setMockStore(...) themselves to override (e.g. the empty-state
// test below), but no describe block should depend on another block's
// beforeEach having already run earlier in file order.
beforeEach(() => {
  setMockStore({ matches: data.matches });
});

describe("MatchHistory - rendering", () => {
  const getRecentMatchesTitle = () => screen.getByText(/recent matches/i);
  const getEmptyStateMessage = () => screen.getByText(/no matches played yet/i);

  test("renders 'Recent Matches' title by default", () => {
    renderMatchHistory();
    expect(getRecentMatchesTitle()).toBeInTheDocument();
  });

  test("renders empty state message when no matches", () => {
    setMockStore();
    renderMatchHistory();
    expect(getEmptyStateMessage()).toBeInTheDocument();
  });

  test("renders only 10 matches by default when more than 10 exist", () => {
    renderMatchHistory();
    expect(getMatchesNumbers()).toHaveLength(10);
  });

  test("renders home and away team names", () => {
    renderMatchHistory();
    displayedMatches.forEach((match) => {
      const row = getMatchRow(match.id);
      expect(row).toHaveTextContent(
        getMockTeamById(data, match.homeTeamId).name,
      );
      expect(row).toHaveTextContent(
        getMockTeamById(data, match.awayTeamId).name,
      );
    });
  });

  test("renders score for each match", () => {
    renderMatchHistory();
    displayedMatches.forEach((match) => {
      const row = getMatchRow(match.id);
      expect(row).toHaveTextContent(String(match.awayGoals));
      expect(row).toHaveTextContent(String(match.homeGoals));
    });
  });

  test("renders Shield icon when team has no logo", () => {
    const teamsWithoutLogos = data.teams.map((t) => ({ ...t, logo: "" }));
    setMockStore({ matches: data.matches, teams: teamsWithoutLogos });
    renderMatchHistory();
    expect(screen.getAllByTestId("shield-icon").length).toBe(20);
  });

  test("renders team logo img when team has a logo", () => {
    const teamsWithLogos = data.teams.map((team, index) => ({
      ...team,
      logo: `images/team${index + 1}-logo.png`,
    }));
    setMockStore({ matches: data.matches, teams: teamsWithLogos });
    renderMatchHistory();
    displayedMatches.forEach((match) => {
      const matchRow = getMatchRow(match.id);
      const { getByRole } = within(matchRow);
      const displayedTeam1Image = getByRole("img", {
        name: getMockTeamById(data, "team-1").name,
      });
      const displayedTeam2Image = getByRole("img", {
        name: getMockTeamById(data, "team-2").name,
      });
      expect(displayedTeam1Image).toHaveAttribute(
        "src",
        "images/team1-logo.png",
      );
      expect(displayedTeam2Image).toHaveAttribute(
        "src",
        "images/team2-logo.png",
      );
    });
  });
});

describe("MatchHistory - pagination", () => {
  const getShowAllButton = (exists: boolean = true) =>
    exists
      ? screen.getByRole("button", { name: /show all/i })
      : screen.queryByRole("button", { name: /show all/i });
  const getShowLessButton = (exists: boolean = true) =>
    exists
      ? screen.getByRole("button", { name: /show less/i })
      : screen.queryByRole("button", { name: /show less/i });
  const getAllMatchesTitle = () => screen.getByText(/all matches/i);

  test("renders Show All button when more than 10 matches exist", () => {
    renderMatchHistory(); // 11 matches exist.
    expect(getShowAllButton()).toBeInTheDocument();
  });
  test("does not render Show All button when 10 or fewer matches", () => {
    setMockStore({ matches: data.matches.slice(0, 9) });
    renderMatchHistory();
    expect(getShowAllButton(false)).not.toBeInTheDocument();
  });
  test("renders all matches after clicking Show All", async () => {
    renderMatchHistory();
    await userEvent.click(getShowAllButton()!);
    expect(getMatchesNumbers()).toHaveLength(data.matches.length);
  });
  test("renders 'All Matches' title after clicking Show All", async () => {
    renderMatchHistory();
    await userEvent.click(getShowAllButton()!);
    expect(getAllMatchesTitle()).toBeInTheDocument();
  });
  test("collapses back to 10 matches after clicking Show Less", async () => {
    renderMatchHistory();
    await userEvent.click(getShowAllButton()!);
    await userEvent.click(getShowLessButton()!);
    expect(getMatchesNumbers()).toHaveLength(10);
  });
});

describe("MatchHistory - match detail popup", () => {
  const getMatchPopup = (matchId: string, exists: boolean = true) =>
    exists
      ? screen.getByTestId(`${matchId}-popup`)
      : screen.queryByTestId(`${matchId}-popup`);
  const getMatchBackdrop = (matchId: string) =>
    screen.getByTestId(`${matchId}-backdrop`);
  const getMatchPopupCloseButton = (matchId: string) =>
    within(getMatchPopup(matchId)!).getByRole("button");
  // const getMatchDetailsHeading = () => screen.getByText(/match details/i);
  const openMatchPopup = async (matchId: string) => {
    await userEvent.click(getMatchRow(matchId));
    return getMatchPopup(matchId);
  };
  test("opens match detail popup when a match row is clicked", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      expect(getMatchPopup(match.id)).toBeInTheDocument();
    }
  });
  test("renders Match Details heading in popup", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      const { getByText } = within(getMatchPopup(match.id)!);
      expect(getByText(/match details/i)).toBeInTheDocument();
    }
  });
  test("renders correct score in popup", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);

      const scoreContainer = within(getMatchPopup(match.id)!).getByTestId(
        "popup-score",
      );
      expect(scoreContainer).toHaveTextContent(String(match.homeGoals));
      expect(scoreContainer).toHaveTextContent(String(match.awayGoals));
    }
  });
  test("renders home and away scorers in popup", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      const matchPopup = getMatchPopup(match.id);
      const homeScorers = match.scorers.filter(
        (s) =>
          data.players.find((p) => p.id === s.playerId)?.teamId ===
          match.homeTeamId,
      );
      const awayScorers = match.scorers.filter(
        (s) =>
          data.players.find((p) => p.id === s.playerId)?.teamId ===
          match.awayTeamId,
      );
      const homeScorersContainer = within(matchPopup!).getByTestId(
        "home-scorers",
      );
      const awayScorersContainer = within(matchPopup!).getByTestId(
        "away-scorers",
      );

      homeScorers.forEach((s) => {
        const player = data.players.find((p) => p.id === s.playerId)!;
        expect(homeScorersContainer).toHaveTextContent(player.name);
        expect(homeScorersContainer).toHaveTextContent(String(s.goals));
      });
      awayScorers.forEach((s) => {
        const player = data.players.find((p) => p.id === s.playerId)!;
        expect(awayScorersContainer).toHaveTextContent(player.name);
        expect(awayScorersContainer).toHaveTextContent(String(s.goals));
      });
    }
  });
  test("closes popup when clicking the backdrop", async () => {
    renderMatchHistory();
    await openMatchPopup(lastPlayedMatchId);
    await userEvent.click(getMatchBackdrop(lastPlayedMatchId));
    expect(getMatchPopup(lastPlayedMatchId, false)).not.toBeInTheDocument();
  });
  test("closes popup when clicking the X button", async () => {
    renderMatchHistory();
    await openMatchPopup(lastPlayedMatchId);
    await userEvent.click(getMatchPopupCloseButton(lastPlayedMatchId));
    expect(getMatchPopup(lastPlayedMatchId, false)).not.toBeInTheDocument();
  });
});

describe("MatchHistory - context menu", () => {
  const getMoreVerticalIcons = (exists: boolean = true) =>
    exists
      ? screen.getAllByTestId("more-vertical-icon")
      : screen.queryByTestId("more-vertical-icon");
  const getContextMenu = (exists: boolean = true) =>
    exists
      ? screen.getByTestId("context-menu")
      : screen.queryByTestId("context-menu");
  const getEditMatchMenuItem = () => screen.getByText(/edit match/i);
  const getContextMenuBackdrop = () =>
    screen.getByTestId("context-menu-backdrop");
  test("does not render three-dots button when no admin callbacks provided", () => {
    renderMatchHistory({ onEditMatch: undefined, onDeleteMatch: undefined });
    expect(getMoreVerticalIcons(false)).not.toBeInTheDocument();
  });
  test("renders three-dots button when onEditMatch is provided", () => {
    renderMatchHistory({ onEditMatch: jest.fn(), onDeleteMatch: undefined });
    expect((getMoreVerticalIcons() as HTMLElement[]).length).toBe(10); // 1 for each row , by default 10 rows .
  });
  test("renders three-dots button when onDeleteMatch is provided", () => {
    renderMatchHistory({ onEditMatch: undefined, onDeleteMatch: jest.fn() });
    expect((getMoreVerticalIcons() as HTMLElement[]).length).toBe(10); // 1 for each row , by default 10 rows .
  });
  test("opens context menu when three-dots button is clicked", async () => {
    renderMatchHistory();
    await userEvent.click(getThreeDotsButton(lastPlayedMatchId));
    expect(getContextMenu()).toBeInTheDocument();
  });
  test("closes context menu when clicking outside", async () => {
    renderMatchHistory();
    await userEvent.click(getThreeDotsButton(lastPlayedMatchId));
    expect(getContextMenu()).toBeInTheDocument();
    await userEvent.click(getContextMenuBackdrop());
    expect(getContextMenu(false)).not.toBeInTheDocument();
  });
  test("calls onEditMatch with correct match when Edit is clicked", async () => {
    const onEditMatch = jest.fn();
    renderMatchHistory({ onEditMatch });
    await userEvent.click(getThreeDotsButton(lastPlayedMatchId));
    await userEvent.click(getEditMatchMenuItem());
    expect(onEditMatch).toHaveBeenCalledWith(
      getMockMatchById(data, lastPlayedMatchId),
    );
  });
});

describe("MatchHistory - delete confirmation", () => {
  const getDeleteConfirmationDialog = (exists: boolean = true) =>
    exists
      ? screen.getByTestId("delete-confirmation-dialog")
      : screen.queryByTestId("delete-confirmation-dialog");
  const getDialogCancelButton = () =>
    screen.getByRole("button", { name: /cancel/i });
  const getDialogDeleteButton = () =>
    screen.getByRole("button", { name: /delete/i });
  const openDeleteDialog = async (
    props?: Partial<React.ComponentProps<typeof MatchHistory>>,
  ) => {
    renderMatchHistory(props);
    await userEvent.click(getThreeDotsButton(lastPlayedMatchId));
    await userEvent.click(screen.getByText(/delete match/i));
  };

  test("opens delete confirmation dialog when Delete is clicked in context menu", async () => {
    await openDeleteDialog();
    expect(getDeleteConfirmationDialog()).toBeInTheDocument();
  });

  test("closes delete dialog when Cancel is clicked", async () => {
    await openDeleteDialog();
    await userEvent.click(getDialogCancelButton());
    expect(getDeleteConfirmationDialog(false)).not.toBeInTheDocument();
  });

  test("calls onDeleteMatch with correct matchId when Delete is confirmed", async () => {
    const onDeleteMatch = jest.fn();
    await openDeleteDialog({ onDeleteMatch });
    await userEvent.click(getDialogDeleteButton());
    expect(onDeleteMatch).toHaveBeenCalledWith(lastPlayedMatchId);
  });
});