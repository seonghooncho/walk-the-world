variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "frontend_platform" {
  description = "Frontend hosting platform. Currently only aws_s3_cloudfront is supported."
  type        = string
  default     = "aws_s3_cloudfront"

  validation {
    condition     = var.frontend_platform == "aws_s3_cloudfront"
    error_message = "frontend_platform must be aws_s3_cloudfront."
  }
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "walkworld"
}

variable "db_name" {
  description = "Application database name"
  type        = string
  default     = "walkworld"
}

variable "db_username" {
  description = "Application database role name"
  type        = string
  default     = "walkworld_app"
}

variable "neon_region_id" {
  description = "Neon region id"
  type        = string
  default     = "aws-ap-southeast-1"
}

variable "neon_org_id" {
  description = "Neon organization id"
  type        = string
}

variable "neon_pg_version" {
  description = "Postgres major version for Neon"
  type        = number
  default     = 16
}

variable "jwt_secret" {
  description = "Optional JWT signing secret override. If omitted, Terraform generates one."
  type        = string
  sensitive   = true
  default     = null
}

variable "google_client_id" {
  description = "Optional Google OAuth client id for frontend"
  type        = string
  sensitive   = true
  default     = ""
}

variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "ai_lambda_memory" {
  description = "AI Lambda memory in MB"
  type        = number
  default     = 256
}

variable "ai_lambda_timeout" {
  description = "AI Lambda timeout in seconds"
  type        = number
  default     = 15
}

variable "lambda_package_path" {
  description = "Path to the backend Lambda zip artifact"
  type        = string
  default     = null
}

variable "ai_lambda_source_path" {
  description = "Path to the AI Lambda source directory"
  type        = string
  default     = null
}
