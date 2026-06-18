import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { StandingsTable } from "@/components/StandingsTable";
import { useLeagueStore, Team } from "@/store/leagueStore";
import { getMockLeagueData, getMockTeamById} from "tests/fixtures/mockSelectors";
import { getCellByColumn } from "tests/helpers/tableHelpers";

jest.mock("@/store/leagueStore", () => ({
  useLeagueStore: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  Shield: () => <div data-testid="shield-icon" />,
}));

const renderStandingsTable = (teams: Team[]) => {
  (useLeagueStore as unknown as jest.Mock).mockReturnValue({ teams });
  return render(<StandingsTable />);
};

describe("StandingsTable - Rendering", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("renders all team names from the store", () => {
    const teams: Team[] = getMockLeagueData().teams;
    renderStandingsTable(teams);
    teams.forEach((team) => {
      expect(screen.getByText(team.name)).toBeInTheDocument();
    });
  });
  test("renders empty table when teams array is empty", () => {
    renderStandingsTable([]);
    expect(screen.getAllByRole("row")).toHaveLength(1); // Only header row should be present
  });
  test("renders Shield icon when team has no logo", () => {
    const teams: Team[] = getMockLeagueData().teams.map((team) => ({
      ...team,
      logo: "",
    }));
    renderStandingsTable(teams);
    const shieldIcons = screen.getAllByTestId("shield-icon");
    expect(shieldIcons.length).toBe(teams.length);
  });
  test("renders img when team has a logo", () => {
    const teams: Team[] = getMockLeagueData().teams.map((team) => ({
      ...team,
      logo: "team-logo.png",
    }));
    renderStandingsTable(teams);
    teams.forEach((team) => {
      expect(screen.getByAltText(team.name)).toBeInTheDocument();
    });
  });
});

describe("StandingsTable - numbers display", () => {
  const getTeamRow = (team: Team) =>
  screen.getByRole("row", { name: new RegExp(team.name, "i") });
  test("renders correct played, won, drawn, lost values", () => {
    const teams: Team[] = getMockLeagueData({ withMatches: true }).teams;
    renderStandingsTable(teams);
    teams.forEach((team) => {
      const row = getTeamRow(team);
      expect(getCellByColumn(row, "P")).toHaveTextContent(team.played.toString());
      expect(getCellByColumn(row, "W")).toHaveTextContent(team.won.toString());
      expect(getCellByColumn(row, "D")).toHaveTextContent(team.drawn.toString());
      expect(getCellByColumn(row, "L")).toHaveTextContent(team.lost.toString());
    });
});
  
  test("renders correct goalsFor and goalsAgainst values", () => {
    const teams: Team[] = getMockLeagueData({ withMatches: true }).teams;
    renderStandingsTable(teams);
    teams.forEach((team) => {
      const row = getTeamRow(team);
      expect(getCellByColumn(row, "GF")).toHaveTextContent(team.goalsFor.toString());
      expect(getCellByColumn(row, "GA")).toHaveTextContent(team.goalsAgainst.toString());
    });
  });
  test.each([
    { goalsFor: 5, goalsAgainst: 10, expected: "-5" },
    { goalsFor: 10, goalsAgainst: 5, expected: "+5" }
  ])("renders correct goal difference with appropriate prefix", ({ goalsFor, goalsAgainst, expected }) => {
    const team: Team = { ...getMockTeamById(getMockLeagueData(), "team-1"), goalsFor, goalsAgainst };
    renderStandingsTable([team]);
    const row = getTeamRow(team);
    expect(getCellByColumn(row, "GD")).toHaveTextContent(expected);
  });
  test.each([
    { goalsFor: 5, goalsAgainst: 5, expected: "0" },
    { goalsFor: 10, goalsAgainst: 10, expected: "0" },
    { goalsFor: 0, goalsAgainst: 0, expected: "0" }
  ])("renders correct goal difference as 0 when equal", ({ goalsFor, goalsAgainst, expected }) => {
    const team: Team = { ...getMockTeamById(getMockLeagueData(), "team-1"), goalsFor, goalsAgainst };
    renderStandingsTable([team]);
    const row = getTeamRow(team);
    expect(getCellByColumn(row, "GD")).toHaveTextContent(expected);
  });
  test.each([
    { won: 6, drawn: 2, expected: "20" },
    { won: 0, drawn: 0, expected: "0" },
    { won: 10, drawn: 5, expected: "35" }
  ])("renders correct points calculated from won and drawn", ({ won, drawn, expected }) => {
    const team: Team = { ...getMockTeamById(getMockLeagueData(), "team-1"), won, drawn };
    renderStandingsTable([team]);
    const row = getTeamRow(team);
    expect(getCellByColumn(row, "PTS")).toHaveTextContent(expected);
  });
});

