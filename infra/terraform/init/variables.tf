variable "aws_region" {
  description = "AWS region for Terraform state resources"
  type        = string
  default     = "ap-northeast-2"
}

variable "state_bucket_name" {
  description = "S3 bucket name for Terraform state"
  type        = string
  default     = "walkworld-terraform-state"
}

variable "lock_table_name" {
  description = "DynamoDB table name for Terraform state locking"
  type        = string
  default     = "walkworld-terraform-locks"
}
