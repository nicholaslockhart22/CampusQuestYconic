# CampusQuest Sprint Backlog

This backlog is designed for 5-8 senior engineers working in parallel over the
first four sprints. It assumes a modular monolith backend, one mobile app, and
an internal admin surface.

## Team Shape

Recommended team composition:

- 2 mobile engineers
- 2 backend engineers
- 1 full-stack engineer for admin and integration work
- 1 platform engineer for CI, environments, observability, and release tooling
- 1 floating senior engineer or tech lead for cross-cutting architecture, code review, and risk retirement

If only 5 engineers are available, combine admin with backend and make one
mobile engineer own more of the contract and integration layer.

## Parallel Development Model

To allow simultaneous coding:

- freeze API contracts at the start of each sprint
- generate typed clients from shared schemas
- require one owner per domain module
- keep DB migrations isolated by feature branch and rebase daily
- use feature flags for incomplete flows
- merge vertical slices behind flags instead of long-lived branches

Suggested ownership boundaries:

- `apps/mobile`: onboarding, dashboard, feed, quests, notifications UI
- `apps/admin`: quest admin, moderation UI, reward rules UI
- `services/api/src/identity`: auth, sessions, campus membership
- `services/api/src/activity`: activity logs, anti-abuse checks
- `services/api/src/rewards`: XP, levels, stats, streaks
- `services/api/src/quests`: templates, assignments, progress
- `services/api/src/social`: feed, reactions, validations, reports
- `services/api/src/leaderboards`: ranking and aggregation
- `packages/contracts`: DTOs, schemas, event definitions
- `packages/analytics`: event helpers and naming contracts

## Sprint 0: Architecture and Enablement

### Sprint Goal

Create the shared foundation so all engineers can begin feature work in parallel
in Sprint 1.

### Backlog

- Establish repository layout for mobile, admin, API, and shared packages.
- Define TypeScript project references or workspace package boundaries.
- Create CI pipeline for lint, typecheck, unit test, and build.
- Add environment templates and local setup documentation.
- Define API contract package with schema conventions.
- Create database baseline migration for users, campuses, and sessions.
- Stand up auth scaffold and health endpoints.
- Add logging, tracing hooks, and error reporting scaffold.
- Add feature flag framework and seed configuration support.

### Definition of Done

- every engineer can boot the app and API locally
- CI is required on merge
- shared contract workflow is documented

## Sprint 1: Onboarding and Core Activity Loop

### Sprint Goal

Ship the first end-to-end student flow: sign up, join a campus, log an
activity, and receive XP.

### Parallel Workstreams

#### Stream A: Mobile Onboarding

- Build signup and login screens.
- Build school email verification flow.
- Build profile creation and campus selection UI.

#### Stream B: Identity Backend

- Implement signup, login, logout, and session APIs.
- Implement school email verification and campus lookup.
- Persist user profile and campus membership.

#### Stream C: Activity and Rewards Backend

- Implement activity type catalog and create activity endpoint.
- Implement reward engine v1 with idempotent reward events.
- Implement total XP, level, and stat updates.

#### Stream D: Mobile Dashboard

- Build dashboard shell showing level, XP, stats, and recent activity.
- Integrate activity logging form.
- Show reward success state after submit.

#### Stream E: Platform

- Seed dev campuses and test users.
- Add analytics events for signup and activity logging.
- Add integration test for activity to reward flow.

### Sprint Exit Criteria

- student can complete onboarding
- verified student can log one activity
- XP and stat gains are visible immediately

## Sprint 2: Streaks, Quests, and Progression

### Sprint Goal

Make the product sticky by adding daily return mechanics and clear progress
goals.

### Parallel Workstreams

#### Stream A: Rewards and Streaks Backend

- Implement streak state model and evaluation rules.
- Add streak updates to qualifying reward events.
- Expose progress API for dashboard use.

#### Stream B: Quest Backend

- Implement quest templates, user quest assignment, and progress tracking.
- Support daily and weekly recurrence.
- Implement claim reward endpoint.

#### Stream C: Mobile Progression UX

- Add streak card, quest list, and quest detail views.
- Show progress bars, timers, and claim interactions.
- Add empty and expired quest states.

#### Stream D: Admin Foundations

- Build internal quest template CRUD UI.
- Add reward rules read-only visibility.
- Add basic admin auth gate.

#### Stream E: Quality

- Add unit tests for streak logic and quest progression.
- Add end-to-end flow for activity completing a quest.

### Sprint Exit Criteria

- streak updates are correct and server-authoritative
- quest progress updates from real activities
- users can claim quest rewards successfully

## Sprint 3: Social Feed and Leaderboards

### Sprint Goal

Add the community layer that differentiates CampusQuest from a simple habit
tracker.

### Parallel Workstreams

#### Stream A: Social Backend

- Implement feed read and create endpoints.
- Support post creation from completed activities or quest completions.
- Implement reactions, validations, and report submission.

#### Stream B: Mobile Feed UX

- Build campus feed UI and post composer.
- Add activity share flow from reward success state.
- Add reactions and validation actions.

#### Stream C: Leaderboards Backend

- Implement daily, weekly, and all-time ranking queries.
- Add anti-abuse filters for suspicious activity.
- Expose ranking API contracts.

#### Stream D: Mobile Competition UX

- Build leaderboard screens and ranking filters.
- Add rank change and streak-risk notification surfaces.

#### Stream E: Admin Moderation

- Build moderation queue and post removal actions.
- Add report review workflow and audit logging.

### Sprint Exit Criteria

- users can share, react, and validate
- users can view ranked competition windows
- moderation workflow exists for unsafe content

## Sprint 4: Pilot Hardening and Launch Readiness

### Sprint Goal

Stabilize the product for a controlled campus beta.

### Parallel Workstreams

#### Stream A: Reliability

- Add retry-safe handling for critical writes.
- Harden idempotency checks.
- Add recovery playbooks for reward and quest failures.

#### Stream B: Product Analytics

- Build activation and retention dashboards.
- Validate event quality and naming consistency.

#### Stream C: Notifications

- Implement in-app notification center.
- Emit events for quest completion, streak risk, reactions, and validations.

#### Stream D: Admin and Operations

- Finish reward rule management.
- Add support tooling for user lookup and activity inspection.

#### Stream E: Beta Readiness

- Run performance pass on dashboard, feed, and leaderboard APIs.
- Complete smoke suite for onboarding, activity logging, quests, and feed.
- Write pilot rollout checklist and incident process.

### Sprint Exit Criteria

- critical flows meet beta quality bar
- pilot metrics are observable
- operational support tools exist

## Story Point Guidance

Use small stories with explicit owners:

- 1-2 points: UI polish, analytics, validation, simple endpoint
- 3-5 points: normal vertical slice
- 8 points: only for infrastructure or integration-heavy work

If a story exceeds 8 points, split it before sprint planning.

## Senior Team Working Agreement

- One engineer owns architecture integrity for each domain.
- All stories include automated tests unless pure scaffolding.
- New APIs are not merged without schema definitions and example payloads.
- Cross-domain changes require a short design note before implementation.
- Pair on risky migrations, auth, reward logic, and concurrency-sensitive code.
- Optimize for mergeable increments, not heroic branches.
