# ============================================================
# Lambda function (Spring Boot via aws-serverless-java-container)
# ============================================================

resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.project_name}-lambda-s3"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
      Resource = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:Query"]
      Resource = [
        aws_dynamodb_table.sessions.arn,
        aws_dynamodb_table.step_events.arn,
      ]
    }]
  })
}

resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "com.walkworld.api.LambdaHandler::handleRequest"
  runtime       = "java21"
  memory_size   = var.lambda_memory
  timeout       = var.lambda_timeout

  filename         = "${path.module}/../backend/build/distributions/walkworld-api.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/build/distributions/walkworld-api.zip")

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      SPRING_PROFILES_ACTIVE = "prod"
      DB_URL                 = "jdbc:mysql://${aws_db_instance.mysql.endpoint}/walkworld?useSSL=true"
      DB_USERNAME            = var.db_username
      DB_PASSWORD            = var.db_password
      JWT_SECRET             = var.jwt_secret
      S3_BUCKET              = aws_s3_bucket.uploads.id
      AWS_REGION             = var.aws_region
    }
  }

  tags = { Name = "${var.project_name}-api" }
}

# Provisioned concurrency to reduce cold starts (optional, costs money)
# resource "aws_lambda_provisioned_concurrency_config" "api" {
#   function_name                  = aws_lambda_function.api.function_name
#   provisioned_concurrent_executions = 1
#   qualifier                      = aws_lambda_function.api.version
# }
