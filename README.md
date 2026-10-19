Catalog Inventory

## Pages

- `/` — searchable catalog with server-side paging and sorting.
- `/product.html?id=1` — details for a product.
- `/learning.html` — request flow, OOP concepts, LLD boundaries, and pagination notes.

## Pagination API

`GET /api/products/page?page=0&size=10&sortBy=id&direction=desc` returns the requested page, total matching rows, and total pages. Page numbers are zero-based. `size` is limited to 1–50; supported sort fields are `id`, `name`, `price`, `quantity`, and `rating`. Add `name=term` to filter by product name. The browser calls `/api/products/summary` separately for whole-inventory totals.

The controller validates HTTP parameters and delegates to `ProductService`. The service decides which repository operation to use, and `ProductRepository` asks Spring Data JPA for the database page. Open `/learning.html` while the app is running for a walkthrough of OOP and LLD concepts used by the project.
