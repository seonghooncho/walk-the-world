import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.LIVE_E2E_BASE_URL;
const useExternalServer = Boolean(externalBaseURL);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL: externalBaseURL || "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: useExternalServer
    ? undefined
    : {
        command: "VITE_GOOGLE_CLIENT_ID=test-google-client-id npm run dev -- --host 127.0.0.1 --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: false,
        timeout: 120_000,
      },
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
