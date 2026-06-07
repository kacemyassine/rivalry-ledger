import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopScorers } from "@/components/TopScorers";
import { useLeagueStore } from "@/store/leagueStore";
import { getMockLeagueData } from "tests/fixtures/mockSelectors";
import { sortPlayers } from "@/lib/scorersUtils";

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

afterEach(() => {
  jest.clearAllMocks();
});
describe("TopScorers - rendering", () => {
  test("renders the 'Top Scorers' heading", () => {
    mockUseLeagueStore.mockReturnValue({
      ...getMockLeagueData(),
    });
    renderTopScorers();
    expect(
      screen.getByRole("heading", { name: /top scorers/i }),
    ).toBeInTheDocument();
  });
  test("renders empty state when there are no players", () => {
    mockUseLeagueStore.mockReturnValue({
      ...getMockLeagueData(),
      players: [],
    });
    renderTopScorers();
    expect(screen.getByText(/no players/i)).toBeInTheDocument();
  });
  test("renders all players with goals by default", () => {
    const data = getMockLeagueData({ withScorers: true });
    const scorers = data.players.filter((p) => (p.goals || 0) > 0);
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    expect(screen.getAllByTestId(/player-row/).length).toBe(scorers.length);
  });
  test("renders player name and team name", () => {
    const data = getMockLeagueData({ withScorers: true });
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    const players = data.players.filter((p) => (p.goals || 0) > 0);
    players.forEach((player) => {
      const row = screen
        .getAllByTestId(/player-row/)
        .find((r) => r.textContent?.includes(player.name));
      expect(row).toBeDefined();
      const teamName = data.teams.find((t) => t.id === player.teamId)!.name;
      expect(row).toHaveTextContent(teamName);
    });
  });
  test("renders goal count for each player", () => {
    const data = getMockLeagueData({ withScorers: true });
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    const players = data.players.filter((p) => (p.goals || 0) > 0);
    players.forEach((player) => {
      const row = screen
        .getAllByTestId(/player-row/)
        .find((r) => r.textContent?.includes(player.name));
      expect(row).toBeDefined();
      expect(row).toHaveTextContent(`${player.goals}goals`);
    });
  });
  test("renders User icon when player has no image", () => {
    const data = getMockLeagueData({ withScorers: true });
    // Ensure at least one player has no image
    data.players[0] = { ...data.players[0], image: null };
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    expect(screen.getAllByTestId("user-icon").length).toBeGreaterThan(0);
  });
  test("renders img when player has an image", () => {
    const data = getMockLeagueData({ withScorers: true });
    const targetPlayer = {
      ...data.players[0],
      name: "Unique Test Player",
      image: "Images/player1.jpg",
      goals: 99,
    };
    data.players[0] = targetPlayer;
    mockUseLeagueStore.mockReturnValue({ ...data });
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
    const data = getMockLeagueData({ withScorers: true });
    const nonScorers = data.players.filter((p) => (p.goals || 0) === 0);
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    expect(screen.queryAllByTestId(/player-row/).length).toBe(
      data.players.length - nonScorers.length,
    );
  });
  test("shows all players after clicking show all", async () => {
    const data = {
      ...getMockLeagueData(),
      players: [
        { id: "1", name: "Scorer Player", teamId: "team1", goals: 5 },
        { id: "2", name: "Non-Scorer Player", teamId: "team1", goals: 0 },
      ],
    };
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    const showAllButton = screen.getByRole("button", { name: /show all/i });
    await userEvent.click(showAllButton);
    expect(screen.queryAllByTestId(/player-row/).length).toBe(
      data.players.length,
    );
  });

  test("hides show all button when all players have goals", () => {
    const data = getMockLeagueData({ withScorers: true });
    data.players = data.players.map((p) => ({ ...p, goals: p.goals || 1 }));
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    expect(
      screen.queryByRole("button", { name: /show all/i }),
    ).not.toBeInTheDocument();
  });
  test("shows show all button when there are non-scorers", async () => {
    const data = getMockLeagueData({ withScorers: true });
    data.players[0].goals = 0;
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers();
    const showAllButton = screen.getByRole("button", { name: /show all/i });
    expect(showAllButton).toBeInTheDocument();
  });
});

describe("TopScorers - buttons", () => {
  test("hides edit and delete buttons when hideButtons is true (unauthenticated)", () => {
    const data = getMockLeagueData({ withScorers: true });
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers({ hideButtons: true });
    expect(screen.queryByTestId("edit-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("trash-icon")).not.toBeInTheDocument();
  });
  test("calls onEditPlayer with correct id when edit is clicked", async () => {
    const onEditPlayer = jest.fn();
    const data = getMockLeagueData({ withScorers: true });
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers({ hideButtons: false, onEditPlayer });
    const editButtons = screen.getAllByTestId("edit-icon");
    await userEvent.click(editButtons[0]);
    const sorted = sortPlayers(data.players, data.teams);
    const scorers = sorted.filter((p) => (p.goals || 0) > 0);
    expect(onEditPlayer).toHaveBeenCalledWith(scorers[0].id);
  });
  test("delete button is disabled when player has goals", () => {
    const data = getMockLeagueData({ withScorers: true });
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers({ hideButtons: false });
    const deleteButtons = screen
      .getAllByTestId("trash-icon")
      .map((icon) => icon.closest("button")!);
    deleteButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  test("delete button is disabled when team has 23 or fewer players", async () => {
    const data = {
      ...getMockLeagueData(),
      players: Array.from({ length: 23 }, (_, i) => ({
        id: `player-${i}`,
        name: `Player ${i}`,
        teamId: "team-1",
        goals: 0,
      })),
    };
    mockUseLeagueStore.mockReturnValue({ ...data });
    renderTopScorers({ hideButtons: false });
    await userEvent.click(screen.getByRole("button", { name: /show all/i }));
    const deleteButtons = screen
      .getAllByTestId("trash-icon")
      .map((icon) => icon.closest("button")!);
    deleteButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
