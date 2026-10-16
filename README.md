# request-api-handling

## What this is
A small TypeScript/Node service that periodically fetches user data from an external source and exposes a simple HTTP API to search and retrieve stored users. It's designed for local development or to run behind a process manager in a container; data is persisted in MongoDB.

### Stack
- Language(s): TypeScript
- Framework / runtime: Node.js + Express
- Notable libraries: express, mongoose, dotenv

## How it's organized
```
src/
  index.ts                # app entrypoint — server setup, routes
  config/
    config.ts             # environment / default configuration
  services/
    UserService.ts        # business logic: fetch users & DB queries
    __tests__/            # service tests
  models/
    User.ts               # Mongoose User schema & indexes
    Config.ts             # Mongoose Config schema
  interfaces/
    user.interface.ts     # TypeScript interfaces for user data
dist/                     # compiled output (gitignored)
package.json              # scripts & dependencies
tsconfig.json
README.md
```

How it fits together:
- src/index.ts wires dotenv, connects to MongoDB, instantiates UserService and registers two main HTTP routes.
- UserService (src/services/UserService.ts) contains the logic to fetch user data from the external API and to query the MongoDB User collection (pagination, search, sorting).
- Models (src/models/*.ts) define the persistence layer (Mongoose schemas & indexes) used by the service.

## How to run it
1. Install dependencies:
```bash
npm install
```

2. Build (if using TypeScript build step) and start:
```bash
npm run build    # if project has a build step
npm start
```
For development (run with ts-node / nodemon if available):
```bash
npm run dev
```

Default environment variables used by the application (set these in a .env file or the environment):
- PORT — HTTP port (default: 3000)
- MONGODB_URI — MongoDB connection string (default: mongodb://localhost:27017/user-service)
- API_RATE_LIMIT — rate limit for external fetch requests (default: 5)
- BATCH_SIZE — number of users to fetch per batch (default: 300)

Example .env:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/user-service
API_RATE_LIMIT=5
BATCH_SIZE=300
```

## API
- POST /api/users/fetch
  - Triggers the user fetch process (starts background fetch/populate into MongoDB).
  - Request body: none
  - Response: JSON message confirming process started or an error.

- GET /api/users
  - Retrieves stored users with pagination, optional search and sort.
  - Query params:
    - page (number) — page number (default 1)
    - limit (number) — items per page (default e.g. 10)
    - sortBy (string) — field to sort by (e.g. name)
  - Body (optional): search criteria (JSON) to filter users (e.g. by country, gender, name).
  - Response: JSON with paginated users.

Example curl:
```bash
# trigger fetch
curl -X POST http://localhost:3000/api/users/fetch

# get users (page 1, 10 per page)
curl "http://localhost:3000/api/users?page=1&limit=10"
```

## Development notes & suggestions
- The models include indexes (email, gender, address.country, name text index) for faster queries — adjust indexes if your search patterns change.
- The service expects a running MongoDB instance; for local work use a local MongoDB or a container.
- If adding new routes, keep routing and business logic separated: routes in index.ts should call services in src/services.

## Try asking
- How can I change the user-fetch source URL and pagination logic in src/services/UserService.ts?
- Where is the MongoDB connection configured and how can I add connection options (auth, poolSize)?
- The README mentions a background fetch: what happens if the fetch fails mid-batch — is it retried or resumed?
