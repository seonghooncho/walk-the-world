SHELL := /bin/bash

NPM ?= npm
GRADLE ?= gradle
TERRAFORM ?= terraform

.PHONY: help fe-install fe-dev fe-build fe-lint fe-test fe-check \
	be-build be-test be-zip \
	infra-fmt infra-validate-dev infra-validate-prod

help:
	@printf '%s\n' \
		'fe-install         Install frontend dependencies' \
		'fe-dev             Run frontend dev server' \
		'fe-build           Build frontend' \
		'fe-lint            Lint frontend' \
		'fe-test            Run frontend tests' \
		'fe-check           Run frontend lint, test, and build' \
		'be-build           Build backend' \
		'be-test            Run backend tests' \
		'be-zip             Build backend Lambda zip' \
		'infra-fmt          Format Terraform files' \
		'infra-validate-dev Validate Terraform for dev env' \
		'infra-validate-prod Validate Terraform for prod env'

fe-install:
	cd fe && $(NPM) install

fe-dev:
	cd fe && $(NPM) run dev

fe-build:
	cd fe && $(NPM) run build

fe-lint:
	cd fe && $(NPM) run lint

fe-test:
	cd fe && $(NPM) run test

fe-check: fe-lint fe-test fe-build

be-build:
	cd backend && $(GRADLE) build

be-test:
	cd backend && $(GRADLE) test

be-zip:
	cd backend && $(GRADLE) buildZip

infra-fmt:
	$(TERRAFORM) -chdir=infra fmt -recursive

infra-validate-dev:
	$(TERRAFORM) -chdir=infra/env/dev init -backend=false
	$(TERRAFORM) -chdir=infra/env/dev validate

infra-validate-prod:
	$(TERRAFORM) -chdir=infra/env/prod init -backend=false
	$(TERRAFORM) -chdir=infra/env/prod validate
