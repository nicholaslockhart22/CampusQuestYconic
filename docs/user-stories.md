# CampusQuest MVP User Stories

This backlog is derived from [spec.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/spec.md) and grouped by epic. Stories are written to support concurrent implementation by senior engineers.

## Epic 1: Platform Foundations

- As an engineer, I want a shared monorepo structure so mobile, backend, and admin code can evolve with clear boundaries.
- As an engineer, I want CI pipelines for linting, tests, and type safety so parallel changes fail fast.
- As an engineer, I want environment templates and secrets conventions so onboarding does not block execution.
- As an engineer, I want versioned API schemas so frontend and backend teams can integrate without waiting on live endpoints.
- As an operator, I want structured logs and request tracing so production issues can be debugged quickly.

## Epic 2: Identity, Onboarding, and Campus Membership

- As a student, I want to sign up with email so I can create an account quickly.
- As a student, I want to verify my school email so I can access my campus community.
- As a student, I want to create a profile with name, avatar, and bio so my account feels personal.
- As a student, I want to pick or confirm my campus so my feed and quests are relevant to me.
- As a returning user, I want to stay signed in securely so I can resume progress without friction.

## Epic 3: Activity Logging and Reward Engine

- As a student, I want to log a study session so I get credit for academic effort.
- As a student, I want to log a workout so my physical progress contributes to my character.
- As a student, I want to log event attendance or club participation so campus engagement is rewarded too.
- As a student, I want XP and stat gains to appear immediately after logging an action so the reward loop feels satisfying.
- As the system, I want reward events to be idempotent so retries never double-grant XP.
- As an admin, I want reward rules to be configurable so we can tune the economy without code changes.

## Epic 4: Progression, Streaks, and Quests

- As a student, I want to see my current level, total XP, and stat breakdown so progress is visible.
- As a student, I want the app to track my daily streak so consistency feels meaningful.
- As a student, I want daily quests so I know what to do next.
- As a student, I want weekly quests so I have medium-term goals beyond one session.
- As a student, I want quest progress to update automatically from my activity logs so I do not have to manually reconcile progress.
- As a student, I want to claim quest rewards so completions feel distinct and celebratory.

## Epic 5: Social Feed and Validation

- As a student, I want to share an activity to the campus feed so my progress can be seen.
- As a student, I want to keep some activities private so I control what becomes public.
- As a student, I want to react to a peer’s post so positive reinforcement is easy.
- As a student, I want to validate eligible posts so trustworthy achievements carry more weight.
- As a student, I want my feed to show campus-relevant activity only so it feels local and useful.
- As a student, I want reporting tools so harmful or fake content can be flagged.

## Epic 6: Leaderboards, Competition, and Retention

- As a student, I want to see my ranking against my campus peers so I feel motivated to improve.
- As a student, I want daily, weekly, and all-time leaderboard views so I can measure progress across time horizons.
- As a student, I want in-app reminders when my streak is at risk so I do not lose momentum accidentally.
- As a student, I want notifications when someone reacts to or validates my post so the product feels socially alive.

## Epic 7: Admin, Moderation, and Operations

- As an admin, I want to review reported posts so harmful content can be removed quickly.
- As an admin, I want to inspect flagged activity logs so abuse does not distort the reward system.
- As an admin, I want to create and manage quest templates so campaigns can be updated without engineering work.
- As an admin, I want to adjust reward rules so the XP economy remains balanced.
- As an admin, I want audit logs for moderation and reward changes so operator actions are traceable.

## Epic 8: Beta Readiness and Pilot Launch

- As a product owner, I want dashboards for activation, retention, and quest completion so the pilot can be evaluated.
- As an engineer, I want smoke tests for the critical loop so releases do not break onboarding or rewards.
- As a support operator, I want searchable user and activity records so pilot incidents can be resolved quickly.
- As a launch team member, I want feature flags so risky changes can be enabled by campus or cohort.

## Story Slicing Guidance

Stories should be implemented as thin vertical slices whenever possible:

- contract first
- backend endpoint second
- client integration third
- analytics and tests in the same story

Avoid stories that are only “build all backend” or only “build all UI” unless
the work is pure platform scaffolding.
