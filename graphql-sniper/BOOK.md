GraphQL Sniper Session Notes

Date: 2026-02-21

1. What we built
- Moved from scaffold-style GraphQL to feature-based structure.
- Added `users` feature module with:
  - `User` GraphQL object type (`@ObjectType`, `@Field`)
  - `CreateUserInput` GraphQL input type (`@InputType`, `@Field`)
  - `users` query
  - `createUser` mutation
- Updated app wiring in `apps/api/src/app.module.ts` to import `UsersModule`.

2. Production safety
- Changed GraphQL config so introspection and playground are enabled only outside production:
  - `introspection: process.env.NODE_ENV !== 'production'`
  - `playground: process.env.NODE_ENV !== 'production'`

3. Testing
- Replaced old REST e2e test with GraphQL e2e tests in `apps/api/test/app.e2e-spec.ts`.
- Added coverage for:
  - empty `users` query result
  - `createUser` mutation
  - follow-up `users` query result

4. Docker issue and root cause
- Error: mounting `nginx.conf` failed with “not a directory”.
- Meaning: Docker saw a directory/file type mismatch in bind mount.
- Fix approach:
  - run compose from correct project folder
  - verify host path type for `nginx/nginx.conf`
  - clear stale compose state with `docker compose down --remove-orphans`
- Fix result:
  - `docker compose up --build --watch` worked after correcting compose run context and mount state.

5. Why `pnpm test:e2e` failed in container
- Command was run at workspace root where `test:e2e` script does not exist.
- Correct target is API package:
  - `pnpm --filter @sniper/api test:e2e`
  - or `cd apps/api && pnpm test:e2e`

6. Manual GraphQL verification flow
- Open `http://localhost:8081/graphql`.
- Run:
  - `users` query (expect empty list initially)
  - `createUser` mutation
  - `users` query again (expect created user)

7. Key lessons
- Keep GraphQL schema explicit with DTO/object decorators.
- Organize by feature module early to avoid monolithic resolvers.
- Lock down introspection/playground in production.
- In monorepos, run scripts via package filter or package directory.
- Docker bind mount errors usually come from wrong path context or file-vs-directory mismatch.

8. Issue-fix summary (quick)
- Issue A: Nginx bind mount failed (`not a directory`).
- Cause: host mount path resolved with wrong type/path context.
- Fix: run compose in correct folder, validate `nginx/nginx.conf` is a file, restart compose stack cleanly.
- Issue B: `pnpm test:e2e` failed with `Command "test:e2e" not found`.
- Cause: command executed at workspace root, but script exists in `@sniper/api`.
- Fix: run filtered package script (`pnpm --filter @sniper/api test:e2e`) or run inside `apps/api`.

9. Command list used in this lesson
- General/project commands:
  - `cd /home/guosong/dev/graphql-api/graphql-sniper`
  - `ls -la nginx`
  - `cat apps/api/package.json`
  - `cat package.json`
  - `cat pnpm-workspace.yaml`
- Docker/compose commands:
  - `docker compose up --build --watch`
  - `docker compose down --remove-orphans`
  - `docker compose config`
  - `docker compose -f graphql-sniper/docker-compose.yaml config`
  - `docker compose exec sniper_app pnpm --filter @sniper/api test:e2e`
  - `docker compose exec sniper_app sh -lc "cd apps/api && pnpm test:e2e"`
  - `docker compose exec sniper_app pnpm --filter @sniper/api test`
- GraphQL manual test path:
  - `http://localhost:8081/graphql`

10. Command purpose (what each one is for)
- `cd /home/guosong/dev/graphql-api/graphql-sniper`
  - move to the compose/project root so relative paths in `docker-compose.yaml` resolve correctly.
- `ls -la nginx`
  - verify `nginx` folder contents and confirm `nginx.conf` exists.
- `cat apps/api/package.json`
  - check API scripts (for example `test:e2e`) and dependencies.
- `cat package.json`
  - check root workspace scripts and understand which scripts exist at root level.
