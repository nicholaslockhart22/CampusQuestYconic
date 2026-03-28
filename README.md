# CampusQuest

CampusQuest is a student-focused platform that turns college life into a
real-world RPG.

## Current State

This repo now includes the full MVP through Sprint 4:

- modular monolith API
- browser-based student app
- admin console
- quests, streaks, feed, leaderboards, moderation, notifications
- analytics and support tooling
- local JSON persistence
- production server, Docker packaging, and CI

## Run

```bash
npm run dev
```

That starts:

- mobile app on `http://localhost:3000`
- admin scaffold on `http://localhost:3002`
- API on `http://localhost:3001`

## Production Run

```bash
npm run start:prod
```

That serves:

- student app on `http://localhost:8080`
- admin console on `http://localhost:8080/admin`
- API on `http://localhost:8080/api/*`

## Test

```bash
npm test
```

## Smoke Test

```bash
npm run smoke:test
```

## Deployment

See [deployment.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/deployment.md).
