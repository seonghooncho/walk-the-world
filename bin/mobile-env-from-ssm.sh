#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-prod}"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
SSM_PREFIX="${SSM_PREFIX:-/walkworld/${ENVIRONMENT}/mobile}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_FILE="${ROOT_DIR}/mobile/.env.local"

get_param() {
  aws ssm get-parameter \
    --with-decryption \
    --region "${AWS_REGION}" \
    --name "$1" \
    --query 'Parameter.Value' \
    --output text
}

get_optional_param() {
  if aws ssm get-parameter --with-decryption --region "${AWS_REGION}" --name "$1" >/dev/null 2>&1; then
    get_param "$1"
  else
    printf ''
  fi
}

cat >"${TARGET_FILE}" <<EOF
EXPO_PUBLIC_API_BASE_URL=$(get_param "${SSM_PREFIX}/EXPO_PUBLIC_API_BASE_URL")
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=$(get_optional_param "${SSM_PREFIX}/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID")
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=$(get_optional_param "${SSM_PREFIX}/EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID")
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=$(get_optional_param "${SSM_PREFIX}/EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID")
EOF

printf 'Wrote %s\n' "${TARGET_FILE}"
