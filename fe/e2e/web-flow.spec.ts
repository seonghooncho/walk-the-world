import { expect, test, type Page, type Route } from "@playwright/test";

const apiResponse = (data: unknown) => ({
  success: true,
  data,
});

const authenticate = async (page: Page) => {
  await page.addInitScript(() => {
    if (window.name !== "ww_disable_auto_auth") {
      localStorage.setItem("ww_access_token", "access-token");
      localStorage.setItem("ww_refresh_token", "refresh-token");
    }
  });
};

const routeGoogleIdentityScript = async (page: Page) => {
  await page.route(/^https:\/\/accounts\.google\.com\/gsi\/client/, async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: `
        (() => {
          let credentialCallback = null;
          window.google = {
            accounts: {
              id: {
                initialize(config) {
                  credentialCallback = config.callback;
                },
                renderButton(element) {
                  const button = document.createElement("button");
                  button.type = "button";
                  button.textContent = "Google 테스트 로그인";
                  button.setAttribute("aria-label", "Google 테스트 로그인");
                  button.style.width = "100%";
                  button.addEventListener("click", () => {
                    credentialCallback?.({ credential: "google-test-id-token" });
                  });
                  element.appendChild(button);
                },
              },
            },
          };
        })();
      `,
    });
  });
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

const mockApi = async (page: Page, options: { initialFriend?: boolean } = {}) => {
  let friendAdded = options.initialFriend ?? false;
  const chatRooms = [
    {
      id: 10,
      friendId: 2,
      friendName: "민서",
      friendAvatar: null,
      lastMessage: "도쿄 미션 같이 해요",
      lastMessageAt: "2026-06-14T01:00:00Z",
      unreadCount: 0,
    },
  ];
  const messages = [
    {
      id: 100,
      senderId: 2,
      content: "도쿄 미션 같이 해요",
      read: true,
      createdAt: "2026-06-14T01:00:00Z",
    },
  ];
  const comments: Array<{
    id: number;
    postId: number;
    userId: number;
    userName: string;
    userAvatarUrl: string | null;
    content: string;
    createdAt: string;
  }> = [];
  const posts: Array<{
    id: number;
    userId: number;
    userName: string;
    userAvatarUrl: string | null;
    cityId: string;
    content: string;
    image: null;
    likes: number;
    comments: number;
    isLiked: boolean;
    createdAt: string;
  }> = [];
  let ticketBalance = 4;
  let couponBalance = 2;
  const todaySession = {
    sessionId: null as number | null,
    sessionDate: "2026-06-14",
    status: "ready",
    activityType: "walk",
    cityId: "tokyo",
    cityName: "도쿄",
    countryFlag: "🇯🇵",
    dailyGoalMeters: 1000,
    distanceMeters: 0,
    bonusMeters: 0,
    progressMeters: 0,
    progressPercent: 0,
    durationSeconds: 0,
    ticketsEarned: 0,
    stampsEarned: 0,
    environmentHint: "city",
    playlistTitle: "오늘의 산책 플레이리스트",
    playlistUrl: "https://pixabay.com/music/search/travel%20walk/",
    startedAt: null as string | null,
    endedAt: null as string | null,
    missions: [
      {
        id: null as number | null,
        missionKey: "open_sky",
        title: "뻥 뚫린 오늘 하늘 찍기",
        description: "산책 중 고개를 들었을 때 보이는 하늘을 사진으로 남겨보세요.",
        proofType: "photo",
        emoji: "☁️",
        bonusMeters: 120,
        stampReward: "하늘 산책 스탬프",
        status: "available",
        verificationStatus: "pending",
        imageUrl: null,
        completedAt: null as string | null,
      },
      {
        id: null as number | null,
        missionKey: "walk_15",
        title: "15분 산책 유지",
        description: "오늘의 세션을 15분 이상 이어가면 완료할 수 있어요.",
        proofType: "session",
        emoji: "⏱️",
        bonusMeters: 160,
        stampReward: "꾸준함 스탬프",
        status: "available",
        verificationStatus: "pending",
        imageUrl: null,
        completedAt: null as string | null,
      },
      {
        id: null as number | null,
        missionKey: "walk_note",
        title: "산책 기분 한 줄",
        description: "오늘 걸으면서 좋았던 장면을 한 줄로 남겨보세요.",
        proofType: "text",
        emoji: "✍️",
        bonusMeters: 80,
        stampReward: "기분 기록 스탬프",
        status: "available",
        verificationStatus: "pending",
        imageUrl: null,
        completedAt: null as string | null,
      },
      {
        id: null as number | null,
        missionKey: "crosswalk",
        title: "횡단보도 한 컷",
        description: "안전하게 멈춘 순간, 횡단보도나 보행자 표식을 찍어보세요.",
        proofType: "photo",
        emoji: "🚶",
        bonusMeters: 100,
        stampReward: "도시 보행 스탬프",
        status: "available",
        verificationStatus: "pending",
        imageUrl: null,
        completedAt: null as string | null,
      },
      {
        id: null as number | null,
        missionKey: "snack_find",
        title: "산책 간식 발견",
        description: "편의점이나 가게에서 기분 좋은 간식 하나를 찾아 기록해보세요.",
        proofType: "photo",
        emoji: "🍿",
        bonusMeters: 120,
        stampReward: "간식 탐험 스탬프",
        status: "available",
        verificationStatus: "pending",
        imageUrl: null,
        completedAt: null as string | null,
      },
    ],
  };
  const friendStories = [
    {
      id: 1,
      userId: 2,
      userName: "민서",
      userAvatarUrl: null,
      cityId: "tokyo",
      missionTitle: "뻥 뚫린 오늘 하늘 찍기",
      content: "퇴근길 하늘이 여행지 같았어요.",
      imageUrl: null,
      imageKey: null,
      createdAt: "2026-06-14T03:00:00Z",
    },
  ];

  const fulfill = (route: Route, data: unknown, meta?: unknown) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ ...apiResponse(data), meta }) });

  await page.route(/^https:\/\/api\.open-meteo\.com\/v1\/forecast/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        current: {
          temperature_2m: 22,
          precipitation: 0,
          weather_code: 1,
          wind_speed_10m: 8,
        },
      }),
    });
  });

  await page.route(/^https?:\/\/[^/]+\/api\//, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (path === "/api/auth/v1/login" && method === "POST") {
      await fulfill(route, {
        accessToken: "restored-access-token",
        refreshToken: "restored-refresh-token",
        expiresIn: 3600,
        restored: true,
      });
      return;
    }

    if (path === "/api/auth/v1/google" && method === "POST") {
      await fulfill(route, {
        accessToken: "google-access-token",
        refreshToken: "google-refresh-token",
        expiresIn: 3600,
      });
      return;
    }

    if (path === "/api/auth/v1/oauth/kakao/start" && method === "GET") {
      const redirectPath = url.searchParams.get("redirectPath") ?? "/";
      const frontendOrigin = url.searchParams.get("frontendOrigin") ?? url.origin;
      const callbackUrl = new URL("/auth/callback", frontendOrigin);
      callbackUrl.hash = new URLSearchParams({
        accessToken: "kakao-access-token",
        refreshToken: "kakao-refresh-token",
        redirect: redirectPath,
      }).toString();

      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl.toString() },
        body: "",
      });
      return;
    }

    if (path === "/api/users/v1/me" && method === "GET") {
      await fulfill(route, {
        id: 1,
        email: "demo@walkworld.app",
        name: "테스트 여행자",
        avatarUrl: null,
        totalSteps: 450000,
        currentCityId: "tokyo",
        coupons: couponBalance,
        hearts: 5,
        tickets: ticketBalance,
        friendCount: friendAdded ? 1 : 0,
        createdAt: "2026-06-14T00:00:00Z",
      });
      return;
    }

    if (path === "/api/users/v1/me" && method === "DELETE") {
      await fulfill(route, null);
      return;
    }

    if (path === "/api/users/v1/2") {
      await fulfill(route, {
        id: 2,
        name: "민서",
        avatarUrl: null,
        totalSteps: 82000,
        currentCityId: "tokyo",
        isFriend: friendAdded,
        joinedAt: "2026-06-01T00:00:00Z",
      });
      return;
    }

    if (path === "/api/steps/v1") {
      await fulfill(route, {
        totalSteps: 450000,
        currentCityId: "tokyo",
        currentCityName: "도쿄",
        nextCityId: "beijing",
        nextCityName: "베이징",
        stepsToNextCity: 120000,
        progressPercent: 62,
        newlyUnlockedCities: [],
      });
      return;
    }

    if (path === "/api/currency/v1" && method === "GET") {
      await fulfill(route, { coupons: couponBalance, hearts: 5, tickets: ticketBalance });
      return;
    }

    if (path === "/api/currency/v1/exchange/friend-coupon" && method === "POST") {
      ticketBalance -= 3;
      couponBalance += 1;
      await fulfill(route, { coupons: couponBalance, hearts: 5, tickets: ticketBalance });
      return;
    }

    if (path === "/api/badges/v1") {
      await fulfill(route, { totalEarned: 0, totalPossible: 0, badges: [] });
      return;
    }

    if (path === "/api/cities/v1/tokyo/members") {
      await fulfill(route, [
        {
          id: 2,
          name: "민서",
          avatarUrl: null,
          totalSteps: 82000,
          isFriend: friendAdded,
        },
      ]);
      return;
    }

    if (path === "/api/friends/v1" && method === "POST") {
      friendAdded = true;
      await fulfill(route, {
        id: 2,
        name: "민서",
        avatarUrl: null,
        totalSteps: 82000,
        currentCityId: "tokyo",
        method: "same_city",
        friendSince: "2026-06-14T02:00:00Z",
      });
      return;
    }

    if (path === "/api/chat/v1/rooms" && method === "GET") {
      await fulfill(route, friendAdded ? chatRooms : []);
      return;
    }

    if (path === "/api/chat/v1/rooms" && method === "POST") {
      friendAdded = true;
      await fulfill(route, chatRooms[0]);
      return;
    }

    if (path === "/api/chat/v1/rooms/10/messages" && method === "GET") {
      await fulfill(route, messages);
      return;
    }

    if (path === "/api/chat/v1/rooms/10/messages" && method === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { content?: string };
      const message = {
        id: 100 + messages.length,
        senderId: 1,
        content: body.content ?? "",
        read: false,
        createdAt: "2026-06-14T02:00:00Z",
      };
      messages.push(message);
      chatRooms[0].lastMessage = message.content;
      chatRooms[0].lastMessageAt = message.createdAt;
      await fulfill(route, message);
      return;
    }

    if (path === "/api/chat/v1/rooms/10/read") {
      await fulfill(route, null);
      return;
    }

    if (path === "/api/posts/v1/me" && method === "GET") {
      await fulfill(route, []);
      return;
    }

    if (path === "/api/posts/v1" && method === "GET") {
      await fulfill(route, posts);
      return;
    }

    if (path === "/api/posts/v1" && method === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { content?: string; cityId?: string };
      const post = {
        id: 20 + posts.length,
        userId: 1,
        userName: "테스트 여행자",
        userAvatarUrl: null,
        cityId: body.cityId ?? "tokyo",
        content: body.content ?? "",
        image: null,
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: "2026-06-14T03:00:00Z",
      };
      posts.unshift(post);
      await fulfill(route, post);
      return;
    }

    if (path === "/api/posts/v1/5" && method === "GET") {
      await fulfill(route, {
        id: 5,
        userId: 2,
        userName: "민서",
        userAvatarUrl: null,
        cityId: "tokyo",
        content: "도쿄 타워 야경이 좋았어요",
        image: null,
        likes: 3,
        comments: comments.length,
        isLiked: false,
        createdAt: "2026-06-14T00:30:00Z",
      });
      return;
    }

    if (path === "/api/posts/v1/5/comments" && method === "GET") {
      await fulfill(route, comments);
      return;
    }

    if (path === "/api/posts/v1/5/comments" && method === "POST") {
      const body = JSON.parse(request.postData() ?? "{}") as { content?: string };
      const comment = {
        id: comments.length + 1,
        postId: 5,
        userId: 1,
        userName: "테스트 여행자",
        userAvatarUrl: null,
        content: body.content ?? "",
        createdAt: "2026-06-14T02:30:00Z",
      };
      comments.push(comment);
      await fulfill(route, comment);
      return;
    }

    if (path === "/api/sessions/v1/today" && method === "GET") {
      await fulfill(route, todaySession);
      return;
    }

    if (path === "/api/sessions/v1" && method === "POST") {
      todaySession.sessionId = 77;
      todaySession.status = "active";
      todaySession.startedAt = "2026-06-14T04:00:00Z";
      todaySession.missions = todaySession.missions.map((mission, index) => ({ ...mission, id: 770 + index }));
      await fulfill(route, todaySession);
      return;
    }

    if (path === "/api/sessions/v1/77/locations" && method === "POST") {
      todaySession.distanceMeters += 220;
      todaySession.progressMeters = todaySession.distanceMeters + todaySession.bonusMeters;
      todaySession.progressPercent = Math.min(100, Math.round((todaySession.progressMeters / todaySession.dailyGoalMeters) * 100));
      await fulfill(route, {
        sessionId: 77,
        distanceMeters: todaySession.distanceMeters,
        bonusMeters: todaySession.bonusMeters,
        progressMeters: todaySession.progressMeters,
        progressPercent: todaySession.progressPercent,
        distanceAddedMeters: 220,
      });
      return;
    }

    if (path === "/api/sessions/v1/77/missions/771/proof" && method === "POST") {
      todaySession.missions[1].status = "completed";
      todaySession.missions[1].verificationStatus = "verified";
      todaySession.missions[1].completedAt = "2026-06-14T04:05:00Z";
      todaySession.bonusMeters += todaySession.missions[1].bonusMeters;
      todaySession.progressMeters = todaySession.distanceMeters + todaySession.bonusMeters;
      todaySession.progressPercent = Math.min(100, Math.round((todaySession.progressMeters / todaySession.dailyGoalMeters) * 100));
      todaySession.stampsEarned = 1;
      await fulfill(route, {
        missionId: 771,
        status: "completed",
        verificationStatus: "verified",
        bonusMeters: todaySession.missions[1].bonusMeters,
        progressMeters: todaySession.progressMeters,
        progressPercent: todaySession.progressPercent,
        storyId: 2,
      });
      return;
    }

    if (path === "/api/sessions/v1/77/finish" && method === "POST") {
      todaySession.status = "abandoned";
      todaySession.endedAt = "2026-06-14T04:12:00Z";
      todaySession.durationSeconds = 720;
      todaySession.ticketsEarned = 2;
      ticketBalance += 2;
      await fulfill(route, {
        sessionId: 77,
        status: todaySession.status,
        distanceMeters: todaySession.distanceMeters,
        bonusMeters: todaySession.bonusMeters,
        progressMeters: todaySession.progressMeters,
        progressPercent: todaySession.progressPercent,
        durationSeconds: todaySession.durationSeconds,
        ticketsEarned: todaySession.ticketsEarned,
        stampsEarned: todaySession.stampsEarned,
        couponExchangeAvailable: ticketBalance >= 3,
      });
      return;
    }

    if (path === "/api/stories/v1/friends" && method === "GET") {
      await fulfill(route, friendStories);
      return;
    }

    await fulfill(route, null);
  });
};

