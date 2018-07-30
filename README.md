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

## Running in local environment

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

## API

### POST /route

### get /route/{token}
