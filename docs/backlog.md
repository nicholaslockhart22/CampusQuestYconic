# CampusQuest Backlog

This document is the canonical GitHub planning source for CampusQuest. It
consolidates epics, sprint structure, and implementation stories from:

- [epics.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/epics.md)
- [user-stories.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/user-stories.md)
- [sprint-backlog.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/sprint-backlog.md)

The backlog is designed for a team of 5-8 senior engineers working in parallel.

## Epics

1. Platform Foundations
2. Identity, Onboarding, and Campus Membership
3. Activity Logging and Reward Engine
4. Progression, Streaks, and Quests
5. Social Feed and Validation
6. Leaderboards, Competition, and Retention
7. Admin, Moderation, and Operations
8. Beta Readiness and Pilot Launch

## Sprints

1. Sprint 0: Architecture and Enablement
2. Sprint 1: Onboarding and Core Activity Loop
3. Sprint 2: Streaks, Quests, and Progression
4. Sprint 3: Social Feed and Leaderboards
5. Sprint 4: Pilot Hardening and Launch Readiness

## GitHub Planning Model

### Labels

- `type:epic`
- `type:story`
- `type:infra`
- `area:mobile`
- `area:backend`
- `area:admin`
- `area:platform`
- `area:analytics`
- `priority:p0`
- `priority:p1`
- `priority:p2`
- `sprint:0`
- `sprint:1`
- `sprint:2`
- `sprint:3`
- `sprint:4`

### Milestones

- Sprint 0
- Sprint 1
- Sprint 2
- Sprint 3
- Sprint 4

### Epic Issues

Each epic should exist as a top-level GitHub issue labeled `type:epic`.

### Story Issues

Stories should be created as individual GitHub issues labeled `type:story` and
assigned to exactly one sprint milestone plus one functional area.

## Initial Sprint Backlog

### Sprint 0

- Establish repository layout for mobile, admin, API, and shared packages.
- Define TypeScript project references or workspace package boundaries.
- Create CI pipeline for lint, typecheck, unit test, and build.
- Add environment templates and local setup documentation.
- Define API contract package with schema conventions.
- Create database baseline migration for users, campuses, and sessions.
- Stand up auth scaffold and health endpoints.
- Add logging, tracing hooks, and error reporting scaffold.
- Add feature flag framework and seed configuration support.

### Sprint 1

- Build signup and login screens.
- Build school email verification flow.
- Build profile creation and campus selection UI.
- Implement signup, login, logout, and session APIs.
- Implement school email verification and campus lookup.
- Persist user profile and campus membership.
- Implement activity type catalog and create activity endpoint.
- Implement reward engine v1 with idempotent reward events.
- Implement total XP, level, and stat updates.
- Build dashboard shell showing level, XP, stats, and recent activity.
- Integrate activity logging form.
- Show reward success state after submit.
- Seed dev campuses and test users.
- Add analytics events for signup and activity logging.
- Add integration test for activity to reward flow.

### Sprint 2

- Implement streak state model and evaluation rules.
- Add streak updates to qualifying reward events.
- Expose progress API for dashboard use.
- Implement quest templates, user quest assignment, and progress tracking.
- Support daily and weekly recurrence.
- Implement claim reward endpoint.
- Add streak card, quest list, and quest detail views.
- Show progress bars, timers, and claim interactions.
- Add empty and expired quest states.
- Build internal quest template CRUD UI.
- Add reward rules read-only visibility.
- Add basic admin auth gate.
- Add unit tests for streak logic and quest progression.
- Add end-to-end flow for activity completing a quest.

### Sprint 3

- Implement feed read and create endpoints.
- Support post creation from completed activities or quest completions.
- Implement reactions, validations, and report submission.
- Build campus feed UI and post composer.
- Add activity share flow from reward success state.
- Add reactions and validation actions.
- Implement daily, weekly, and all-time ranking queries.
- Add anti-abuse filters for suspicious activity.
- Expose ranking API contracts.
- Build leaderboard screens and ranking filters.
- Add rank change and streak-risk notification surfaces.
- Build moderation queue and post removal actions.
- Add report review workflow and audit logging.

### Sprint 4

- Add retry-safe handling for critical writes.
- Harden idempotency checks.
- Add recovery playbooks for reward and quest failures.
- Build activation and retention dashboards.
- Validate event quality and naming consistency.
- Implement in-app notification center.
- Emit events for quest completion, streak risk, reactions, and validations.
- Finish reward rule management.
- Add support tooling for user lookup and activity inspection.
- Run performance pass on dashboard, feed, and leaderboard APIs.
- Complete smoke suite for onboarding, activity logging, quests, and feed.
- Write pilot rollout checklist and incident process.