test("guest can preview journey and map without login", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByText("오늘 여행 인덱스")).toBeVisible();
  await expect(page.getByText("서울로 떠나는 오늘 산책")).toBeVisible();
  await expect(page.getByText("오늘의 산책 시작하기")).toBeVisible();
  await expect(page.getByText("오늘 미션")).toBeVisible();
  await expect(page.getByText("내 여권으로 여행 시작하기")).toBeVisible();

  await page.getByRole("button", { name: "여권지도" }).click();
  await expect(page.getByText("다음 여권 페이지")).toBeVisible();
  await expect(page.getByText(/스탬프를 모아 다음 도시를 여세요/)).toBeVisible();
});

test("protected pages redirect to login with redirect query", async ({ page }) => {
  await mockApi(page);
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fprofile/);
  await expect(page.getByRole("heading", { name: "걸어서 세계속으로" })).toBeVisible();
});

test("daily session starts with GPS, completes a mission, and awards partial results", async ({ page, context }) => {
  test.setTimeout(45_000);
  await authenticate(page);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 37.5665, longitude: 126.978 });
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByText("오늘 여행 인덱스")).toBeVisible();
  await page.getByRole("button", { name: "오늘의 산책 시작하기" }).click();

  await expect(page.getByText("여행 출발 중")).toBeVisible();
  await expect(page.getByText("도쿄에 도착했어요")).toBeVisible({ timeout: 9000 });
  await expect(page.getByText("도쿄 여행 미션")).toBeVisible({ timeout: 12000 });
  await expect(page.getByText(/GPS 기록 중|GPS 연결됨/)).toBeVisible();
  await expect(page.getByText(/구름 조금|날씨 기반 미션 적용/)).toBeVisible();

  await page.getByRole("button", { name: "미션 넘어가기" }).click();
  await page.getByRole("button", { name: "세션 기록으로 인증하기" }).click();
  await expect(page.getByText("현재 게이지 600m / 1.00km · 1/5개 완료")).toBeVisible();
  await expect(page.getByText("인증 완료 · 꾸준함 스탬프")).toBeVisible();

  await page.getByRole("button", { name: "오늘 산책 끝내기" }).click();
  await expect(page.getByText("오늘의 결과")).toBeVisible();
  await expect(page.getByText("중간에 멈춘 여행도 기록됐어요")).toBeVisible();
  await expect(page.getByText("획득 티켓")).toBeVisible();
});

