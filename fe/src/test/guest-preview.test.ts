import { describe, expect, it } from "vitest";
import { buildGuestPreviewStepInfo, getStaticCities } from "@/lib/city-utils";

describe("guest preview state", () => {
  it("uses tokyo as the current city preview on home and map", () => {
    const cities = getStaticCities();
    const preview = buildGuestPreviewStepInfo(cities);

    expect(preview.currentCityId).toBe("tokyo");
    expect(preview.currentCityName).toBe("도쿄");
    expect(preview.totalSteps).toBeGreaterThanOrEqual(400000);
    expect(preview.stepsToNextCity).toBeGreaterThan(0);
  });
});
