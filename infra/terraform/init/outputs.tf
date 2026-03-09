output "state_bucket_name" {
  description = "Terraform state bucket"
  value       = aws_s3_bucket.terraform_state.id
}

output "lock_table_name" {
  description = "Terraform state lock table"
  value       = aws_dynamodb_table.terraform_locks.name
}
