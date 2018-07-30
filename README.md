# journey

server: Node.js
db: PostgreSQL

## Config

setup a config/config.json file

```
{
  "development": {
    "username": "admin",
    "database": "journey",
    "host": "db",
    "dialect": "postgres",
    "google_api_key": "YOUR_API_KEY"
  },
  "testing": {
      ...
  },
  "production": {
      ...
  }
}
```

## Docker

```
docker-compose up
```

server will be running on port 3000

## Running in local environment

To start the server on local environment, a local database is required and the following instruction will not include the setup of a database.

Install dependencies

```
npm install
```

Run database migrations

```
npm run up
```

Start server

```
npm start
```

If need to undo database migration

```
npm run down
```

## Notes

The API is built under an assumption that there will not be too many locations in one call (max 6 or 7). If running the api with too many waypoints, the Google API limit will probably be exceeded (especially under free tier).

Token is designed as a hash of the locations (starting location + the rest sorted), so that any duplicated request in the future will not be calculated again. Similarly, distance and time between locations are stored so that the Google API quota will not be wasted to get duplicated results.

## API

### POST /route

```
Details omitted.
```

### GET /route/{token}

```
Details omitted.
```
