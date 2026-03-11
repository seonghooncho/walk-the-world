import { describe, expect, it } from "vitest";
import { isValidSignupPassword, normalizePassword } from "@/lib/password";

describe("signup password validation", () => {
  it("accepts passwords with letters and digits over 6 chars", () => {
    expect(isValidSignupPassword("abc123")).toBe(true);
    expect(isValidSignupPassword("A1bcde")).toBe(true);
  });

  it("rejects passwords missing digits or letters", () => {
    expect(isValidSignupPassword("abcdef")).toBe(false);
    expect(isValidSignupPassword("123456")).toBe(false);
    expect(isValidSignupPassword("abc12")).toBe(false);
  });

  it("normalizes leading and trailing spaces before validation", () => {
    expect(normalizePassword(" abc123 ")).toBe("abc123");
    expect(isValidSignupPassword(" abc123 ")).toBe(true);
  });
});
