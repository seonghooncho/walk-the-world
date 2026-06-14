import { describe, expect, it } from "vitest";
import { buildGuestPreviewStepInfo, buildPassportSnapshot, getStaticCities } from "@/lib/city-utils";

describe("guest preview state", () => {
  it("uses tokyo as the current city preview for the session-first passport demo", () => {
    const cities = getStaticCities();
    const preview = buildGuestPreviewStepInfo(cities);
    const passport = buildPassportSnapshot(cities, preview.totalSteps, new Set<string>());

    expect(preview.currentCityId).toBe("tokyo");
    expect(preview.currentCityName).toBe("도쿄");
    expect(preview.totalSteps).toBeGreaterThanOrEqual(400000);
    expect(passport.travelTickets).toBeGreaterThan(0);
    expect(passport.stampsEarned).toBeGreaterThan(0);
    expect(passport.sessionsCompleted).toBeGreaterThan(0);
  });
});
