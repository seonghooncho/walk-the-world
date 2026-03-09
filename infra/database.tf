# ============================================================
# RDS MySQL (minimum cost: db.t4g.micro, single-AZ)
# ============================================================

resource "aws_db_instance" "mysql" {
  identifier     = "${var.project_name}-mysql"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t4g.micro" # Free-tier eligible

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "walkworld"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = false
  publicly_accessible = false
  skip_final_snapshot = true

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  tags = { Name = "${var.project_name}-mysql" }
}

# ============================================================
# DynamoDB (session/cache - minimal cost with on-demand)
# ============================================================

resource "aws_dynamodb_table" "sessions" {
  name         = "${var.project_name}-sessions"
  billing_mode = "PAY_PER_REQUEST" # No minimum cost when idle
  hash_key     = "sessionId"

  attribute {
    name = "sessionId"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = { Name = "${var.project_name}-sessions" }
}

resource "aws_dynamodb_table" "step_events" {
  name         = "${var.project_name}-step-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "timestamp"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = { Name = "${var.project_name}-step-events" }
}
