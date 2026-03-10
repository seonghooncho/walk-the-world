# ============================================================
# Lambda functions
# ============================================================

data "archive_file" "ai" {
  type        = "zip"
  source_dir  = local.ai_lambda_source_path
  output_path = "/tmp/${local.resource_prefix}-ai.zip"
}

resource "aws_iam_role" "backend_lambda" {
  name = "${local.resource_prefix}-backend-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_lambda_basic" {
  role       = aws_iam_role.backend_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "backend_lambda_s3" {
  name = "${local.resource_prefix}-backend-lambda-s3"
  role = aws_iam_role.backend_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
      Resource = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

resource "aws_s3_object" "backend_lambda_zip" {
  bucket = aws_s3_bucket.uploads.id
  key    = "artifacts/backend/walkworld-api.zip"
  source = local.lambda_package_path
  etag   = filemd5(local.lambda_package_path)
}

resource "aws_lambda_function" "backend" {
  function_name = "${local.resource_prefix}-backend"
  role          = aws_iam_role.backend_lambda.arn
  handler       = "com.walkworld.api.LambdaHandler::handleRequest"
  runtime       = "java21"
  memory_size   = var.lambda_memory
  timeout       = var.lambda_timeout

  s3_bucket        = aws_s3_object.backend_lambda_zip.bucket
  s3_key           = aws_s3_object.backend_lambda_zip.key
  source_code_hash = filebase64sha256(local.lambda_package_path)

  environment {
    variables = {
      SPRING_PROFILES_ACTIVE = var.environment
      DB_URL                 = aws_ssm_parameter.backend_db_url.value
      DB_USERNAME            = aws_ssm_parameter.backend_db_username.value
      DB_PASSWORD            = aws_ssm_parameter.backend_db_password.value
      JWT_SECRET             = aws_ssm_parameter.backend_jwt_secret.value
      S3_BUCKET              = aws_ssm_parameter.backend_s3_bucket.value
      AI_API_BASE_URL        = aws_ssm_parameter.backend_ai_api_base_url.value
      KAKAO_CLIENT_ID        = aws_ssm_parameter.backend_kakao_client_id.value
      KAKAO_CLIENT_SECRET    = aws_ssm_parameter.backend_kakao_client_secret.value
    }
  }

  tags = { Name = "${local.resource_prefix}-backend" }
}

resource "aws_iam_role" "ai_lambda" {
  name = "${local.resource_prefix}-ai-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ai_lambda_basic" {
  role       = aws_iam_role.ai_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "ai_lambda_s3" {
  name = "${local.resource_prefix}-ai-lambda-s3"
  role = aws_iam_role.ai_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

resource "aws_lambda_function" "ai" {
  function_name = "${local.resource_prefix}-ai"
  role          = aws_iam_role.ai_lambda.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.12"
  memory_size   = var.ai_lambda_memory
  timeout       = var.ai_lambda_timeout

  filename         = data.archive_file.ai.output_path
  source_code_hash = data.archive_file.ai.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT = var.environment
      S3_BUCKET   = aws_s3_bucket.uploads.id
    }
  }

  tags = { Name = "${local.resource_prefix}-ai" }
}