- `cat pnpm-workspace.yaml`
  - confirm workspace package locations (`apps/*`), which explains filter behavior.
- `docker compose up --build --watch`
  - build images, start services, and enable file watch workflow for development.
- `docker compose down --remove-orphans`
  - stop and clean the current compose stack, including stale/orphan services.
- `docker compose config`
  - render final resolved compose config to validate paths, mounts, and service settings.
- `docker compose -f graphql-sniper/docker-compose.yaml config`
  - same validation as above but with an explicit compose file path.
- `docker compose exec sniper_app pnpm --filter @sniper/api test:e2e`
  - run e2e tests only for the API workspace package inside the running app container.
- `docker compose exec sniper_app sh -lc "cd apps/api && pnpm test:e2e"`
  - alternative way to run API e2e tests by changing directory inside the container.
- `docker compose exec sniper_app pnpm --filter @sniper/api test`
  - run unit/integration test suite for API package inside container.
- `http://localhost:8081/graphql`
  - open GraphQL endpoint through nginx proxy for manual query/mutation testing.

11. GraphQL operations we made
- Query: `users`
  - purpose: return all users from in-memory store.
  - shape:
    - `users { id name email }`
- Mutation: `createUser(input: CreateUserInput!)`
  - purpose: create one user, then return created object.
  - shape:
    - `createUser(input: { name, email }) { id name email }`

12. Code impact of GraphQL request flow
- Entry point: `apps/api/src/app.module.ts`
  - GraphQL module enabled with Apollo driver and auto schema generation.
  - production safety added (`introspection`/`playground` disabled in production).
  - `UsersModule` imported so user resolvers are registered.
- Feature registration: `apps/api/src/modules/users/users.module.ts`
  - wires resolver and service providers for users feature.
- Resolver layer: `apps/api/src/modules/users/users.resolver.ts`
  - `users` query maps to `UsersService.findAll()`.
  - `createUser` mutation maps to `UsersService.create(input)`.
- Service layer: `apps/api/src/modules/users/users.service.ts`
  - holds in-memory `users` array.
  - `create` assigns incremental string `id` and pushes new record.
- GraphQL schema types:
  - `apps/api/src/modules/users/entities/user.type.ts`
    - output object fields (`id`, `name`, `email`).
  - `apps/api/src/modules/users/dto/create-user.input.ts`
    - mutation input contract (`name`, `email`).
- E2E verification: `apps/api/test/app.e2e-spec.ts`
  - confirms query empty state.
  - confirms mutation result.
  - confirms query-after-mutation state.

---

GraphQL + Go Gateway Session Notes

Date: 2026-03-01

1. What we learned today
- GraphQL as a gateway is a strong architecture when:
  - GraphQL handles client-facing schema and response shaping.
  - Go REST API owns business logic and database access.
  - GraphQL never accesses DB directly.
- Field selection in GraphQL can be forwarded to REST (`fields=...`) so DB can select only needed columns.
- Docker networking matters:
  - `localhost` inside container means that container itself.
  - for separate compose projects, use host bridge IP or shared network strategy.

2. Architecture we implemented
- Client -> Nest GraphQL (`graphql-sniper/apps/api`) -> Go REST (`secret-shop`) -> PostgreSQL.
- Nest resolver/service acts as gateway/orchestrator only.
- Go API implements layered design:
  - `handler` (HTTP)
  - `service` (business logic + error mapping)
  - `repository` (SQL + DB I/O)
  - `domain` (core model structs)

3. Nest GraphQL code we added and why
- Added `catalog` module:
  - `catalog.module.ts`: module registration.
  - `catalog.resolver.ts`: GraphQL queries (`products`, `product`) + selected field extraction from GraphQL AST.
  - `catalog.service.ts`: calls Go REST API via `fetch`, validates params, maps errors.
  - `dto/products.args.ts`: `limit`, `offset` args schema.
  - `entities/product.type.ts`: GraphQL `Product` output schema.
