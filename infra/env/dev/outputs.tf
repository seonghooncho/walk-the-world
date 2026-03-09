output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = module.platform.api_gateway_url
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = module.platform.rds_endpoint
}

output "s3_bucket" {
  description = "S3 bucket for uploads"
  value       = module.platform.s3_bucket
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for frontend"
  value       = module.platform.cloudfront_domain
}
