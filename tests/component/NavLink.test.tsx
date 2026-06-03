import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { NavLink } from "@/components/NavLink";
import { MemoryRouter } from "react-router-dom";

const renderNavLink = (props: Partial<React.ComponentProps<typeof NavLink>>, initialEntry = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <NavLink to="/test-link" {...props}>Test Link</NavLink>
    </MemoryRouter>
  );
};
describe("NavLink - rendering", () => {
  test("renders the link with correct href", () => {
    renderNavLink({});
    const linkElement = screen.getByText("Test Link");
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/test-link");
  });
  test("applies className always", () => {
    renderNavLink({ className: "base-class" });
    const linkElement = screen.getByText("Test Link");
    expect(linkElement).toHaveClass("base-class");
  });
});

describe("NavLink - active state", () => {
  test("applies activeClassName when link is active", () => {
    renderNavLink({ activeClassName: "active-class" }, "/test-link");
    const linkElement = screen.getByText("Test Link");
    expect(linkElement).toHaveClass("active-class");
  });
  test("does not apply activeClassName when link is inactive", () => {
    renderNavLink({ activeClassName: "active-class" }, "/other-link");
    const linkElement = screen.getByText("Test Link");
    expect(linkElement).not.toHaveClass("active-class");
  });
});

describe("NavLink - pending state", () => {
  test.todo("applies pendingClassName when link is pending");
});