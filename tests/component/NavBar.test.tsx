import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/Navbar";
import { AuthService } from "@/lib/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { AUTH_ERRORS } from "@/lib/authErrors";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock("@/lib/authService", () => ({
  AuthService: {
    isAuthenticated: jest.fn(),
    authenticate: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Archive: () => <div data-testid="archive-icon" />,
  BarChart2: () => <div data-testid="barchart-icon" />,
  Trophy: () => <div data-testid="trophy-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Unlock: () => <div data-testid="unlock-icon" />,
}));

const mockNavigate = useNavigate as jest.Mock;
const mockLocation = useLocation as jest.Mock;

const renderNavbar = () => render(<Navbar />);

beforeEach(() => {
  mockNavigate.mockReturnValue(jest.fn());
  mockLocation.mockReturnValue({ pathname: "/" });
  AuthService.isAuthenticated = jest.fn().mockReturnValue(false);
});

afterEach(() => {
  jest.clearAllMocks();
});

const NAV_LABELS = ["Home", "Archived", "Statistics", "Cups"];

const correctPassword = "0217";

const clickEnter = async () => {
  await userEvent.click(screen.getByRole("button", { name: /enter/i }));
};

const typePassword = async (password = correctPassword) => {
  const passwordField = screen.getByPlaceholderText("••••••");
  await userEvent.clear(passwordField);
  await userEvent.type(passwordField, password);
};

describe("Navbar - rendering", () => {
  test("renders all nav links", () => {
    renderNavbar();
    NAV_LABELS.forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });
  test("renders logo", () => {
    renderNavbar();
    expect(screen.getByTestId("navbar-logo")).toBeInTheDocument();
  });
  test("renders Lock icon when unauthenticated", () => {
    renderNavbar();
    // by default the user is not authenticated.
    expect(screen.getByTestId("lock-icon")).toBeInTheDocument();
  });
  test("renders Unlock icon when authenticated", () => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    renderNavbar();
    expect(screen.getByTestId("unlock-icon")).toBeInTheDocument();
  });
});

describe("Navbar - active state", () => {
  test("applies active state to current route link", () => {
    mockLocation.mockReturnValue({ pathname: "/" });
    renderNavbar();
    expect(screen.getAllByRole("button", { name: /home/i })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("does not apply active state to inactive links", () => {
    mockLocation.mockReturnValue({ pathname: "/" });
    renderNavbar();
    NAV_LABELS.filter((label) => label !== "Home").forEach((label) => {
      expect(
        screen.getAllByRole("button", { name: new RegExp(label, "i") })[0],
      ).not.toHaveAttribute("aria-current", "page");
    });
  });
});

describe("Navbar - admin access", () => {
  test("opens dialog when admin clicked and unauthenticated", async () => {
    renderNavbar();
    const adminLink = screen.getByRole("button", { name: /admin/i });
    await userEvent.click(adminLink);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  test("navigates to /admin when admin clicked and authenticated", async () => {
    const navigate = jest.fn();
    mockNavigate.mockReturnValue(navigate);
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    renderNavbar();
    const adminLink = screen.getByRole("button", { name: /admin/i });
    await userEvent.click(adminLink);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith("/admin");
  });
});

describe("Navbar - admin dialog", () => {
  const openDialog = async () => {
    renderNavbar();
    const adminLink = screen.getByRole("button", { name: /admin/i });
    await userEvent.click(adminLink);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  };

  test("shows error on wrong password", async () => {
    await openDialog();
    await typePassword();
    await clickEnter();
    expect(screen.getByTestId("password-error")).toHaveTextContent(
      AUTH_ERRORS.INCORRECT_PASSWORD,
    );
  });

  test("shows rate limit error after multiple failed attempts (3)", async () => {
    await openDialog();
    (AuthService.authenticate as jest.Mock).mockImplementationOnce(() => {
      throw new Error(AUTH_ERRORS.RATE_LIMITED);
    });
    await clickEnter();
    expect(screen.getByTestId("password-error")).toHaveTextContent(
      AUTH_ERRORS.RATE_LIMITED,
    );
  });

  test("shows lockout error when locked out", async () => {
    await openDialog();
    (AuthService.authenticate as jest.Mock).mockImplementationOnce(() => {
      throw new Error(AUTH_ERRORS.LOCKED_OUT);
    });
    await clickEnter();
    expect(screen.getByTestId("password-error")).toHaveTextContent(
      AUTH_ERRORS.LOCKED_OUT,
    );
  });

  test("navigates to /admin and closes dialog on correct password", async () => {
    const navigate = jest.fn();
    mockNavigate.mockReturnValue(navigate);
    (AuthService.authenticate as jest.Mock).mockReturnValue(true);
    await openDialog();
    await clickEnter();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith("/admin");
  });
});

describe("Navbar - mobile menu", () => {
  const clickHamburgerMenu = async () => {
    await userEvent.click(screen.getByTestId("mobile-hamburger"));
  };
  test("opens mobile menu on hamburger click", async () => {
    renderNavbar();
    await clickHamburgerMenu();
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  });
  test("closes mobile menu on hamburger click again", async () => {
    renderNavbar();
    await clickHamburgerMenu();
    await clickHamburgerMenu();
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
  test("closes mobile menu on route change", async () => {
  const { rerender } = renderNavbar();
  await clickHamburgerMenu();
  expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  mockLocation.mockReturnValue({ pathname: "/statistics" });
  rerender(<Navbar />);
  expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
});
});
