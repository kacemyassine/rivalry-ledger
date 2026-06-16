import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { NavLink } from "@/components/NavLink";
import { MemoryRouter } from "react-router-dom";
import React from "react";

const renderNavLink = (
  props: Partial<React.ComponentProps<typeof NavLink>>,
  initialEntry = "/",
) => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <NavLink to="/test-link" {...props}>
        Test Link
      </NavLink>
    </MemoryRouter>,
  );
};

const getNavLinkElement = () => screen.getByText("Test Link");

describe("NavLink - rendering", () => {
  test("renders the link with correct href", () => {
    renderNavLink({});
    const linkElement = getNavLinkElement();
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/test-link");
  });
  test("applies className always", () => {
    renderNavLink({ className: "base-class" });
    const linkElement = getNavLinkElement();
    expect(linkElement).toHaveClass("base-class");
  });
});

describe("NavLink - active state", () => {
  test("applies activeClassName when link is active", () => {
    renderNavLink({ activeClassName: "active-class" }, "/test-link");
    const linkElement = getNavLinkElement();
    expect(linkElement).toHaveClass("active-class");
  });
  test("does not apply activeClassName when link is inactive", () => {
    renderNavLink({ activeClassName: "active-class" }, "/other-link");
    const linkElement = getNavLinkElement();
    expect(linkElement).not.toHaveClass("active-class");
  });
});

describe("NavLink - className merging", () => {
  test("applies both className and activeClassName when link is active", () => {
    renderNavLink(
      { className: "base-class", activeClassName: "active-class" },
      "/test-link",
    );
    const linkElement = getNavLinkElement();
    expect(linkElement).toHaveClass("base-class");
    expect(linkElement).toHaveClass("active-class");
  });

  test("does not break when no activeClassName is provided and link is active", () => {
    renderNavLink({ className: "base-class" }, "/test-link");
    const linkElement = getNavLinkElement();
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveClass("base-class");
  });
});

describe("NavLink - forwardRef", () => {
  test("forwards ref to the anchor element", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <MemoryRouter>
        <NavLink to="/test-link" ref={ref}>
          Test Link
        </NavLink>
      </MemoryRouter>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("A");
  });
});
