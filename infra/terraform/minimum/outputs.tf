output "api_gateway_url" {
  description = "Backend API Gateway invoke URL"
  value       = aws_apigatewayv2_stage.backend.invoke_url
}

output "ai_api_gateway_url" {
  description = "AI API Gateway invoke URL"
  value       = aws_apigatewayv2_stage.ai.invoke_url
}

output "neon_project_id" {
  description = "Neon project id"
  value       = neon_project.app.id
}

output "neon_connection_uri_pooler" {
  description = "Neon pooled connection uri"
  value       = neon_project.app.connection_uri_pooler
  sensitive   = true
}

output "s3_bucket" {
  description = "S3 bucket for uploads"
  value       = aws_s3_bucket.uploads.id
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend hosting"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution id for frontend deployment invalidation"
  value       = aws_cloudfront_distribution.frontend.id
}

output "ssm_parameter_names" {
  description = "SSM parameter names used by frontend and backend"
  value = {
    backend_db_url          = aws_ssm_parameter.backend_db_url.name
    backend_db_username     = aws_ssm_parameter.backend_db_username.name
    backend_db_password     = aws_ssm_parameter.backend_db_password.name
    backend_jwt_secret      = aws_ssm_parameter.backend_jwt_secret.name
    backend_s3_bucket       = aws_ssm_parameter.backend_s3_bucket.name
    backend_ai_api_base_url = aws_ssm_parameter.backend_ai_api_base_url.name
    frontend_api_base_url   = aws_ssm_parameter.frontend_api_base_url.name
    frontend_google_client  = local.has_google_client_id ? aws_ssm_parameter.frontend_google_client_id[0].name : null
  }
}
