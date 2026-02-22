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
