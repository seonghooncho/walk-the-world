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
  description = "Frontend hosting platform"
  type        = string
  default     = "aws_s3_cloudfront"
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

variable "neon_pg_version" {
  description = "Postgres major version for Neon"
  type        = number
  default     = 16
}

variable "jwt_secret" {
  description = "Optional JWT signing secret override"
  type        = string
  sensitive   = true
  default     = null
}

variable "google_client_id" {
  description = "Optional Google OAuth client id"
  type        = string
  sensitive   = true
  default     = ""
}

variable "kakao_client_id" {
  description = "Optional Kakao OAuth client id"
  type        = string
  sensitive   = true
  default     = ""
}

variable "kakao_client_secret" {
  description = "Optional Kakao OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "lambda_memory" {
  description = "Lambda memory in MB"
  type        = number
  default     = 1536
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
