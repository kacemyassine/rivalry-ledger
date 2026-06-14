import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  Match,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MatchHistory } from "@/components/MatchHistory";
import { useLeagueStore } from "@/store/leagueStore";
import {
  getMockLeagueData,
  getMockTeamById,
} from "tests/fixtures/mockSelectors";
import { renderMatches } from "react-router-dom";

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

describe("MatchHistory - rendering", () => {
  const displayedMatches = [...data.matches].reverse().slice(0, 10);
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
  test("opens match detail popup when a match row is clicked", () => {});
  test("renders Match Details heading in popup", () => {});
  test("renders correct score in popup", () => {});
  test("renders home and away scorers in popup", () => {});
  test("closes popup when clicking the backdrop", () => {});
  test("closes popup when clicking the X button", () => {});
});

describe("MatchHistory - context menu", () => {
  test("does not render three-dots button when no admin callbacks provided", () => {});
  test("renders three-dots button when onEditMatch is provided", () => {});
  test("renders three-dots button when onDeleteMatch is provided", () => {});
  test("opens context menu when three-dots button is clicked", () => {});
  test("closes context menu when clicking outside", () => {});
  test("calls onEditMatch with correct match when Edit is clicked", () => {});
});

describe("MatchHistory - delete confirmation", () => {
  test("opens delete confirmation dialog when Delete is clicked in context menu", () => {});
  test("closes delete dialog when Cancel is clicked", () => {});
  test("calls onDeleteMatch with correct matchId when Delete is confirmed", () => {});
});
