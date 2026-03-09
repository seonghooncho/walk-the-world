terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "walkworld-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-northeast-2"
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

module "platform" {
  source = "../.."

  aws_region          = var.aws_region
  environment         = var.environment
  project_name        = var.project_name
  db_username         = var.db_username
  db_password         = var.db_password
  jwt_secret          = var.jwt_secret
  lambda_memory       = var.lambda_memory
  lambda_timeout      = var.lambda_timeout
  lambda_package_path = abspath("${path.root}/../../../backend/build/distributions/walkworld-api.zip")
}