- Updated `app.module.ts` to import `CatalogModule`.
- Purpose:
  - expose stable GraphQL schema to frontend.
  - forward request to Go REST API.
  - support response projection by forwarding selected fields.

4. Go REST code we added and why
- Added product stack:
  - `internal/domain/product.go`: product model.
  - `internal/repository/product_repository.go`: DB queries.
  - `internal/service/product_service.go`: service methods + not-found mapping.
  - `internal/handler/product_handler.go`: HTTP endpoints + query param validation.
  - `cmd/api/main.go`: route wiring under `/api/v1`.
- REST endpoints:
  - `GET /api/v1/products?limit=&offset=&fields=...`
  - `GET /api/v1/products/:id?fields=...`
- Purpose:
  - separate concerns cleanly.
  - keep DB logic in Go service.
  - accept projected fields and reduce DB/select payload.

5. Schema design: Nest GraphQL
- Output schema uses decorators:
  - `@ObjectType()` + `@Field()` for `Product`.
- Query args schema uses:
  - `@ArgsType()` + `@Field(() => Int)` for pagination.
- Resolver defines schema operations:
  - `@Query(() => [Product], { name: 'products' })`
  - `@Query(() => Product, { name: 'product' })`
- GraphQL schema is auto-generated (`autoSchemaFile: true`) from decorators.

6. Schema/contract design: Go REST
- Request contract:
  - `limit` (positive), `offset` (non-negative), `fields` (comma-separated whitelist).
- Response contract:
  - list: `{ data: [...], meta: { limit, offset, count } }`
  - detail: `{ data: {...} }`
- Projection contract:
  - GraphQL-selected fields are sent to Go in `fields=...`.
  - Go validates fields and maps API fields to SQL columns (e.g. `isActive -> is_active`).

7. SQL projection optimization we implemented
- Initial state: SQL selected all columns, then JSON filtered response.
- Final state:
  - repository builds dynamic `SELECT` columns from whitelisted requested fields.
  - scan targets are dynamic and aligned with selected columns.
- Result:
  - if GraphQL asks `id`, `name`, SQL becomes:
    - `SELECT id, name FROM products ORDER BY id LIMIT $1 OFFSET $2`

8. Refactors for maintainability
- Replaced repetitive field switch logic with maps:
  - repository: field bindings map (column + scan target function).
  - handler: response extractor map for JSON output.
- Benefit:
  - add/change a field in one place instead of many switch blocks.

9. Key issues we hit and fixes
- GraphQL gateway unreachable upstream:
  - cause: wrong container network target (`localhost` confusion).
  - fix: set `SECRET_SHOP_API_BASE_URL` reachable from Nest container.
- Docker rebuild error (`credentials` / BuildKit frontend):
  - cause: Docker credential/helper instability.
  - fix: re-auth/restart Docker Desktop or remove syntax line as temporary fallback.
- TypeScript resolver compile errors:
  - `GraphQLResolveInfo` import needed `import type`.
  - guarded `selectionSet` for strict TS checks.
- Field forwarding empty from GraphQL:
  - fixed resolver field extraction with robust fallback.

10. Docker/dev workflow updates
- Go compose updated with watch:
  - `secret-shop/docker-compose.yml` now has `develop.watch` with `action: rebuild`.
- Useful commands:
  - Go rebuild: `docker compose up -d --build secret_app`
  - Nest recreate: `docker compose up -d --build --force-recreate sniper_app`
  - Go logs: `docker compose logs -f secret_app`
  - Nest logs: `docker compose logs -f sniper_app`

11. How to verify projection end-to-end
- Direct REST test:
  - `GET /api/v1/products?limit=1&offset=0&fields=id,name`
  - verify response only has `id`, `name`.
- GraphQL test:
  - `products { id name }`
  - verify Go receives `fields=id,name`.
  - verify SQL only selects requested columns.

12. Next recommended steps
- Add auth at GraphQL gateway and forward user context to Go.
- Build first order/cart write flow with transactions in Go.
- Add tests:
  - Go service/repository tests for order consistency rules.
  - Nest resolver/service tests with mocked REST.
