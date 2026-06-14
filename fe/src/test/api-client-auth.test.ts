import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const okBody = (data: unknown) => ({ success: true, data });

describe("api client auth token lifecycle", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("refreshes an expired access token and retries the original request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "expired" } }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(okBody({ accessToken: "new-access", refreshToken: "new-refresh" })), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(okBody({ name: "traveler" })), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { apiFetch, setTokens, getAccessToken, getRefreshToken } = await import("@/lib/api/client");
    setTokens("old-access", "old-refresh");

    const result = await apiFetch<{ name: string }>("/api/users/v1/me");

    expect(result.data.name).toBe("traveler");
    expect(getAccessToken()).toBe("new-access");
    expect(getRefreshToken()).toBe("new-refresh");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1]?.headers).toMatchObject({ Authorization: "Bearer new-access" });
  });

  it("clears tokens only after refresh fails on a 401 response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "expired" } }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "bad refresh" } }), { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const { apiFetch, setTokens, getAccessToken, getRefreshToken } = await import("@/lib/api/client");
    setTokens("old-access", "old-refresh");

    await expect(apiFetch("/api/users/v1/me")).rejects.toThrow("인증이 만료되었습니다");
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem("ww_access_token")).toBeNull();
  });
});
