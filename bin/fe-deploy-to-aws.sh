#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-prod}"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/terraform/minimum/env/${ENVIRONMENT}"

if [[ ! -d "${TF_DIR}" ]]; then
  echo "Terraform environment not found: ${TF_DIR}" >&2
  exit 1
fi

"${ROOT_DIR}/bin/fe-build-from-ssm.sh" "${ENVIRONMENT}"

FRONTEND_BUCKET="$(terraform -chdir="${TF_DIR}" output -raw frontend_bucket_name)"
CLOUDFRONT_DISTRIBUTION_ID="$(terraform -chdir="${TF_DIR}" output -raw cloudfront_distribution_id)"

aws s3 sync "${ROOT_DIR}/fe/dist/" "s3://${FRONTEND_BUCKET}" --delete --region "${AWS_REGION}"

INVALIDATION_ID="$(
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text
)"

echo "Frontend bucket: ${FRONTEND_BUCKET}"
echo "CloudFront distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
echo "Invalidation id: ${INVALIDATION_ID}"