test("oauth callback stores tokens and opens the requested protected page", async ({ page }) => {
  await mockApi(page);
  await page.goto("/auth/callback#accessToken=access-token&refreshToken=refresh-token&redirect=/profile");

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("테스트 여행자")).toBeVisible();
  await expect(page.getByRole("heading", { name: "여행 여권" })).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("ww_access_token"))).resolves.toBe("access-token");
  await expect(page.evaluate(() => localStorage.getItem("ww_refresh_token"))).resolves.toBe("refresh-token");
});

test("google login stores tokens and restores the requested protected page", async ({ page }) => {
  await routeGoogleIdentityScript(page);
  await mockApi(page);
  await page.goto("/login?redirect=/profile");

  await page.getByRole("button", { name: "Google 테스트 로그인" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("테스트 여행자")).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("ww_access_token"))).resolves.toBe("google-access-token");
  await expect(page.evaluate(() => localStorage.getItem("ww_refresh_token"))).resolves.toBe("google-refresh-token");
});

test("kakao oauth start callback stores tokens and restores the requested protected page", async ({ page }) => {
  await mockApi(page);
  await page.goto("/login?redirect=/profile");

  await page.getByRole("button", { name: "카카오로 시작하기" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("테스트 여행자")).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("ww_access_token"))).resolves.toBe("kakao-access-token");
  await expect(page.evaluate(() => localStorage.getItem("ww_refresh_token"))).resolves.toBe("kakao-refresh-token");
});

