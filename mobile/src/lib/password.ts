export const PASSWORD_RULE_MESSAGE = "비밀번호는 영문과 숫자를 포함해 6자 이상이어야 합니다";

export function normalizePassword(password: string) {
  return password.trim();
}

export function isValidSignupPassword(password: string) {
  const normalized = normalizePassword(password);
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(normalized);
}
