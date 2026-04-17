# Future Improvements

Potential next steps for the project after the current portfolio-ready close-out.

The goal of this file is not to reopen scope now, but to preserve the most useful ideas in a clean backlog if the project is resumed later.

## Improvements Without Backend Changes

### Portfolio and Presentation

- Add a discreet link to Swagger UI or OpenAPI JSON from the login page or authenticated shell.
- Add a lightweight authenticated home or overview page with direct access to products, customers, inventory, and orders.
- Add a small project info block with stack context such as Spring Boot, PostgreSQL, and JWT.
- Add optional links to the repository and deployed demo from the UI.

### Frontend UX Polish

- Further refine detail drawers with small quality-of-life actions such as copy SKU, copy email, or copy id.
- Improve timestamp presentation with relative time plus exact timestamp.
- Refine local loading and error states for drawers and list views.
- Preserve search and filter state more consistently when navigating back to a list.
- Improve responsive behavior for dense tables and detail drawers on smaller screens.
- Add a few more accessibility refinements for focus states, keyboard flow, and screen reader clarity.

### Frontend Testing

- Add focused UI tests for detail drawers and health-state messaging.
- Add coverage for product detail without inventory.
- Add coverage for order cancellation from the detail drawer.
- Add tests for login behavior while the backend is still starting up.

## Improvements That Require New Backend Work

### User Management

- Replace the bootstrap-only auth model with persisted application users.
- Add internal user management for creating, disabling, and updating users.
- Add real role handling beyond the current bootstrap setup.
- Add password reset or password change flows if the project evolves further.

### Customer Access

- Support customer-facing login with a separate limited experience.
- Allow a customer to view only their own profile and order history.
- Add role-based route and endpoint access rules for admin vs customer use cases.

### API and Data Evolution

- Add backend search and filtering for larger datasets.
- Add pagination for products, customers, inventory, and orders.
- Add summary metrics or dashboard endpoints if a real overview page is introduced.
- Add inventory movement history or simple audit trails for key actions.
- Extend the domain with richer data such as categories, customer addresses, or order notes.

## Recommended Priority If The Project Continues

1. Keep the current version as the portfolio baseline.
2. If only one extra frontend pass is desired, add a lightweight overview page plus links to API documentation.
3. If one major technical phase is desired, implement persisted users and internal user management.

## Current Recommendation

The project is already in a strong state for deployment and portfolio presentation.

At this point, the highest-value move is to publish the current version rather than expand scope further.
