output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = module.platform.api_gateway_url
}

output "ai_api_gateway_url" {
  description = "AI API Gateway invoke URL"
  value       = module.platform.ai_api_gateway_url
}

output "neon_project_id" {
  description = "Neon project id"
  value       = module.platform.neon_project_id
}

output "s3_bucket" {
  description = "S3 bucket for uploads"
  value       = module.platform.s3_bucket
}

output "frontend_bucket_name" {
  description = "S3 bucket for frontend hosting"
  value       = module.platform.frontend_bucket_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for frontend"
  value       = module.platform.cloudfront_domain
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution id for frontend"
  value       = module.platform.cloudfront_distribution_id
}

output "ssm_parameter_names" {
  description = "SSM parameter names"
  value       = module.platform.ssm_parameter_names
}
