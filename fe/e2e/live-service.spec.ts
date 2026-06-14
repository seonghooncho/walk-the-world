import { expect, test, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";

const LIVE_ENABLED = process.env.LIVE_E2E === "1";
const REQUEST_TIMEOUT = 30_000;
const TEST_PASSWORD = "QaPassw0rd!2026";
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  meta?: { limit?: number; hasNext?: boolean; nextCursor?: string | null };
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  restored?: boolean;
};

type TestAccount = {
  id: number;
  email: string;
  name: string;
  tokens: Tokens;
};

type UserProfile = {
  id: number;
  email: string;
  name: string;
  currentCityId: string;
};

type PostResponse = {
  id: number;
  content: string;
};

type CommentResponse = {
  id: number;
  content: string;
};

type FriendResponse = {
  id: number;
  name: string;
};

type ChatRoomResponse = {
  id: number;
  friendId: number;
};

type ChatMessageResponse = {
  id: number;
  senderId: number;
  content: string;
};

const authHeaders = (account: TestAccount | Tokens) => ({
  Authorization: `Bearer ${"tokens" in account ? account.tokens.accessToken : account.accessToken}`,
});

const parseJson = async <T>(response: APIResponse): Promise<ApiEnvelope<T>> => {
  const text = await response.text();
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    throw new Error(`Expected JSON response, got HTTP ${response.status()}: ${text.slice(0, 300)}`);
  }
};

const expectOk = async <T>(response: APIResponse, label: string) => {
  const body = await parseJson<T>(response);
  expect(response.ok(), `${label} HTTP ${response.status()} ${JSON.stringify(body.error ?? body).slice(0, 300)}`).toBeTruthy();
  expect(body.success, `${label} API success`).toBe(true);
  return body;
};

const expectError = async (response: APIResponse, status: number, code: string, label: string) => {
  const body = await parseJson<null>(response);
  expect(response.status(), `${label} HTTP status`).toBe(status);
  expect(body.success, `${label} API success`).toBe(false);
  expect(body.error?.code, `${label} error code`).toBe(code);
};

const expectErrorSoft = async (response: APIResponse, status: number, code: string, label: string) => {
  const body = await parseJson<null>(response);
  expect.soft(response.status(), `${label} HTTP status`).toBe(status);
  expect.soft(body.success, `${label} API success`).toBe(false);
  expect.soft(body.error?.code, `${label} error code`).toBe(code);
  return body;
};

const signup = async (request: APIRequestContext, role: string): Promise<TestAccount> => {
  const email = `ww-live-${role}-${RUN_ID}@example.com`;
  const name = `QA ${role} ${RUN_ID}`;
  const response = await request.post("/api/auth/v1/signup", {
    data: { email, password: TEST_PASSWORD, name },
    timeout: REQUEST_TIMEOUT,
  });
  const body = await expectOk<Tokens>(response, `${role} signup`);
  const meResponse = await request.get("/api/users/v1/me", {
    headers: authHeaders(body.data),
    timeout: REQUEST_TIMEOUT,
  });
  const me = await expectOk<UserProfile>(meResponse, `${role} profile after signup`);
  return { id: me.data.id, email, name, tokens: body.data };
};

const login = async (request: APIRequestContext, account: TestAccount): Promise<Tokens> => {
  const response = await request.post("/api/auth/v1/login", {
    data: { email: account.email, password: TEST_PASSWORD },
    timeout: REQUEST_TIMEOUT,
  });
  const body = await expectOk<Tokens>(response, `${account.email} login`);
  account.tokens = body.data;
  return body.data;
};

const setBrowserTokens = async (page: Page, account: TestAccount) => {
  await page.addInitScript(
    ({ accessToken, refreshToken }) => {
      localStorage.setItem("ww_access_token", accessToken);
      localStorage.setItem("ww_refresh_token", refreshToken);
    },
    { accessToken: account.tokens.accessToken, refreshToken: account.tokens.refreshToken },
  );
};

