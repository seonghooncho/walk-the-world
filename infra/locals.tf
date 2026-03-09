locals {
  lambda_package_path = coalesce(
    var.lambda_package_path,
    "${path.module}/../backend/build/distributions/walkworld-api.zip"
  )
}
