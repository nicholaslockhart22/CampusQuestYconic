# CampusQuest Software Engineering Specification

## Document Purpose

This document translates the product vision in [vision.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/vision.md)
into an implementable software engineering plan for an MVP release of
CampusQuest.

The scope of this specification is the initial mobile-first platform that
enables students to:

- create an account and profile
- log real-world activities
- earn XP and maintain streaks
- complete quests
- view progression and achievements
- post updates to a campus social feed
- interact with peers through validation and lightweight competition

## Goals

- Build a stable MVP that proves the engagement loop.
- Support daily student use with low friction.
- Establish a backend model that can expand into campus partnerships later.
- Prioritize trust, simplicity, and measurable retention over feature breadth.

## Non-Goals

- Full university SIS or LMS integration in v1
- Complex marketplace or sponsorship systems in v1
- Advanced AI personalization in v1
- Cross-campus federation and multi-tenant institution tooling in v1
- Rich media creation or long-form social content in v1

## Primary Users

### Student

The primary end user. Students create profiles, complete activities, receive
rewards, maintain streaks, and participate in the campus community.

### Campus Ambassador

A student power user who promotes adoption, creates energy on the platform, and
may help seed quests or validate engagement.

### Admin

An internal operations user who manages moderation, quest templates, XP rules,
feature flags, and support workflows.

## Core Product Loop

1. The student signs in and sees available quests, streak status, and progress.
2. The student logs a real-world action or completes a quest-related action.
3. The platform evaluates the event, awards XP, updates stats, and maintains
   streak state.
4. The student optionally shares the result to the social feed.
5. Peers can react or validate the action.
6. The updated state increases motivation for future use.

## Functional Requirements

### 1. Authentication and Accounts

- Users must be able to sign up and sign in with email-based authentication.
- The system should support school email verification for campus membership.
- Users must be able to create a profile with display name, avatar, campus, and
  optional bio.
- Users must be able to edit profile fields after signup.

### 2. Campus Membership

- Each user must belong to one campus for MVP.
- Campus membership should affect visible feed content, leaderboards, and quest
  availability.
- The system should support campus configuration data for branding, feature
  rollout, and moderation boundaries.

### 3. Activity Logging

- Users must be able to log predefined activity types such as study, workout,
  event attendance, club participation, and networking.
- Each activity log must capture user, activity type, timestamp, optional
  duration, optional notes, and verification state.
- The platform must evaluate XP and stat rewards when an activity is submitted.
- Duplicate and abusive submissions must be rate-limited or flagged.

### 4. XP, Stats, and Levels

- Users must earn XP for valid activities and quest completions.
- The system must support named stats such as Focus, Knowledge, Strength,
  Social, and Momentum.
- A leveling model must convert total XP into a user level.
- Reward rules must be centrally configurable by admins.
- Reward calculations must be deterministic and auditable.

### 5. Streaks

- The system must track streaks at minimum for daily activity completion.
- Users must be able to see current streak length and last qualifying action.
- Streak continuation rules must be explicit and consistent across clients.
- The system should support future streak types without schema redesign.

### 6. Quests

- The system must support daily and weekly quests.
- Quests must be template-driven and assignable by activity type, stat target,
  count target, or event participation.
- Users must be able to view available quests, progress, reward value, and
  expiration.
- Quest completion must automatically trigger reward processing.

### 7. Social Feed

- Users must be able to publish an activity or quest completion to the campus
  feed.
- Feed items must support short text, linked activity metadata, timestamp, and
  lightweight reactions.
- Users must be able to validate certain post types subject to policy rules.
- The feed must be scoped to the user campus in MVP.

### 8. Leaderboards and Competition

- Users must be able to view campus leaderboards based on XP and optional stat
  categories.
- Leaderboards must support daily, weekly, and all-time windows.
- The system must prevent obvious manipulation from unverified or spam activity.

### 9. Moderation and Safety

- Admins must be able to review reported posts and flagged activity events.
- The system must support user blocking, content reporting, and post removal.
- Audit trails must exist for moderation actions and reward adjustments.

### 10. Notifications

- The platform should support push-ready notification events even if push
  delivery is deferred in early MVP.
- Users should receive in-app notifications for quest completion, streak risk,
  peer interactions, and leaderboard changes.

## Non-Functional Requirements

### Performance

- Core app screens should load in under 2 seconds on a typical mobile network
  after warm startup.
- Feed and dashboard APIs should target p95 response times under 400 ms.
- XP and reward processing should complete synchronously for normal actions in
  under 500 ms.

### Reliability

- Reward events must not double-apply.
- Core write operations must be idempotent where retries are expected.
- Activity, quest, and XP history must be recoverable from persistent storage.

### Security

- Authentication tokens must be securely stored and rotated using established
  platform practices.
- School verification data and user email must be protected as sensitive data.
- Authorization checks must enforce campus scope and admin-only operations.

### Privacy

- Users must control whether an activity stays private or is shared.
- Private activity logs must never be published to the feed by default.
- Personally identifiable information should be minimized in analytics events.

### Maintainability

- Business rules for XP, streaks, and quest evaluation must be isolated from UI
  code.
- Public APIs must use versioned contracts.
- Event naming and data models must remain consistent across clients and
  backend services.

## Suggested System Architecture

### Client Applications

- Mobile app: React Native with Expo for iOS and Android MVP delivery
- Optional web admin console: Next.js for internal operations

### Backend