test("city member can be added as a friend and turns into a message action", async ({ page }) => {
  await authenticate(page);
  await mockApi(page);
  await page.goto("/city");

  await page.getByRole("button", { name: "여행자" }).click();
  await expect(page.getByText("민서")).toBeVisible();

  await page.getByRole("button", { name: "친추" }).click();
  await expect(page.getByText("친구 요청을 보낼까요?")).toBeVisible();
  await page.getByRole("button", { name: "친구 추가" }).click();

  await expect(page.getByRole("button", { name: "메시지" })).toBeVisible();
});

test("chat room sends a message and renders it in the thread", async ({ page }) => {
  await authenticate(page);
  await mockApi(page, { initialFriend: true });
  await page.goto("/chat/10");

  await expect(page.getByText("도쿄 미션 같이 해요")).toBeVisible();
  await page.getByPlaceholder("메시지를 입력하세요...").fill("좋아요, 같이 가요");
  await page.getByRole("button", { name: "메시지 보내기" }).click();

  await expect(page.getByText("좋아요, 같이 가요")).toBeVisible();
});

test("chat input blocks blank content, accepts 500 characters, and keeps sent message after reentry", async ({ page }) => {
  await authenticate(page);
  await mockApi(page, { initialFriend: true });
  await page.goto("/chat/10");

  const messageInput = page.getByPlaceholder("메시지를 입력하세요...");
  const sendButton = page.getByRole("button", { name: "메시지 보내기" });
  const boundaryMessage = "가".repeat(500);

  await messageInput.fill("   ");
  await expect(sendButton).toBeDisabled();

  await messageInput.fill(`${boundaryMessage}초과`);
  await expect(messageInput).toHaveValue(boundaryMessage);
  await sendButton.click();

  await expect(page.getByText(boundaryMessage)).toBeVisible();

  await page.goto("/feed");
  await expect(page.getByText(boundaryMessage)).toBeVisible();

  await page.goto("/chat/10");
  await expect(page.getByText(boundaryMessage)).toBeVisible();
});

