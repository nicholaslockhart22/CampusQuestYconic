# CampusQuest MVP Epics

This plan is derived from [spec.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/spec.md) and is organized for a team of 5-8 senior engineers working in parallel.

## Delivery Model

Use a modular monolith with strict domain ownership so multiple engineers can
ship simultaneously without constant merge conflicts.

Recommended workstreams:

- Mobile app shell and student experience
- Identity and campus membership
- Activity logging and reward engine
- Quests and progression
- Social feed and leaderboards
- Admin, moderation, and operations
- Platform infrastructure and developer experience

Concurrency rules:

- Each workstream owns its API module, DB migrations, tests, and client surface.
- Shared contracts must be defined first as typed schemas.
- Cross-team integration must happen through versioned API contracts, fixture
  data, and mocked service boundaries.
- Avoid multiple engineers editing the same domain module in the same sprint
  unless one is explicitly the owner and the other is pairing.

## Epic 1: Platform Foundations

### Outcome

Create the technical foundation for a production-grade MVP.

### Scope

- monorepo or workspace structure
- CI and test automation
- environment configuration
- auth/session primitives
- DB migrations and seed data
- typed API contracts
- analytics and observability scaffolding

### Exit Criteria

- local dev setup works for all engineers
- CI validates lint, test, and typecheck
- staging environment is deployable
- baseline auth and healthcheck paths are live

## Epic 2: Identity, Onboarding, and Campus Membership

### Outcome

A student can sign up, verify school affiliation, select a campus, and create a
profile.

### Scope

- email signup and login
- school email verification
- profile creation and editing
- campus scoping rules
- onboarding flow

### Exit Criteria

- verified users can access campus-scoped features
- non-verified users are handled with explicit limitations
- user profile data is persisted and editable

## Epic 3: Activity Logging and Reward Engine

### Outcome

A student can log real-world activity and receive deterministic XP and stat
rewards.

### Scope

- activity type catalog
- activity submission flows
- reward rules engine
- idempotent reward events
- anti-abuse controls

### Exit Criteria

- activity creation results in one and only one reward event
- XP, stat changes, and level updates are visible in the client
- suspicious duplicate behavior is rate-limited or flagged

## Epic 4: Progression, Streaks, and Quests

### Outcome

A student can see daily progress, active streaks, available quests, and earned
achievements.

### Scope

- progression dashboard
- streak engine
- daily and weekly quests
- quest progress tracking
- completion and claim flows

### Exit Criteria

- streak rules are server-authoritative
- quests update automatically based on user actions
- dashboard reflects near-real-time progress

## Epic 5: Social Feed and Validation

### Outcome

Students can share achievements to a campus feed and interact through reactions
and validations.

### Scope

- campus feed retrieval
- post creation from activities or quests
- reactions
- validations
- privacy and sharing controls

### Exit Criteria

- activity logging and posting are separate actions
- private activity remains private by default
- campus users can view and interact with eligible posts only

## Epic 6: Leaderboards, Competition, and Retention

### Outcome

Students can compare progress and receive lightweight motivation from
competition.

### Scope

- campus leaderboards
- time-window ranking
- streak risk reminders
- in-app notifications for wins and interactions

### Exit Criteria

- leaderboard queries scale for MVP traffic
- suspicious activity is filtered from rankings
- notification event generation works for core engagement moments

## Epic 7: Admin, Moderation, and Operations

### Outcome

Internal operators can manage quests, reward rules, abuse handling, and pilot
operations.

### Scope

- admin login and access control
- moderation queue
- report review
- quest template management
- reward rule management
- audit trails

### Exit Criteria

- admins can disable harmful content or users
- reward rules can be changed without redeploying the app
- audit logs exist for operator actions

## Epic 8: Beta Readiness and Pilot Launch

### Outcome

The system is stable enough for a controlled campus pilot.

### Scope

- performance hardening
- analytics dashboards
- smoke tests
- support flows
- release checklists

### Exit Criteria

- critical user flows are covered by automated tests
- beta environment supports pilot users
- product and engineering teams can observe failures quickly
