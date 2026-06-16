import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthService } from "@/lib/authService";

jest.mock("@/lib/authService");

const renderProtectedRoute = (
  isAuthenticated: boolean,
  children = <div>Protected Content</div>,
) => {
  (AuthService.isAuthenticated as jest.Mock).mockReturnValue(isAuthenticated);

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/" element={<div>Visitor Page</div>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute>{children}</ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  test("renders children when authenticated", () => {
    renderProtectedRoute(true);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to / when not authenticated", () => {
    renderProtectedRoute(false);
    expect(screen.getByText("Visitor Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
