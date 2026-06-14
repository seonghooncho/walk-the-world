import { expect, test, type Page } from "@playwright/test";

const apiResponse = (data: unknown) => ({
  success: true,
  data,
});

const mockApi = async (page: Page) => {
  await page.route("**/api/users/v1/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(apiResponse({
        id: 1,
        email: "demo@walkworld.app",
        name: "테스트 여행자",
        avatarUrl: null,
        totalSteps: 450000,
        currentCityId: "tokyo",
        coupons: 2,
        hearts: 5,
        friendCount: 0,
        createdAt: "2026-06-14T00:00:00Z",
      })),
    });
  });

  await page.route("**/api/steps/v1", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(apiResponse({
        totalSteps: 450000,
        currentCityId: "tokyo",
        currentCityName: "도쿄",
        nextCityId: "beijing",
        nextCityName: "베이징",
        stepsToNextCity: 120000,
        progressPercent: 62,
        newlyUnlockedCities: [],
      })),
    });
  });

  await page.route("**/api/currency/v1", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(apiResponse({ coupons: 2, hearts: 5 })) });
  });

  await page.route("**/api/badges/v1**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(apiResponse({ totalEarned: 0, totalPossible: 0, badges: [] })),
    });
  });

  await page.route("**/api/cities/v1/tokyo/members", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(apiResponse([])) });
  });

  await page.route("**/api/posts/v1**", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(apiResponse([])) });
  });

  await page.route("**/api/chat/v1/rooms", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(apiResponse([])) });
  });
};

test("guest can preview journey and map without login", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByText("도쿄 preview")).toBeVisible();
  await expect(page.getByText("내 걸음으로 이어서 여행하기")).toBeVisible();

  await page.getByRole("button", { name: "노선도" }).click();
  await expect(page.getByText("현재 체크포인트")).toBeVisible();
  await expect(page.getByText(/나의 여행 노선도/)).toBeVisible();
});

test("protected pages redirect to login with redirect query", async ({ page }) => {
  await mockApi(page);
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fprofile/);
  await expect(page.getByRole("heading", { name: "걸어서 세계속으로" })).toBeVisible();
});

test("oauth callback stores tokens and opens the requested protected page", async ({ page }) => {
  await mockApi(page);
  await page.goto("/auth/callback#accessToken=access-token&refreshToken=refresh-token&redirect=/profile");

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("테스트 여행자")).toBeVisible();
  await expect(page.getByRole("heading", { name: "프로필" })).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("ww_access_token"))).resolves.toBe("access-token");
  await expect(page.evaluate(() => localStorage.getItem("ww_refresh_token"))).resolves.toBe("refresh-token");
});

test("demo page presents journey, mission, and city preview tabs", async ({ page }) => {
  await mockApi(page);
  await page.goto("/demo");

  await expect(page.getByText("walk2world 데모")).toBeVisible();
  await expect(page.getByText("현재 preview 도시")).toBeVisible();

  await page.getByRole("button", { name: "미션" }).click();
  await expect(page.getByText("도쿄 미션")).toBeVisible();

  await page.getByRole("button", { name: "도시" }).click();
  await expect(page.getByText("같은 도시에 있는 여행자")).toBeVisible();
});
