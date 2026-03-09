terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.9"
    }
  }

  backend "s3" {
    bucket         = "walkworld-terraform-state"
    key            = "minimum/prod/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "walkworld-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "neon" {
  api_key = var.neon_api_key
}

module "platform" {
  source = "../.."

  aws_region            = var.aws_region
  environment           = var.environment
  project_name          = var.project_name
  db_name               = var.db_name
  db_username           = var.db_username
  neon_region_id        = var.neon_region_id
  neon_pg_version       = var.neon_pg_version
  jwt_secret            = var.jwt_secret
  google_client_id      = var.google_client_id
  lambda_memory         = var.lambda_memory
  lambda_timeout        = var.lambda_timeout
  ai_lambda_memory      = var.ai_lambda_memory
  ai_lambda_timeout     = var.ai_lambda_timeout
  lambda_package_path   = abspath("${path.root}/../../../../backend/build/distributions/walkworld-api.zip")
  ai_lambda_source_path = abspath("${path.root}/../../../../ai/src")
}
