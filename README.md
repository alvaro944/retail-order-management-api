# Retail Order Management API

Backend API for managing products, customers, inventory, and orders in a retail environment. The project is designed as a clean modular monolith with a phased roadmap, making it suitable both for learning and as a strong backend portfolio piece.

## Current Status

Phase 0 is implemented:

- Spring Boot 3 + Java 21 + Maven bootstrap
- Modular package structure by domain
- PostgreSQL configuration for local development
- `dev` and `test` profiles
- UTC and ISO-8601 date/time defaults
- Technical health endpoint at `/api/v1/health`
- Initial test setup for build validation

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Maven
- Lombok
- H2 for test profile

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

## Getting Started

### Prerequisites

- JDK 21
- Maven 3.9+
- PostgreSQL 15+ for the `dev` profile

### Environment Variables

The `dev` profile uses PostgreSQL and reads its connection details from environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retail_order_management
DB_USERNAME=postgres
DB_PASSWORD=postgres
SERVER_PORT=8080
```

### Run the Application

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Base URL:

```text
http://localhost:8080/api/v1
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
6. Phase 5: global exception handling
7. Phase 6: OpenAPI and Swagger

### Portfolio Version

8. Spring Security + JWT
9. Unit and integration testing
10. Docker
11. GitHub Actions CI

### Advanced Evolution

12. Domain events
13. Stronger hexagonal boundaries
14. Microservice extraction if justified

## Suggested Commit Plan

1. `chore: initialize Spring Boot project structure`
2. `chore: configure application profiles and PostgreSQL settings`
3. `docs: add initial README with roadmap and setup instructions`
4. `chore: add base module package structure`

## Working Rules

- Work in small increments, one feature or subtask at a time.
- Create a dedicated branch for each task or phase before making changes.
- Keep commits focused and small enough to explain clearly.
- Run automated validation before closing a task, at minimum `mvn clean verify`.
- Perform manual testing when the change affects application behavior or HTTP flows.
- Do not merge a branch until both automated checks and manual verification are done.
- Prefer documenting important decisions in Markdown as the project evolves.

## Immediate Next Step

Phase 1 should implement the `product` module with:

- product entity
- DTOs
- repository
- service layer
- REST controller
- validation
- resource-not-found handling
