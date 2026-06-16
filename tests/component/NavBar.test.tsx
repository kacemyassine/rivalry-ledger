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

const setAuthenticated = (value: boolean) =>
  (AuthService.isAuthenticated as jest.Mock).mockReturnValue(value);

const setMockNavigation = () => {
  const navigate = jest.fn();
  mockNavigate.mockReturnValue(navigate);
  return navigate;
};

const setMockLocation = (pathname: string = "/") =>
  mockLocation.mockReturnValue({ pathname });

beforeEach(() => {
  setMockNavigation();
  setMockLocation();
  setAuthenticated(false);
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

const getNavButton = (name: string | RegExp) =>
  screen.getAllByRole("button", { name: name })[0];

const getDialog = (exists: boolean = true) =>
    exists ? screen.getByRole("dialog") : screen.queryByRole("dialog");

describe("Navbar - rendering", () => {
  test("renders all nav links", () => {
    renderNavbar();
    NAV_LABELS.forEach((label) => {
      expect(getNavButton(label)).toBeInTheDocument();
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
    setAuthenticated(true);
    renderNavbar();
    expect(screen.getByTestId("unlock-icon")).toBeInTheDocument();
  });
});

describe("Navbar - active state", () => {
  test("applies active state to current route link", () => {
    renderNavbar();
    expect(getNavButton(/home/i)).toHaveAttribute("aria-current", "page");
  });

  test("does not apply active state to inactive links", () => {
    renderNavbar();
    NAV_LABELS.filter((label) => label !== "Home").forEach((label) => {
      expect(getNavButton(new RegExp(label, "i"))).not.toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });
});

describe("Navbar - admin access", () => {
  test("opens dialog when admin clicked and unauthenticated", async () => {
    renderNavbar();
    const adminLink = getNavButton(/admin/i);
    await userEvent.click(adminLink);
    expect(getDialog()).toBeInTheDocument();
  });
  test("navigates to /admin when admin clicked and authenticated", async () => {
    const navigate = setMockNavigation();
    setAuthenticated(true);
    renderNavbar();
    const adminLink = getNavButton(/admin/i);
    await userEvent.click(adminLink);
    expect(getDialog(false)).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith("/admin");
  });
});

describe("Navbar - admin dialog", () => {
  const openDialog = async () => {
    renderNavbar();
    const adminLink = getNavButton(/admin/i);
    await userEvent.click(adminLink);
    expect(getDialog()).toBeInTheDocument();
  };

  const setAuthenticateSuccess = () =>
    (AuthService.authenticate as jest.Mock).mockReturnValue(true);

  const setAuthenticateError = (error: Error) =>
    (AuthService.authenticate as jest.Mock).mockImplementationOnce(() => {
      throw error;
    });

  const PasswordError = () => screen.getByTestId("password-error")

  test("shows error on wrong password", async () => {
    await openDialog();
    await typePassword();
    await clickEnter();
    expect(PasswordError()).toHaveTextContent(
      AUTH_ERRORS.INCORRECT_PASSWORD,
    );
  });

  test("shows rate limit error after multiple failed attempts (3)", async () => {
    await openDialog();
    setAuthenticateError(new Error(AUTH_ERRORS.RATE_LIMITED));
    await clickEnter();
    expect(PasswordError()).toHaveTextContent(
      AUTH_ERRORS.RATE_LIMITED,
    );
  });

  test("shows lockout error when locked out", async () => {
    await openDialog();
    setAuthenticateError(new Error(AUTH_ERRORS.LOCKED_OUT));
    await clickEnter();
    expect(PasswordError()).toHaveTextContent(
      AUTH_ERRORS.LOCKED_OUT,
    );
  });

  test("navigates to /admin and closes dialog on correct password", async () => {
    const navigate = setMockNavigation();
    setAuthenticateSuccess();
    await openDialog();
    await clickEnter();
    expect(getDialog(false)).not.toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith("/admin");
  });
});

describe("Navbar - mobile menu", () => {
  const clickHamburgerMenu = async () => {
    await userEvent.click(screen.getByTestId("mobile-hamburger"));
  };

  const getMobileMenu = (exists: boolean = true) =>
  exists ? screen.getByTestId("mobile-menu") : screen.queryByTestId("mobile-menu");

  test("opens mobile menu on hamburger click", async () => {
    renderNavbar();
    await clickHamburgerMenu();
    expect(getMobileMenu()).toBeInTheDocument();
  });
  test("closes mobile menu on hamburger click again", async () => {
    renderNavbar();
    await clickHamburgerMenu();
    await clickHamburgerMenu();
    expect(getMobileMenu(false)).not.toBeInTheDocument();
  });
  test("closes mobile menu on route change", async () => {
    const { rerender } = renderNavbar();
    await clickHamburgerMenu();
    expect(getMobileMenu()).toBeInTheDocument();
    setMockLocation("/statistics");
    rerender(<Navbar />);
    expect(getMobileMenu(false)).not.toBeInTheDocument();
  });
});
