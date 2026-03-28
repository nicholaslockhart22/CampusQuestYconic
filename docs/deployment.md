# CampusQuest Deployment Guide

## Production Shape

CampusQuest is packaged as a single Node.js service for production.

The production server:

- serves the mobile client at `/`
- serves the admin client at `/admin`
- serves the API on `/api/*`
- exposes health checks on `/health` and `/ready`
- persists local JSON data using `DATA_FILE_PATH`

## Environment Variables

- `PORT`: HTTP port for the production server. Default `8080`
- `DATA_FILE_PATH`: writable path for the application database file
- `LOG_REQUESTS`: set to `false` to disable request logging

## Local Production Run

```bash
npm run start:prod
```

Open:

- `http://localhost:8080`
- `http://localhost:8080/admin`

## Docker

Build:

```bash
docker build -t campusquest:latest .
```

Run:

```bash
docker run --rm -p 8080:8080 -e PORT=8080 -e DATA_FILE_PATH=/app/data/db.json -v "$(pwd)/.data:/app/data" campusquest:latest
```

## Docker Compose

```bash
docker compose up --build
```

This exposes the app on `http://localhost:8080` and persists data in a Docker
volume.

## Release Checklist

- Run `npm test`
- Run `npm run smoke:test` against a live instance
- Verify `/health` and `/ready`
- Verify admin login on `/admin`
- Verify user signup, activity log, quest claim, and feed post
- Verify data path is writable in the target environment

## Operational Notes

- This MVP uses file-backed persistence and is suitable for a pilot or small
  controlled deployment.
- For multi-instance production, move persistence to a shared database before
  horizontal scaling.
- For internet-facing deployment, place the app behind TLS termination and
  standard reverse proxy controls.
