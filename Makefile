SHELL := /bin/bash

NPM ?= npm
GRADLE ?= gradle
TERRAFORM ?= terraform
ENV ?= prod

.PHONY: help fe-install fe-dev fe-build fe-lint fe-test fe-check \
	mobile-install mobile-env-ssm mobile-dev mobile-lint mobile-typecheck mobile-check \
	fe-build-ssm fe-deploy-prod \
	be-build be-test be-zip be-generate-reference-seed \
	infra-fmt infra-init-validate infra-validate-prod

help:
	@printf '%s\n' \
		'fe-install         Install frontend dependencies' \
		'fe-dev             Run frontend dev server' \
		'fe-build           Build frontend' \
		'fe-build-ssm       Build frontend with Vite vars loaded from SSM (ENV=prod)' \
		'fe-deploy-prod     Build frontend, sync to S3, and invalidate CloudFront' \
		'fe-lint            Lint frontend' \
		'fe-test            Run frontend tests' \
		'fe-check           Run frontend lint, test, and build' \
		'mobile-install     Install mobile app dependencies' \
		'mobile-env-ssm     Write mobile/.env.local from SSM (ENV=prod)' \
		'mobile-dev         Run Expo mobile dev server' \
		'mobile-lint        Lint mobile app' \
		'mobile-typecheck   Type-check mobile app' \
		'mobile-check       Run mobile lint and type-check' \
		'be-build           Build backend' \
		'be-test            Run backend tests' \
		'be-zip             Build backend Lambda zip' \
		'be-generate-reference-seed Generate Flyway seed SQL from frontend world data' \
		'infra-fmt          Format Terraform files' \
		'infra-init-validate Validate Terraform bootstrap module' \
		'infra-validate-prod Validate Terraform for prod env'

fe-install:
	cd fe && $(NPM) install

fe-dev:
	cd fe && $(NPM) run dev

fe-build:
	cd fe && $(NPM) run build

fe-build-ssm:
	bin/fe-build-from-ssm.sh $(ENV)

fe-deploy-prod:
	bin/fe-deploy-to-aws.sh prod

fe-lint:
	cd fe && $(NPM) run lint

fe-test:
	cd fe && $(NPM) run test

fe-check: fe-lint fe-test fe-build

mobile-install:
	cd mobile && $(NPM) install

mobile-env-ssm:
	bin/mobile-env-from-ssm.sh $(ENV)

mobile-dev:
	cd mobile && $(NPM) run start

mobile-lint:
	cd mobile && $(NPM) run lint

mobile-typecheck:
	cd mobile && $(NPM) run typecheck

mobile-check: mobile-lint mobile-typecheck

be-build:
	cd backend && $(GRADLE) build

be-test:
	cd backend && $(GRADLE) test

be-zip:
	cd backend && $(GRADLE) buildZip

be-generate-reference-seed:
	node bin/generate-reference-seed.mjs

infra-fmt:
	$(TERRAFORM) -chdir=infra/terraform/init fmt -recursive
	$(TERRAFORM) -chdir=infra/terraform/minimum fmt -recursive

infra-init-validate:
	$(TERRAFORM) -chdir=infra/terraform/init init -backend=false
	$(TERRAFORM) -chdir=infra/terraform/init validate

infra-validate-prod:
	$(TERRAFORM) -chdir=infra/terraform/minimum/env/prod init -backend=false
	$(TERRAFORM) -chdir=infra/terraform/minimum/env/prod validate
