.PHONY: help setup start stop clean test demo benchmark

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install Python dependencies
	pip install -r requirements.txt
	@echo "✅ Dependencies installed"

start: ## Start infrastructure (Postgres, DuckDB, Graph Engine)
	docker-compose up -d
	@echo "⏳ Waiting for services to be healthy..."
	@sleep 5
	docker-compose ps
	@echo "✅ Infrastructure running"

stop: ## Stop all services
	docker-compose down
	@echo "✅ Services stopped"

clean: ## Stop services and remove volumes (deletes all data)
	docker-compose down -v
	@echo "✅ All data cleared"

init-db: ## Initialize database schema
	docker-compose exec postgres psql -U snyk -d snyk_demo -f /docker-entrypoint-initdb.d/01-schema.sql
	@echo "✅ Database schema initialized"

generate-data: ## Generate mock Snyk data
	python scripts/generate_mock_data.py "postgresql://snyk:demo_password_change_me@localhost:5432/snyk_demo"
	@echo "✅ Mock data generated"

demo-log4shell: ## Run Log4Shell blast radius demo
	python use-cases/supply-chain-attack/demo_log4shell.py

demo-license: ## Run license risk propagation demo
	python use-cases/license-risk/demo_license_risk.py

demo-secrets: ## Run secret exposure demo
	python use-cases/secrets-exposure/demo_secret_exposure.py

demo-all: ## Run all demos sequentially
	@echo "Running all demos..."
	@make demo-log4shell
	@echo ""
	@make demo-license
	@echo ""
	@make demo-secrets
	@echo "✅ All demos complete"

test: ## Run test suite
	pytest tests/ -v

benchmark: ## Run performance benchmarks
	python benchmarks/run_benchmarks.py

logs: ## Show logs from all services
	docker-compose logs -f

ps: ## Show running containers
	docker-compose ps

shell-postgres: ## Open Postgres shell
	docker-compose exec postgres psql -U snyk -d snyk_demo

full-demo: setup start ## Complete demo: setup + start + generate data + run demos
	@echo "⏳ Waiting for database to be ready..."
	@sleep 10
	@make init-db
	@make generate-data
	@make demo-all
	@echo ""
	@echo "✅ Full demo complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  - Explore Grafana dashboards: http://localhost:3000 (admin/admin)"
	@echo "  - Run individual demos: make demo-log4shell"
	@echo "  - Open Postgres shell: make shell-postgres"
	@echo "  - Stop services: make stop"
