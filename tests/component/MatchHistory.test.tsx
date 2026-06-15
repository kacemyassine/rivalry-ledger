import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MatchHistory } from "@/components/MatchHistory";
import { useLeagueStore } from "@/store/leagueStore";
import {
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

const renderMatchHistory = (
  props?: Partial<React.ComponentProps<typeof MatchHistory>>,
) => {
  render(<MatchHistory {...defaultProps} {...props} />);
};

const getMatchRow = (matchId: string) => screen.getByTestId(matchId);
const displayedMatches = [...data.matches].reverse().slice(0, 10);
describe("MatchHistory - rendering", () => {
  beforeEach(() => {
    (mockUseLeagueStore as jest.Mock).mockReturnValue(
      mockStoreBase({ matches: data.matches }),
    );
  });
  test("renders 'Recent Matches' title by default", () => {
    renderMatchHistory();
    expect(screen.getByText(/recent matches/i)).toBeInTheDocument();
  });

  test("renders empty state message when no matches", () => {
    (mockUseLeagueStore as jest.Mock).mockReturnValue(mockStoreBase());
    renderMatchHistory();
    expect(screen.getByText(/no matches played yet/i)).toBeInTheDocument();
  });

  test("renders only 10 matches by default when more than 10 exist", () => {
    renderMatchHistory();
    expect(screen.getAllByText(/#\d+/)).toHaveLength(10);
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
    (mockUseLeagueStore as jest.Mock).mockReturnValue(
      mockStoreBase({ matches: data.matches, teams: teamsWithoutLogos }),
    );
    renderMatchHistory();
    expect(screen.getAllByTestId("shield-icon").length).toBe(20);
  });

  test("renders team logo img when team has a logo", () => {
    const teamsWithLogos = data.teams.map((team, index) => ({
      ...team,
      logo: `images/team${index + 1}-logo.png`,
    }));
    (mockUseLeagueStore as jest.Mock).mockReturnValue(
      mockStoreBase({ matches: data.matches, teams: teamsWithLogos }),
    );
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
  beforeEach(() => {
    (mockUseLeagueStore as jest.Mock).mockReturnValue(
      mockStoreBase({ matches: data.matches }),
    );
  });
  test("renders Show All button when more than 10 matches exist", () => {
    renderMatchHistory(); // 11 matches exist.
    expect(
      screen.getByRole("button", { name: /show all/i }),
    ).toBeInTheDocument();
  });
  test("does not render Show All button when 10 or fewer matches", () => {
    (mockUseLeagueStore as jest.Mock).mockReturnValue(
      mockStoreBase({ matches: data.matches.slice(0, 9) }),
    );
    renderMatchHistory();
    expect(
      screen.queryByRole("button", { name: /show all/i }),
    ).not.toBeInTheDocument();
  });
  test("renders all matches after clicking Show All", async () => {
    renderMatchHistory();
    const showAllButton = screen.getByRole("button", { name: /show all/i });
    await userEvent.click(showAllButton);
    expect(screen.getAllByText(/#\d+/)).toHaveLength(data.matches.length);
  });
  test("renders 'All Matches' title after clicking Show All", async () => {
    renderMatchHistory();
    const showAllButton = screen.getByRole("button", { name: /show all/i });
    await userEvent.click(showAllButton);
    expect(screen.getByText(/all matches/i)).toBeInTheDocument();
  });
  test("collapses back to 10 matches after clicking Show Less", async () => {
    renderMatchHistory();
    const showAllButton = screen.getByRole("button", { name: /show all/i });
    await userEvent.click(showAllButton);
    const showLessButton = screen.getByRole("button", { name: /show less/i });
    await userEvent.click(showLessButton);
    expect(screen.getAllByText(/#\d+/)).toHaveLength(10);
  });
});

describe("MatchHistory - match detail popup", () => {
  const openMatchPopup = async (matchId: string) => {
    await userEvent.click(getMatchRow(matchId));
    return screen.getByTestId(`${matchId}-popup`);
  };
  test("opens match detail popup when a match row is clicked", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      expect(screen.getByTestId(`${match.id}-popup`)).toBeInTheDocument();
    }
  });
  test("renders Match Details heading in popup", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      const matchPopup = screen.getByTestId(`${match.id}-popup`);
      const { getByText } = within(matchPopup);
      expect(getByText(/match details/i)).toBeInTheDocument();
    }
  });
  test("renders correct score in popup", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      const matchPopup = screen.getByTestId(`${match.id}-popup`);
      const scoreContainer = within(matchPopup).getByTestId("popup-score");
      expect(scoreContainer).toHaveTextContent(String(match.homeGoals));
      expect(scoreContainer).toHaveTextContent(String(match.awayGoals));
    }
  });
  test("renders home and away scorers in popup", async () => {
    renderMatchHistory();
    for (const match of displayedMatches) {
      await openMatchPopup(match.id);
      const matchPopup = screen.getByTestId(`${match.id}-popup`);
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
      const homeScorersContainer =
        within(matchPopup).getByTestId("home-scorers");
      const awayScorersContainer =
        within(matchPopup).getByTestId("away-scorers");

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
    await openMatchPopup(displayedMatches[0].id);
    await userEvent.click(
      screen.getByTestId(`${displayedMatches[0].id}-backdrop`),
    );
    expect(
      screen.queryByTestId(`${displayedMatches[0].id}-popup`),
    ).not.toBeInTheDocument();
  });
  test("closes popup when clicking the X button", async () => {
    renderMatchHistory();
    await openMatchPopup(displayedMatches[0].id);
    const closeButton = within(
      screen.getByTestId(`${displayedMatches[0].id}-popup`),
    ).getByRole("button");
    await userEvent.click(closeButton);
    expect(
      screen.queryByTestId(`${displayedMatches[0].id}-popup`),
    ).not.toBeInTheDocument();
  });
});

describe("MatchHistory - context menu", () => {
  test("does not render three-dots button when no admin callbacks provided", () => {
    renderMatchHistory({ onEditMatch: undefined, onDeleteMatch: undefined });
    expect(screen.queryByTestId("more-vertical-icon")).not.toBeInTheDocument();
  });
  test("renders three-dots button when onEditMatch is provided", () => {
    renderMatchHistory({ onEditMatch: jest.fn(), onDeleteMatch: undefined });
    expect(screen.getAllByTestId("more-vertical-icon").length).toBe(10); // 1 for each row , by default 10 rows .
  });
  test("renders three-dots button when onDeleteMatch is provided", () => {
    renderMatchHistory({ onEditMatch: undefined, onDeleteMatch: jest.fn() });
    expect(screen.getAllByTestId("more-vertical-icon").length).toBe(10); // 1 for each row , by default 10 rows .
  });
  test("opens context menu when three-dots button is clicked", async () => {
    renderMatchHistory();
    const matchRow = getMatchRow(displayedMatches[0].id);
    const threeDotsButton = within(matchRow).getByRole("button");
    await userEvent.click(threeDotsButton);
    expect(screen.getByTestId("context-menu")).toBeInTheDocument();
  });
  test("closes context menu when clicking outside", async () => {
  renderMatchHistory();
  const matchRow = getMatchRow(displayedMatches[0].id);
  const threeDotsButton = within(matchRow).getByRole("button");
  await userEvent.click(threeDotsButton);
  expect(screen.getByTestId("context-menu")).toBeInTheDocument();
  await userEvent.click(screen.getByTestId("context-menu-backdrop"));
  expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
});
  test("calls onEditMatch with correct match when Edit is clicked", async () => {
  const onEditMatch = jest.fn();
  renderMatchHistory({ onEditMatch });
  const matchRow = getMatchRow(displayedMatches[0].id);
  await userEvent.click(within(matchRow).getByRole("button"));
  await userEvent.click(screen.getByText(/edit match/i));
  expect(onEditMatch).toHaveBeenCalledWith(displayedMatches[0]);
});
});

describe("MatchHistory - delete confirmation", () => {
  const openDeleteDialog = async () => {
    renderMatchHistory();
    const matchRow = getMatchRow(displayedMatches[0].id);
    await userEvent.click(within(matchRow).getByRole("button"));
    await userEvent.click(screen.getByText(/delete match/i));
  };

  test("opens delete confirmation dialog when Delete is clicked in context menu", async () => {
    await openDeleteDialog();
    expect(screen.getByTestId("delete-confirmation-dialog")).toBeInTheDocument();
  });

  test("closes delete dialog when Cancel is clicked", async () => {
    await openDeleteDialog();
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByTestId("delete-confirmation-dialog")).not.toBeInTheDocument();
  });

  test("calls onDeleteMatch with correct matchId when Delete is confirmed", async () => {
    const onDeleteMatch = jest.fn();
    renderMatchHistory({ onDeleteMatch });
    const matchRow = getMatchRow(displayedMatches[0].id);
    await userEvent.click(within(matchRow).getByRole("button"));
    await userEvent.click(screen.getByText(/delete match/i));
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDeleteMatch).toHaveBeenCalledWith(displayedMatches[0].id);
  });
});
