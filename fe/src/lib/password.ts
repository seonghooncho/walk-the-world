export const PASSWORD_RULE_MESSAGE = "비밀번호는 영문과 숫자를 포함해 6자 이상이어야 합니다";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{6,100}$/;

export function normalizePassword(value: string) {
  return value.trim();
}

export function isValidSignupPassword(value: string) {
  return PASSWORD_PATTERN.test(normalizePassword(value));
}
