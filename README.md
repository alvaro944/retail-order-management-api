# Retail Order Management API

Backend API for managing products, customers, inventory, and orders in a retail environment. The project is designed as a clean modular monolith with a phased roadmap, making it suitable both for learning and as a strong backend portfolio piece.

## Current Status

Phase 10 is implemented:

- Spring Boot 3 + Java 21 + Maven bootstrap
- Modular package structure by domain
- PostgreSQL configuration for local development
- `dev` and `test` profiles
- UTC and ISO-8601 date/time defaults
- Technical health endpoint at `/api/v1/health`
- Product catalog module with create, read, update, and logical delete
- Customer management module with create, read, update, and logical delete
- Inventory module with one current-stock record per active product
- Manual stock adjustments with increase and decrease operations
- Minimum stock management and product deletion protection when inventory exists
- Order module with transactional order creation, cancellation, and query endpoints
- Historical order-item snapshots with product name, SKU, and unit price
- Stock validation and inventory discount during order creation
- Order lifecycle handling with inventory restoration during cancellation
- OpenAPI JSON documentation for the current REST surface
- Swagger UI for interactive API exploration
- Spring Security base with stateless JWT authentication
- Bootstrap user authentication endpoint at `/api/v1/auth/login`
- Authenticated JWT self-check endpoint at `/api/v1/auth/me`
- JWT protection for the `product`, `customer`, `inventory`, and `order` modules
- Docker packaging and local container workflow with Docker Compose
- GitHub Actions CI workflow for automated Maven verification on `push` and `pull_request`
- Focused testing hardening for critical integration scenarios and auth/JWT service unit coverage
- Validation, `404` handling, and `409` handling for duplicate SKU
- Integration tests for the `auth`, `product`, `customer`, `inventory`, and `order` modules
- Focused unit tests for the auth and JWT services

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Maven
- Lombok
- Springdoc OpenAPI + Swagger UI
- H2 for test profile
- Docker and Docker Compose for local container workflow
- GitHub Actions for continuous integration

## Project Structure

```text
src/main/java/com/alvaro/retail
├── common
│   ├── config
│   ├── controller
│   ├── exception
│   └── util
├── customer
├── inventory
├── order
├── product
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   └── service
└── RetailOrderManagementApiApplication.java
```

## Module Rules Snapshot

### Product

- Active products are visible through reads; deleted products are soft-deleted.
- SKU must remain unique.
- Products with inventory cannot be logically deleted.

### Customer

- Active customers are visible through reads; deleted customers are soft-deleted.
- Email must remain unique.

### Inventory

- There is exactly one inventory record per product.
- Inventory can only exist for active products.
- Manual decreases cannot reduce stock below zero.

### Order

- Orders support creation, cancellation, and query in the current phase.
- Orders start in `CREATED` and can transition once to `CANCELLED`.
- `OrderItem` stores snapshot product data so historical orders are not affected by later product edits.
- Order creation requires an active customer, active products, existing inventory, and enough stock.
- Repeated products in separate lines are rejected with `400`.
- Missing inventory or insufficient stock returns `409`.
- Inventory is reduced transactionally during order creation.
- Cancelling an order restores inventory transactionally for every order item.
- Cancelling an already cancelled order returns `409`.
- Orders are listed from newest to oldest.

## API Surface

Current module endpoints:

- `GET /health`
- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `PUT /customers/{id}`
- `DELETE /customers/{id}`
- `POST /inventories`
- `GET /inventories`
- `GET /inventories/{id}`
- `GET /products/{productId}/inventory`
- `PUT /inventories/{id}`
- `PATCH /inventories/{id}/adjust`
- `POST /orders`
- `POST /orders/{id}/cancel`
- `GET /orders`
- `GET /orders/{id}`
- `POST /auth/login`
- `GET /auth/me`
- `GET /v3/api-docs`
- `GET /swagger-ui/index.html`

Phase 7B access rules:

- Public: `GET /health`
- Public: `POST /auth/login`
- Public: Swagger UI and OpenAPI JSON
- Authenticated: `GET /auth/me`
- Authenticated: all `/products/**`, `/customers/**`, `/inventories/**`, and `/orders/**` routes

## Agent And Maintainer Guide

For future coding chats, see `AGENTS.md`. It documents:

- architecture and domain conventions
- established business rules per module
- current error semantics
- verification and manual testing expectations
- recommended Codex skill flow for this repository

