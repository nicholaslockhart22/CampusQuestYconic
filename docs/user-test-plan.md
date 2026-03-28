# CampusQuest User Test Plan

This plan validates the MVP defined in [spec.md](/Users/nicklockhart/Downloads/CampusQuestYconic/docs/spec.md) before and during a campus pilot.

## Test Objectives

- Verify that students understand the core loop without explanation.
- Confirm that activity logging and reward feedback feel motivating.
- Validate whether quests and streaks drive repeat usage.
- Test whether the social layer feels positive rather than distracting.
- Identify trust concerns around verification, fairness, and privacy.

## Test Cohorts

- 8-12 undergraduate students across different years
- 3-5 student organization leaders
- 2-3 campus ambassadors
- 2-3 university program stakeholders for admin workflows

## Test Formats

- moderated 1:1 usability sessions
- unmoderated prototype tasks
- 7-day diary study for retention behavior
- pilot beta feedback interviews

## Core User Tests

### Test 1: First-Time Onboarding

Objective:
Measure whether a new student can create an account, understand the product
value, and complete profile setup without assistance.

Tasks:

- sign up
- verify school email
- complete profile
- identify campus
- explain in their own words what the app does

Success Criteria:

- at least 80% complete onboarding without facilitator help
- users can explain XP, quests, and streaks correctly
- onboarding time is under 4 minutes median

### Test 2: Log First Activity

Objective:
Validate whether students can log a real-world action and understand the reward
feedback.

Tasks:

- log a study session
- review XP and stat changes
- identify where level progress changed

Success Criteria:

- at least 90% can submit an activity successfully
- users notice the reward response without prompting
- users describe the feedback loop as motivating, not confusing

### Test 3: Quest Comprehension

Objective:
Determine whether students understand daily and weekly quests and know how to
 make progress on them.

Tasks:

- locate active quests
- identify the easiest quest to complete
- complete a qualifying action
- claim a reward

Success Criteria:

- at least 80% correctly explain how quest progress works
- at least 75% complete a quest-related task without confusion

### Test 4: Social Sharing and Privacy

Objective:
Validate whether students trust the social layer and understand privacy
controls.

Tasks:

- log one private activity
- share one activity publicly
- react to a peer post
- report a problematic post

Success Criteria:

- users can distinguish private vs public behaviors
- no more than 10% accidentally share something they intended to keep private
- students report that the feed feels more positive than mainstream social apps

### Test 5: Leaderboard Motivation

Objective:
Determine whether leaderboards increase motivation without creating unhealthy
pressure.

Tasks:

- view ranking
- compare daily vs weekly leaderboard
- explain what would motivate them to return tomorrow

Success Criteria:

- students understand how rankings are earned
- at least 60% say rankings increase motivation
- fewer than 20% describe rankings as discouraging or unfair

### Test 6: Admin Moderation Workflow

Objective:
Confirm that operators can triage reports and manage reward or quest policy
without engineering support.

Tasks:

- review a flagged post
- remove unsafe content
- adjust a quest template
- inspect a suspicious reward pattern

Success Criteria:

- admins complete workflow without engineering intervention
- audit trails are visible and understandable

## 7-Day Diary Study

### Goal

Measure real retention signals after initial novelty fades.

### Prompts

- Did you open CampusQuest today
- What did you log
- Did the app change any decision you made today
- Did streaks or quests affect your behavior
- Did the social feed make you feel motivated, neutral, or distracted

### Success Signals

- at least 60% of participants return on 4 or more days
- at least 50% complete one quest during the study
- at least 40% share or react socially during the study

## Instrumentation Needed

- onboarding funnel
- activity log completion funnel
- quest view to completion funnel
- feed creation and interaction funnel
- notification open rate
- streak retention cohorts

## Key Risks to Probe

- students may see logging as too manual
- reward values may feel arbitrary or easy to game
- social validation may feel awkward or low-trust
- privacy settings may be misunderstood
- leaderboards may motivate only high performers

## Decision Gates

Advance to campus pilot only if:

- onboarding success is strong
- the activity to reward loop is consistently understood
- privacy errors are low
- at least one retention mechanic shows credible pull