test("post detail accepts a new comment", async ({ page }) => {
  await authenticate(page);
  await mockApi(page);
  await page.goto("/post/5");

  await expect(page.getByText("도쿄 타워 야경이 좋았어요")).toBeVisible();
  await page.getByPlaceholder("댓글을 입력하세요...").fill("저도 가보고 싶어요");
  await page.getByRole("button", { name: "댓글 보내기" }).click();

  await expect(page.getByText("저도 가보고 싶어요")).toBeVisible();
});

test("post and comment inputs enforce the 500 character boundary", async ({ page }) => {
  await authenticate(page);
  await mockApi(page);
  const boundaryText = "나".repeat(500);

  await page.goto("/post/5");
  const commentInput = page.getByPlaceholder("댓글을 입력하세요...");
  await commentInput.fill(`${boundaryText}초과`);
  await expect(commentInput).toHaveValue(boundaryText);
  await page.getByRole("button", { name: "댓글 보내기" }).click();
  await expect(page.getByText(boundaryText)).toBeVisible();

  await page.goto("/city");
  await page.getByRole("button", { name: "미션 인증 올리기" }).click();
  const postInput = page.getByPlaceholder("예: 15분 산책 완료. 빨간 간판은 편의점 앞에서 찾았어요.");
  await postInput.fill(`${boundaryText}초과`);
  await expect(postInput).toHaveValue(boundaryText);
  await page.getByRole("button", { name: "미션 인증 제출" }).click();
  await expect(page.getByRole("heading", { name: "미션 인증 올리기" })).toBeHidden();
  await expect(page.locator("p").filter({ hasText: boundaryText }).first()).toBeVisible();
});

