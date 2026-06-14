import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

let authState = {
  isLoggedIn: false,
  isLoading: false,
  user: null as null | { id: number; name: string },
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState = { isLoggedIn: false, isLoading: false, user: null };
  });

  it("redirects anonymous users to login with the current path", () => {
    render(
      <MemoryRouter initialEntries={["/profile?tab=badges"]}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>protected profile</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    authState = { isLoggedIn: true, isLoading: false, user: { id: 1, name: "테스트" } };

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <ProtectedRoute>
          <div>protected profile</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("protected profile")).toBeInTheDocument();
  });

  it("shows a recoverable profile load failure when token exists but user is missing", () => {
    authState = { isLoggedIn: true, isLoading: false, user: null };

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <ProtectedRoute>
          <div>protected profile</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("사용자 정보를 불러오지 못했습니다")).toBeInTheDocument();
  });
});