- API layer: TypeScript service using NestJS or Express with clear domain
  modules
- Primary database: PostgreSQL
- Cache and queue: Redis
- Object storage: S3-compatible storage for avatar assets
- Authentication: managed auth provider or first-party JWT-based auth

### Domain Services

- Identity service
- Campus service
- Activity service
- Reward engine
- Quest service
- Social feed service
- Leaderboard service
- Moderation service
- Notification service

For MVP, these may live inside a modular monolith rather than separate
deployable services.

## Data Model Overview

### User

- id
- email
- school_email
- display_name
- avatar_url
- campus_id
- level
- total_xp
- created_at
- updated_at

### Campus

- id
- name
- slug
- email_domain_rules
- status
- created_at

### ActivityLog

- id
- user_id
- campus_id
- activity_type
- duration_minutes
- notes
- verification_status
- source
- created_at

### QuestTemplate

- id
- campus_id nullable
- type
- title
- description
- reward_xp
- reward_stat_map
- recurrence
- start_at
- end_at
- status

### UserQuest

- id
- user_id
- quest_template_id
- progress_value
- completed_at
- claimed_at
- state

### RewardEvent

- id
- user_id
- source_type
- source_id
- xp_delta
- stat_delta_json
- idempotency_key
- created_at

### FeedPost

- id
- user_id
- campus_id
- activity_log_id nullable
- body
- visibility
- created_at

### Reaction

- id
- feed_post_id
- user_id
- type
- created_at

### Validation

- id
- feed_post_id
- validator_user_id
- result
- created_at

### StreakState

- id
- user_id
- streak_type
- current_count
- last_qualified_at
- grace_state
- updated_at

## API Surface

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/verify-school-email`

### Profile

- `GET /me`
- `PATCH /me`

### Activity

- `POST /activities`
- `GET /activities`
- `GET /activities/:id`

### Quests

- `GET /quests`
- `GET /quests/:id`
- `POST /quests/:id/claim`

### Rewards and Progress

- `GET /me/progress`
- `GET /me/rewards`
- `GET /leaderboards`

### Feed

- `GET /feed`
- `POST /feed/posts`
- `POST /feed/posts/:id/reactions`
- `POST /feed/posts/:id/validations`
- `POST /feed/posts/:id/report`

### Admin

- `GET /admin/reports`
- `POST /admin/quests`
- `PATCH /admin/reward-rules/:id`
- `POST /admin/feed/posts/:id/remove`

## Business Rules

### Reward Engine

- Every rewardable action must produce at most one reward event per idempotency
  key.
- XP rules must be data-driven and not hardcoded into UI clients.
- Stat increases must be bounded by server-authorized rules.

### Verification

- Some actions may be self-reported in MVP.
- Higher-impact actions should support peer validation or future institutional
  verification.
- Leaderboards should discount or exclude suspicious activity patterns.

### Feed Publication

- Activity logging and feed posting must be separable actions.
- The user must explicitly opt to share a completed activity if default privacy
  is private.

### Streak Logic

- A qualifying daily action resets the streak risk window and increments the
  streak when appropriate.
- The canonical streak calculation must run on the server.

## Analytics and Observability

### Product Analytics Events

- `signup_completed`
- `school_verified`
- `activity_logged`
- `reward_granted`
- `quest_viewed`
- `quest_completed`
- `feed_post_created`
- `validation_submitted`
- `streak_extended`
- `leaderboard_viewed`

### Operational Metrics

- Daily active users
- Weekly active users
- Day 1, Day 7, and Day 30 retention
- Activity logs per active user
- Quest completion rate
- Feed posting rate
- Validation rate
- Reward processing failures
- Moderation queue volume

### Technical Observability

- Structured application logs
- Request tracing
- Error aggregation
- Background job monitoring
- Audit logging for admin and reward adjustments

## Testing Strategy

### Unit Tests

- Reward calculation logic
- Streak evaluation
- Quest progress computation
- Authorization policies

### Integration Tests

- Activity creation to reward issuance
- Quest completion lifecycle
- Feed posting and reaction flows
- Leaderboard aggregation correctness

### End-to-End Tests

- Student signup and onboarding
- Logging an activity and receiving XP
- Completing a quest and sharing it
- Reporting abusive content

## Release Plan

### Phase 0: Foundations

- repo setup
- auth
- database schema
- campus model
- user profiles
- analytics instrumentation

### Phase 1: Core Engagement Loop

- activity logging
- reward engine
- levels and stats
- streaks
- daily quests
- progress dashboard

### Phase 2: Social Layer

- feed posting
- reactions
- validations
- leaderboards
- reporting and moderation basics

### Phase 3: Pilot Readiness

- admin tools
- campus configuration
- operational dashboards
- notification plumbing
- beta hardening

## Open Questions

- What level of verification is required for each activity type in MVP?
- Should campus membership be limited strictly to verified school domains?
- What is the initial abuse prevention policy for XP farming?
- Which social interactions should grant rewards, if any?
- What is the default privacy mode for activity logs?
- Will ambassadors have any special in-product permissions?

## Recommended MVP Decision

To keep the initial build tractable, the first implementation should use:

- one mobile client
- one modular monolith backend
- one campus per user
- one primary daily streak type
- text-first social posts
- admin-managed reward rules

This keeps the engineering scope aligned with the real product hypothesis:
whether visible rewards, streaks, and social accountability can increase student
engagement and consistency.
