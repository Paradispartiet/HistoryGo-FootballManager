import { defineConfig, devices } from "@playwright/test";

const FULL_SEASON_SPEC = /manager-career-full-season-playthrough-v1\.spec\.js/;

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  },
  projects: [
    {
      name: "chromium",
      testIgnore: FULL_SEASON_SPEC,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "chromium-full-season",
      testMatch: FULL_SEASON_SPEC,
      dependencies: ["chromium"],
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
