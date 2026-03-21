resource "aws_acm_certificate" "frontend" {
  count    = local.custom_domain_enabled ? 1 : 0
  provider = aws.us_east_1

  domain_name               = local.frontend_aliases[0]
  subject_alternative_names = slice(local.frontend_aliases, 1, length(local.frontend_aliases))
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_dns_record" "frontend_validation" {
  for_each = local.custom_domain_enabled ? {
    for option in aws_acm_certificate.frontend[0].domain_validation_options :
    option.domain_name => {
      name  = option.resource_record_name
      type  = option.resource_record_type
      value = option.resource_record_value
    }
  } : {}

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.value
  ttl     = 1
  proxied = false
}

resource "aws_acm_certificate_validation" "frontend" {
  count    = local.custom_domain_enabled ? 1 : 0
  provider = aws.us_east_1

  certificate_arn = aws_acm_certificate.frontend[0].arn
  validation_record_fqdns = [
    for record in cloudflare_dns_record.frontend_validation : record.name
  ]
}

resource "cloudflare_dns_record" "frontend_alias" {
  for_each = local.custom_domain_enabled ? {
    for domain in local.frontend_aliases : domain => domain
  } : {}

  zone_id = var.cloudflare_zone_id
  name    = each.value
  type    = "CNAME"
  content = aws_cloudfront_distribution.frontend.domain_name
  ttl     = 1
  proxied = true
}