## Getting Started

### Prerequisites

- JDK 21
- Maven 3.9+
- PostgreSQL 15+ for the `dev` profile
- Docker Desktop or Docker Engine with Docker Compose for the containerized workflow

### Environment Variables

The `dev` profile uses PostgreSQL and reads its connection details from environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_order_management
DB_USERNAME=postgres
DB_PASSWORD=postgres
SERVER_PORT=8080
APP_SECURITY_JWT_SECRET=changeit-changeit-changeit-changeit
APP_SECURITY_JWT_ISSUER=retail-order-management-api
APP_SECURITY_JWT_EXPIRATION_MINUTES=60
APP_SECURITY_BOOTSTRAP_USERNAME=admin
APP_SECURITY_BOOTSTRAP_PASSWORD=admin123
APP_SECURITY_BOOTSTRAP_ROLE=ADMIN
```

The bootstrap user is intended for local development and manual verification in Phase 7B. Override those defaults through environment variables outside local development.

### Run the Application

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

For manual API checks without PostgreSQL, run the application with the `test` profile and include the test classpath so the in-memory H2 driver is available:

```bash
mvn "-Dspring-boot.run.profiles=test" "-Dspring-boot.run.useTestClasspath=true" spring-boot:run
```

If you run the packaged jar, use the `dev` profile. The `test` profile is intended for automated tests and local manual checks through Maven.

### Run with Docker Compose

The repository now includes a multi-stage `Dockerfile` and a local `docker-compose.yml` stack for Phase 8.

Build and start the stack:

```bash
docker compose up --build
```

Start it in detached mode:

```bash
docker compose up --build -d
```

Stop the stack:

```bash
docker compose down
```

The PostgreSQL data is stored in the named volume `postgres-data` so local data survives container restarts.

The Docker stack uses the same `dev` profile and the same environment variables already supported by the application:

```bash
DB_HOST=db
DB_PORT=5432
DB_NAME=retail_order_management
DB_USERNAME=postgres
DB_PASSWORD=postgres
SERVER_PORT=8080
APP_SECURITY_JWT_SECRET=changeit-changeit-changeit-changeit
APP_SECURITY_JWT_ISSUER=retail-order-management-api
APP_SECURITY_JWT_EXPIRATION_MINUTES=60
APP_SECURITY_BOOTSTRAP_USERNAME=admin
APP_SECURITY_BOOTSTRAP_PASSWORD=admin123
APP_SECURITY_BOOTSTRAP_ROLE=ADMIN
```

Inside Docker Compose, `DB_HOST` is fixed to the `db` service. The remaining values can be overridden from your shell or a local `.env` file before running `docker compose up`.

On Windows PowerShell, `curl` is usually an alias for `Invoke-WebRequest`, not the Unix `curl` CLI. That means flags such as `-X`, `-H`, and `-d` will not behave the same way unless you call `curl.exe` explicitly. For PowerShell-first smoke tests, prefer `Invoke-WebRequest` with `-Method`, `-ContentType`, and `-Body`.

Base URL:

```text
http://localhost:8080/api/v1
```

OpenAPI JSON:

```text
http://localhost:8080/api/v1/v3/api-docs
```

Swagger UI:

```text
http://localhost:8080/api/v1/swagger-ui/index.html
```

Technical health endpoint:

```text
GET /api/v1/health
```

### Run the Tests

```bash
mvn clean verify
```

The test profile uses an isolated in-memory H2 database so the build can be validated without a local PostgreSQL instance.

Useful focused test commands:

```bash
mvn test -Dtest=AuthControllerIntegrationTest
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=ProductControllerIntegrationTest
mvn test -Dtest=CustomerControllerIntegrationTest
mvn test -Dtest=InventoryControllerIntegrationTest
mvn test -Dtest=JwtServiceTest
mvn test -Dtest=OrderControllerIntegrationTest
```

### Continuous Integration

The repository now includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

The workflow triggers on every `push` and `pull_request` and runs the same backend verification command used locally:

```bash
mvn -B clean verify
```

The CI job uses `actions/setup-java` with Temurin Java 21 and Maven dependency caching. It does not run Docker, Docker Compose, or deployment steps in this phase. The container workflow remains a local verification path for Phase 8.

### Manual API Smoke Test

The following examples can be used after the app is running. For Phase 7B manual validation, open Swagger UI, open the OpenAPI JSON, obtain a JWT, confirm the business modules require authentication, and verify the same routes work when a bearer token is provided.

For Phase 8, the same flow should also work unchanged against the Dockerized stack.

Authentication flow in PowerShell:

```powershell
$loginResponse = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $loginResponse.accessToken

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer $token" }
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/products" `
  -Headers @{ Authorization = "Bearer $token" }

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/products" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"Mouse","description":"Compact mouse","price":29.99,"sku":"MOU-100"}'
```

Expected negative auth checks:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/me"

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/products"

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"wrong-password"}'

Invoke-WebRequest `
  -Uri "http://localhost:8080/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer invalid-token" }
