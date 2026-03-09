locals {
  resource_prefix = "${var.project_name}-${var.environment}"
  lambda_package_path = coalesce(
    var.lambda_package_path,
    "${path.module}/../../../backend/build/distributions/walkworld-api.zip"
  )
  ai_lambda_source_path = coalesce(
    var.ai_lambda_source_path,
    "${path.module}/../../../ai/src"
  )
  ssm_prefix = "/${var.project_name}/${var.environment}"
  database_jdbc_url = format(
    "jdbc:postgresql://%s/%s?sslmode=require",
    neon_project.app.database_host_pooler,
    neon_project.app.database_name
  )
}
