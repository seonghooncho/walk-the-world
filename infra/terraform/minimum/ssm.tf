resource "aws_ssm_parameter" "backend_db_url" {
  name  = "${local.ssm_prefix}/backend/DB_URL"
  type  = "SecureString"
  value = local.database_jdbc_url
}

resource "aws_ssm_parameter" "backend_db_username" {
  name  = "${local.ssm_prefix}/backend/DB_USERNAME"
  type  = "String"
  value = neon_project.app.database_user
}

resource "aws_ssm_parameter" "backend_db_password" {
  name  = "${local.ssm_prefix}/backend/DB_PASSWORD"
  type  = "SecureString"
  value = neon_project.app.database_password
}

resource "aws_ssm_parameter" "backend_jwt_secret" {
  name  = "${local.ssm_prefix}/backend/JWT_SECRET"
  type  = "SecureString"
  value = local.effective_jwt_secret
}

resource "aws_ssm_parameter" "backend_s3_bucket" {
  name  = "${local.ssm_prefix}/backend/S3_BUCKET"
  type  = "String"
  value = aws_s3_bucket.uploads.id
}

resource "aws_ssm_parameter" "backend_ai_api_base_url" {
  name  = "${local.ssm_prefix}/backend/AI_API_BASE_URL"
  type  = "String"
  value = aws_apigatewayv2_stage.ai.invoke_url
}

resource "aws_ssm_parameter" "frontend_api_base_url" {
  name  = "${local.ssm_prefix}/frontend/VITE_API_BASE_URL"
  type  = "String"
  value = local.effective_public_api_base_url
}

resource "aws_ssm_parameter" "frontend_google_client_id" {
  count = local.has_google_client_id ? 1 : 0

  name  = "${local.ssm_prefix}/frontend/VITE_GOOGLE_CLIENT_ID"
  type  = "SecureString"
  value = var.google_client_id
}

resource "aws_ssm_parameter" "backend_kakao_client_id" {
  name  = "${local.ssm_prefix}/backend/KAKAO_CLIENT_ID"
  type  = "SecureString"
  value = var.kakao_client_id
}

resource "aws_ssm_parameter" "backend_kakao_client_secret" {
  name  = "${local.ssm_prefix}/backend/KAKAO_CLIENT_SECRET"
  type  = "SecureString"
  value = var.kakao_client_secret
}

resource "aws_ssm_parameter" "backend_oauth_allowed_frontend_origins" {
  count = trimspace(var.oauth_allowed_frontend_origins) != "" ? 1 : 0

  name  = "${local.ssm_prefix}/backend/OAUTH_ALLOWED_FRONTEND_ORIGINS"
  type  = "String"
  value = var.oauth_allowed_frontend_origins
}

resource "aws_ssm_parameter" "backend_oauth_public_api_base_url" {
  count = trimspace(var.public_api_base_url) != "" ? 1 : 0

  name  = "${local.ssm_prefix}/backend/OAUTH_PUBLIC_API_BASE_URL"
  type  = "String"
  value = local.effective_public_api_base_url
}

resource "aws_ssm_parameter" "backend_oauth_google_allowed_client_ids" {
  count = length(local.google_allowed_client_ids) > 0 ? 1 : 0

  name  = "${local.ssm_prefix}/backend/OAUTH_GOOGLE_ALLOWED_CLIENT_IDS"
  type  = "String"
  value = join(",", local.google_allowed_client_ids)
}

resource "aws_ssm_parameter" "mobile_api_base_url" {
  name  = "${local.ssm_prefix}/mobile/EXPO_PUBLIC_API_BASE_URL"
  type  = "String"
  value = local.effective_public_api_base_url
}

resource "aws_ssm_parameter" "mobile_google_web_client_id" {
  count = local.has_google_client_id ? 1 : 0

  name  = "${local.ssm_prefix}/mobile/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
  type  = "SecureString"
  value = var.google_client_id
}

resource "aws_ssm_parameter" "mobile_google_ios_client_id" {
  count = local.has_google_ios_client_id ? 1 : 0

  name  = "${local.ssm_prefix}/mobile/EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"
  type  = "SecureString"
  value = var.google_ios_client_id
}

resource "aws_ssm_parameter" "mobile_google_android_client_id" {
  count = local.has_google_android_client_id ? 1 : 0

  name  = "${local.ssm_prefix}/mobile/EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
  type  = "SecureString"
  value = var.google_android_client_id
}
