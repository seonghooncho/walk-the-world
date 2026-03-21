locals {
  resource_prefix              = "${var.project_name}-${var.environment}"
  custom_domain_enabled        = trimspace(var.custom_domain) != ""
  frontend_aliases             = local.custom_domain_enabled ? distinct(concat([trimspace(var.custom_domain)], [for domain in var.additional_frontend_domains : trimspace(domain) if trimspace(domain) != ""])) : []
  frontend_origin              = local.custom_domain_enabled ? "https://${local.frontend_aliases[0]}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
  has_google_client_id         = trimspace(var.google_client_id) != ""
  has_google_ios_client_id     = trimspace(var.google_ios_client_id) != ""
  has_google_android_client_id = trimspace(var.google_android_client_id) != ""
  google_allowed_client_ids = compact([
    trimspace(var.google_client_id),
    trimspace(var.google_ios_client_id),
    trimspace(var.google_android_client_id)
  ])
  effective_jwt_secret = coalesce(
    var.jwt_secret,
    random_password.jwt_secret.result
  )
  lambda_package_path = coalesce(
    var.lambda_package_path,
    "${path.module}/../../../backend/build/distributions/walkworld-api.zip"
  )
  ai_lambda_source_path = coalesce(
    var.ai_lambda_source_path,
    "${path.module}/../../../ai/src"
  )
  ssm_prefix                    = "/${var.project_name}/${var.environment}"
  effective_public_api_base_url = trimspace(var.public_api_base_url) != "" ? trimspace(var.public_api_base_url) : local.frontend_origin
  database_jdbc_url = format(
    "jdbc:postgresql://%s/%s?sslmode=require",
    neon_project.app.database_host_pooler,
    neon_project.app.database_name
  )
}
