import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OAuthCallbackPage from "@/pages/OAuthCallbackPage";

const navigateMock = vi.fn();
const onLoginSuccessMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ onLoginSuccess: onLoginSuccessMock }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderPage = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OAuthCallbackPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("OAuthCallbackPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    onLoginSuccessMock.mockReset();
    localStorage.clear();
    window.history.replaceState({}, "", "/auth/callback");
  });

  it("stores hash tokens and navigates to the normalized redirect path", async () => {
    window.history.replaceState({}, "", "/auth/callback#accessToken=a&refreshToken=r&redirect=/profile");

    renderPage();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/profile", { replace: true }));
    expect(localStorage.getItem("ww_access_token")).toBe("a");
    expect(localStorage.getItem("ww_refresh_token")).toBe("r");
    expect(onLoginSuccessMock).toHaveBeenCalledTimes(1);
  });

  it("keeps invalid redirects inside the app", async () => {
    window.history.replaceState({}, "", "/auth/callback#accessToken=a&refreshToken=r&redirect=//evil.example");

    renderPage();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/", { replace: true }));
  });

  it("routes oauth errors back to login without storing tokens", async () => {
    window.history.replaceState({}, "", "/auth/callback?error=kakao&redirect=/city");

    renderPage();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/login?redirect=%2Fcity&error=kakao", { replace: true }));
    expect(localStorage.getItem("ww_access_token")).toBeNull();
    expect(onLoginSuccessMock).not.toHaveBeenCalled();
  });
});
