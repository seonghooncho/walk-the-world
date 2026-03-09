# ============================================================
# Neon Postgres
# ============================================================

resource "neon_project" "app" {
  name                      = "${var.project_name}-${var.environment}"
  history_retention_seconds = 21600
  org_id                    = var.neon_org_id
  region_id                 = var.neon_region_id
  pg_version                = var.neon_pg_version
  store_password            = "yes"

  branch {
    name          = "main"
    database_name = var.db_name
    role_name     = var.db_username
  }

  default_endpoint_settings {
    autoscaling_limit_min_cu = 0.5
    autoscaling_limit_max_cu = 1
  }
}
