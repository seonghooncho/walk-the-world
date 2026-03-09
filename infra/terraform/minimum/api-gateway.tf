# ============================================================
# API Gateway v2
# ============================================================

resource "aws_apigatewayv2_api" "backend" {
  name          = "${local.resource_prefix}-backend"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "backend_lambda" {
  api_id                 = aws_apigatewayv2_api.backend.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.backend.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "backend_proxy" {
  api_id    = aws_apigatewayv2_api.backend.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.backend_lambda.id}"
}

resource "aws_apigatewayv2_stage" "backend" {
  api_id      = aws_apigatewayv2_api.backend.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.backend_api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      latency        = "$context.integrationLatency"
    })
  }
}

resource "aws_cloudwatch_log_group" "backend_api_gw" {
  name              = "/aws/apigateway/${local.resource_prefix}-backend"
  retention_in_days = 14
}

resource "aws_lambda_permission" "backend_api_gw" {
  statement_id  = "AllowBackendApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.backend.execution_arn}/*/*"
}

resource "aws_apigatewayv2_api" "ai" {
  name          = "${local.resource_prefix}-ai"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "ai_lambda" {
  api_id                 = aws_apigatewayv2_api.ai.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.ai.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "ai_proxy" {
  api_id    = aws_apigatewayv2_api.ai.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.ai_lambda.id}"
}

resource "aws_apigatewayv2_stage" "ai" {
  api_id      = aws_apigatewayv2_api.ai.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.ai_api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      latency        = "$context.integrationLatency"
    })
  }
}

resource "aws_cloudwatch_log_group" "ai_api_gw" {
  name              = "/aws/apigateway/${local.resource_prefix}-ai"
  retention_in_days = 14
}

resource "aws_lambda_permission" "ai_api_gw" {
  statement_id  = "AllowAiApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ai.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ai.execution_arn}/*/*"
}
