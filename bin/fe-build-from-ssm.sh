#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-prod}"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
SSM_PREFIX="${SSM_PREFIX:-/walkworld/${ENVIRONMENT}/frontend}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

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

export VITE_API_BASE_URL="$(get_param "${SSM_PREFIX}/VITE_API_BASE_URL")"
export VITE_GOOGLE_CLIENT_ID="$(get_optional_param "${SSM_PREFIX}/VITE_GOOGLE_CLIENT_ID")"

cd "${ROOT_DIR}/fe"
npm run build