test.describe("live production QA", () => {
  test.skip(!LIVE_ENABLED, "Set LIVE_E2E=1 and PLAYWRIGHT_BASE_URL to run production QA.");

  let primary: TestAccount;
  let secondary: TestAccount;
  let outsider: TestAccount;
  const createdPosts: Array<{ account: TestAccount; postId: number }> = [];

  test.beforeAll(async ({ request }) => {
    test.setTimeout(120_000);
    primary = await signup(request, "primary");
    secondary = await signup(request, "secondary");
    outsider = await signup(request, "outsider");
  });

  test.afterAll(async ({ request }) => {
    for (const { account, postId } of createdPosts.reverse()) {
      await request.delete(`/api/posts/v1/${postId}`, {
        headers: authHeaders(account),
        timeout: REQUEST_TIMEOUT,
      }).catch(() => undefined);
    }

    for (const account of [primary, secondary, outsider].filter(Boolean)) {
      await request.delete("/api/users/v1/me", {
        headers: authHeaders(account),
        timeout: REQUEST_TIMEOUT,
      }).catch(() => undefined);
    }
  });

  test("public pages render and protected pages redirect to login", async ({ page }) => {
    test.setTimeout(120_000);
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    for (const path of ["/", "/map", "/demo", "/login", "/terms", "/privacy"]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
      expect(response?.status(), `${path} status`).toBeLessThan(500);
      await expect(page.locator("#root"), `${path} root`).toBeVisible();
    }

    await page.goto("/profile", { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
    await expect(page).toHaveURL(/\/login\?redirect=%2Fprofile/);
    await expect(page.getByRole("button", { name: "카카오로 시작하기" })).toBeVisible();
    expect(pageErrors, "runtime page errors").toEqual([]);
  });

  test("test accounts can sign up, authenticate, and load profile in the browser", async ({ request, page }) => {
    test.setTimeout(120_000);
    const citiesResponse = await request.get("/api/cities/v1", { timeout: REQUEST_TIMEOUT });
    const cities = await expectOk<Array<{ id: string; name: string }>>(citiesResponse, "cities list");
    expect(cities.data.length, "city count").toBeGreaterThan(0);

    await setBrowserTokens(page, primary);
    await page.goto("/profile", { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
    await expect(page.getByRole("heading", { name: "여행 여권" })).toBeVisible();
    await expect(page.getByText(primary.name)).toBeVisible();
  });

  test("input, pagination, and step boundaries match production requirements", async ({ request }) => {
    test.setTimeout(120_000);
    const fiveHundredChars = "가".repeat(500);
    const fiveHundredOneChars = `${fiveHundredChars}초`;

    await expectOk(
      await request.post("/api/steps/v1/sync", {
        headers: authHeaders(primary),
        data: { steps: 0 },
        timeout: REQUEST_TIMEOUT,
      }),
      "steps zero boundary",
    );
    await expectError(
      await request.post("/api/steps/v1/sync", {
        headers: authHeaders(primary),
        data: { steps: -1 },
        timeout: REQUEST_TIMEOUT,
      }),
      400,
      "INVALID_REQUEST",
      "negative steps boundary",
    );

    const postBody = await expectOk<PostResponse>(
      await request.post("/api/posts/v1", {
        headers: authHeaders(primary),
        data: { cityId: "seoul", content: fiveHundredChars },
        timeout: REQUEST_TIMEOUT,
      }),
      "500 character post",
    );
    createdPosts.push({ account: primary, postId: postBody.data.id });
    expect(postBody.data.content).toBe(fiveHundredChars);

    const oversizedPostResponse = await request.post("/api/posts/v1", {
      headers: authHeaders(primary),
      data: { cityId: "seoul", content: fiveHundredOneChars },
      timeout: REQUEST_TIMEOUT,
    });
    if (oversizedPostResponse.ok()) {
      const oversizedPost = await parseJson<PostResponse>(oversizedPostResponse);
      if (oversizedPost.data?.id) {
        createdPosts.push({ account: primary, postId: oversizedPost.data.id });
      }
      expect.soft(oversizedPostResponse.status(), "501 character post HTTP status").toBe(400);
      expect.soft(oversizedPost.success, "501 character post API success").toBe(false);
      expect.soft(oversizedPost.error?.code, "501 character post error code").toBe("INVALID_REQUEST");
    } else {
      await expectError(oversizedPostResponse, 400, "INVALID_REQUEST", "501 character post");
    }

    const commentBody = await expectOk<CommentResponse>(
      await request.post(`/api/posts/v1/${postBody.data.id}/comments`, {
        headers: authHeaders(primary),
        data: { content: fiveHundredChars },
        timeout: REQUEST_TIMEOUT,
      }),
      "500 character comment",
    );
    expect(commentBody.data.content).toBe(fiveHundredChars);

    await expectErrorSoft(
      await request.post(`/api/posts/v1/${postBody.data.id}/comments`, {
        headers: authHeaders(primary),
        data: { content: fiveHundredOneChars },
        timeout: REQUEST_TIMEOUT,
      }),
      400,
      "INVALID_REQUEST",
      "501 character comment",
    );

    const lowLimit = await expectOk<PostResponse[]>(
      await request.get("/api/posts/v1?limit=0", {
        headers: authHeaders(primary),
        timeout: REQUEST_TIMEOUT,
      }),
      "post low limit clamp",
    );
    expect.soft(lowLimit.meta?.limit, "post low limit meta").toBe(1);

    const highLimit = await expectOk<PostResponse[]>(
      await request.get("/api/posts/v1?limit=101", {
        headers: authHeaders(primary),
        timeout: REQUEST_TIMEOUT,
      }),
      "post high limit clamp",
    );
    expect.soft(highLimit.meta?.limit, "post high limit meta").toBe(100);
  });

  test("invalid friend method returns a domain error", async ({ request }) => {
    test.setTimeout(60_000);
    await expectErrorSoft(
      await request.post("/api/friends/v1", {
        headers: authHeaders(primary),
        data: { friendId: secondary.id, method: "unknown" },
        timeout: REQUEST_TIMEOUT,
      }),
      400,
      "INVALID_FRIEND_METHOD",
      "invalid friend method",
    );
  });

  test("friend, chat, reentry, and authorization boundaries hold in production", async ({ request, page }) => {
    test.setTimeout(120_000);
    const fiveHundredChars = "메".repeat(500);

    const friend = await expectOk<FriendResponse>(
      await request.post("/api/friends/v1", {
        headers: authHeaders(primary),
        data: { friendId: secondary.id, method: "same_city" },
        timeout: REQUEST_TIMEOUT,
      }),
      "add friend",
    );
    expect(friend.data.id).toBe(secondary.id);

    const room = await expectOk<ChatRoomResponse>(
      await request.post("/api/chat/v1/rooms", {
        headers: authHeaders(primary),
        data: { friendId: secondary.id },
        timeout: REQUEST_TIMEOUT,
      }),
      "create chat room",
    );
    expect(room.data.friendId).toBe(secondary.id);

    await expectErrorSoft(
      await request.get(`/api/chat/v1/rooms/${room.data.id}/messages`, {
        headers: authHeaders(outsider),
        timeout: REQUEST_TIMEOUT,
      }),
      403,
      "CHAT403",
      "non-participant chat read",
    );

    await expectErrorSoft(
      await request.post(`/api/chat/v1/rooms/${room.data.id}/messages`, {
        headers: authHeaders(primary),
        data: { content: "   " },
        timeout: REQUEST_TIMEOUT,
      }),
      400,
      "INVALID_REQUEST",
      "blank chat message",
    );

    const message = await expectOk<ChatMessageResponse>(
      await request.post(`/api/chat/v1/rooms/${room.data.id}/messages`, {
        headers: authHeaders(primary),
        data: { content: fiveHundredChars },
        timeout: REQUEST_TIMEOUT,
      }),
      "500 character chat message",
    );
    expect(message.data.content).toBe(fiveHundredChars);

    await expectErrorSoft(
      await request.post(`/api/chat/v1/rooms/${room.data.id}/messages`, {
        headers: authHeaders(primary),
        data: { content: `${fiveHundredChars}초` },
        timeout: REQUEST_TIMEOUT,
      }),
      400,
      "INVALID_REQUEST",
      "501 character chat message",
    );

    await setBrowserTokens(page, primary);
    await page.goto(`/chat/${room.data.id}`, { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
    await expect(page.getByText(fiveHundredChars, { exact: true })).toBeVisible();
    await page.goto("/feed", { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
    await expect(page.getByText(fiveHundredChars.slice(0, 80))).toBeVisible();
    await page.goto(`/chat/${room.data.id}`, { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
    await expect(page.getByText(fiveHundredChars, { exact: true })).toBeVisible();
  });

  test("withdrawal clears access and grace-period login restores the account", async ({ request, page }) => {
    test.setTimeout(120_000);
    const oldTokens = primary.tokens;

    await expectOk<null>(
      await request.delete("/api/users/v1/me", {
        headers: authHeaders(primary),
        timeout: REQUEST_TIMEOUT,
      }),
      "withdraw account",
    );

    await expectError(
      await request.get("/api/users/v1/me", {
        headers: authHeaders(oldTokens),
        timeout: REQUEST_TIMEOUT,
      }),
      401,
      "UNAUTHORIZED",
      "old token after withdrawal",
    );

    const restored = await login(request, primary);
    expect(restored.restored).toBe(true);

    await setBrowserTokens(page, primary);
    await page.goto("/profile", { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT });
    await expect(page.getByRole("heading", { name: "여행 여권" })).toBeVisible();
    await expect(page.getByText(primary.name)).toBeVisible();
  });
});