```

In PowerShell, the four negative checks above are expected to raise an exception because the API returns `401`. That is still a successful validation of the security behavior.

Swagger/OpenAPI checks:

```text
Open Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html
Open OpenAPI JSON: http://localhost:8080/api/v1/v3/api-docs
```

Use the `Authorize` button in Swagger UI with `Bearer <token>`, then confirm protected operations under `product`, `customer`, `inventory`, and `order` execute successfully.

### Docker Compose Authenticated Smoke Test

Once `docker compose up --build` is running, the same URLs are available from the host:

```text
http://localhost:8080/api/v1/health
http://localhost:8080/api/v1/auth/login
http://localhost:8080/api/v1/auth/me
http://localhost:8080/api/v1/swagger-ui/index.html
http://localhost:8080/api/v1/v3/api-docs
```

PowerShell example against the Dockerized stack:

```powershell
$loginResponse = Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $loginResponse.accessToken

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health"

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/auth/me" `
  -Headers @{ Authorization = "Bearer $token" }

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/v1/products" `
  -Headers @{ Authorization = "Bearer $token" }

Invoke-WebRequest -Uri "http://localhost:8080/api/v1/products"
```

In the last command above, `Invoke-WebRequest` is expected to raise an exception because the API returns `401` without a bearer token.

## Error Semantics

The API currently follows these rules:

- `400` for request validation failures and invalid business-rule input
- `404` for missing or inactive resources
- `401` for invalid credentials, missing bearer token, or invalid/expired JWT
- `403` for authenticated requests that are not authorized
- `409` for duplicate resources and stock-related business conflicts

Error payloads are returned as RFC 9457 `ProblemDetail` responses with a `path` property.

## Configuration Notes

- Development profile uses `ddl-auto=update` to keep local iteration simple.
- This is a temporary Phase 0 choice and will be replaced by Flyway-based migrations in a later phase.
- Backend timestamps are standardized to UTC.
- JSON date serialization is configured to use ISO-8601 rather than numeric timestamps.
- Future entities should use `Long` identifiers and audit fields such as `createdAt` and `updatedAt`.
- Future table naming should follow `snake_case` with plural table names.

## Roadmap

### MVP

1. Phase 0: project bootstrap
2. Phase 1: product catalog
3. Phase 2: customers
4. Phase 3: inventory
5. Phase 4: orders
6. Phase 5: order lifecycle cancellation
7. Phase 6: OpenAPI and Swagger
- Phase 7A: Spring Security + JWT base
- Phase 7B: Spring Security + JWT protection

### Portfolio Version

8. Phase 8: Docker packaging and local container workflow
9. Phase 9: GitHub Actions CI
10. Phase 10: Unit and integration testing hardening

### Advanced Evolution

11. Domain events
12. Stronger hexagonal boundaries
13. Microservice extraction if justified

## Suggested Commit Plan

1. `chore: initialize Spring Boot project structure`
2. `chore: configure application profiles and PostgreSQL settings`
3. `docs: add initial README with roadmap and setup instructions`
4. `chore: add base module package structure`

## Working Rules

- Work in small increments, one feature or subtask at a time.
- Create a dedicated branch for each task or phase before making changes.
- Prefer a dedicated worktree for feature work when the main workspace has unrelated local changes.
- Keep commits focused and small enough to explain clearly.
- Run automated validation before closing a task, at minimum `mvn clean verify`.
- Perform manual testing when the change affects application behavior or HTTP flows.
- Do not merge a branch until both automated checks and manual verification are done.
- Prefer documenting important decisions in Markdown as the project evolves.
- Push the feature branch first and keep it even after updating `main` unless there is an explicit request to delete it.

## Immediate Next Step

The next planned step after Phase 10 is the Advanced Evolution track, starting with domain events if still justified.
