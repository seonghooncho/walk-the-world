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
  value = var.jwt_secret
}

resource "aws_ssm_parameter" "backend_s3_bucket" {
  name  = "${local.ssm_prefix}/backend/S3_BUCKET"
  type  = "String"
  value = aws_s3_bucket.uploads.id
}

resource "aws_ssm_parameter" "backend_aws_region" {
  name  = "${local.ssm_prefix}/backend/AWS_REGION"
  type  = "String"
  value = var.aws_region
}

resource "aws_ssm_parameter" "backend_ai_api_base_url" {
  name  = "${local.ssm_prefix}/backend/AI_API_BASE_URL"
  type  = "String"
  value = aws_apigatewayv2_stage.ai.invoke_url
}

resource "aws_ssm_parameter" "frontend_api_base_url" {
  name  = "${local.ssm_prefix}/frontend/VITE_API_BASE_URL"
  type  = "String"
  value = aws_apigatewayv2_stage.backend.invoke_url
}

resource "aws_ssm_parameter" "frontend_google_client_id" {
  name  = "${local.ssm_prefix}/frontend/VITE_GOOGLE_CLIENT_ID"
  type  = "SecureString"
  value = var.google_client_id
}
