# Arda Dreamland

My solution to Arda's "Dreamland" code assignment for a job application as software engineer.

## Steps taken 

* Bootstrapped initial project structure with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
* Added 4 Endpoints with schema's for validation:
  - `POST /tokens` : user has won some amount of DREAM token at a particular time of a day (can be fractional tokens)
  - `GET /tokens?user_id={user_id}` : returns the history of tokens a user has won for the current day so far
  _ `GET /usd?user_id={user_id}` : returns the history of USD amounts a user has won till now (since start of current day)
  - `GET /stats?user_id={user_id}` : returns the stats: sum of tokens won on the current day so far and the total value of USD a user has in his account
* Replaced TAP with Jest and added some API tests (failing first to spec the API endpoints and responses)
* Added TypeORM using Fastify-TypeORM plugin, with data models for users, tokens and usd ledgers (using auto sync without migrations)
* Implemented logic for API endpoints & fixed tests with mocked database
* Fixed issue with TypeORM entities and auto-sync (moved all stats into one Accounts entity for simplicity)
* Added Decimal.js to fix rounding issues with floating point numbers

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.