test("account withdrawal clears tokens and grace-period login restores the account", async ({ page }) => {
  await authenticate(page);
  await mockApi(page);
  await page.goto("/profile");
  await page.evaluate(() => {
    window.name = "ww_disable_auto_auth";
  });

  await page.getByRole("button", { name: "설정 열기" }).click();
  await page.getByRole("button", { name: "회원탈퇴" }).click();
  await page.getByRole("button", { name: "탈퇴하기" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.evaluate(() => localStorage.getItem("ww_access_token"))).resolves.toBeNull();
  await expect(page.evaluate(() => localStorage.getItem("ww_refresh_token"))).resolves.toBeNull();

  await page.goto("/login?redirect=/profile");
  await page.getByPlaceholder("이메일").fill("demo@walkworld.app");
  await page.getByPlaceholder("비밀번호").fill("Password1");
  await page.locator("form").getByRole("button", { name: "로그인" }).click();

  await expect(page.getByRole("heading", { name: "여행 여권" })).toBeVisible();
  await expect(page.getByText("계정이 복구되었습니다")).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem("ww_access_token"))).resolves.toBe("restored-access-token");
});

test("demo page presents journey, mission, and city preview tabs", async ({ page }) => {
  await mockApi(page);
  await page.goto("/demo");

  await expect(page.getByText("walk2world 데모")).toBeVisible();
  await expect(page.getByText("추천 walk/run trip")).toBeVisible();

  await page.getByRole("button", { name: "미션" }).click();
  await expect(page.getByText("도쿄 proof missions")).toBeVisible();

  await page.getByRole("button", { name: "피드" }).click();
  await expect(page.getByText("미션 인증 피드")).toBeVisible();
});
