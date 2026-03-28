import test from "node:test";
import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { createStore } from "../src/store.js";

const testDb = new URL("../data/test-db.json", import.meta.url);

test.afterEach(() => {
  rmSync(testDb, { force: true });
});

test("signup, school verification, and activity logging produce progress", () => {
  const store = createStore(testDb);

  const session = store.signup({
    email: "ava@example.com",
    password: "secret123",
    displayName: "Ava"
  });

  const verifyResult = store.verifySchoolEmail(session.user.id, "ava@nyu.edu");
  assert.equal(verifyResult.campus.slug, "nyu");

  const created = store.createActivity(session.user.id, {
    activityType: "study",
    durationMinutes: 90,
    notes: "Library deep work"
  });

  assert.equal(created.rewardEvent.xpDelta, 120);
  assert.equal(created.progress.user.totalXp, 120);
  assert.equal(created.progress.user.stats.knowledge, 10);
  assert.equal(store.listActivities(session.user.id).length, 1);
});

test("school verification accepts uri.edu when persisted db has stale campuses list", () => {
  writeFileSync(
    testDb,
    JSON.stringify({
      campuses: [
        {
          id: "campus-nyu",
          name: "New York University",
          slug: "nyu",
          emailDomains: ["nyu.edu"]
        }
      ]
    })
  );

  const store = createStore(testDb);
  assert.ok(store.listCampuses().some((campus) => campus.slug === "uri"));

  const session = store.signup({
    email: "rhody@example.com",
    password: "secret123",
    displayName: "Rhody"
  });

  const verifyResult = store.verifySchoolEmail(session.user.id, "nicklockhart22@uri.edu");
  assert.equal(verifyResult.campus.slug, "uri");
});

test("activity logging updates streaks and quest progress, then allows claim", () => {
  const store = createStore(testDb);

  const session = store.signup({
    email: "quester@example.com",
    password: "secret123",
    displayName: "Quester"
  });

  store.verifySchoolEmail(session.user.id, "quester@nyu.edu");

  const created = store.createActivity(session.user.id, {
    activityType: "study",
    durationMinutes: 60,
    notes: "Daily quest run",
    timestamp: "2026-03-28T14:00:00.000Z"
  });

  assert.equal(created.progress.streak.currentCount, 1);
  assert.equal(created.progress.streak.status, "active");

  const dailyQuest = created.progress.quests.find((quest) => quest.template.id === "quest-daily-study");
  assert.ok(dailyQuest);
  assert.equal(dailyQuest.state, "completed");

  const claimed = store.claimQuest(session.user.id, dailyQuest.id);
  assert.equal(claimed.rewardEvent.xpDelta, 60);
  assert.equal(claimed.progress.user.totalXp, 180);

  const nextDay = store.createActivity(session.user.id, {
    activityType: "workout",
    durationMinutes: 45,
    notes: "Second day streak",
    timestamp: "2026-03-29T14:00:00.000Z"
  });

  assert.equal(nextDay.progress.streak.currentCount, 2);
});

test("feed, reaction, validation, reporting, moderation, and leaderboard flows work", () => {
  const store = createStore(testDb);

  const authorSession = store.signup({
    email: "author@example.com",
    password: "secret123",
    displayName: "Author"
  });
  const peerSession = store.signup({
    email: "peer@example.com",
    password: "secret123",
    displayName: "Peer"
  });

  store.verifySchoolEmail(authorSession.user.id, "author@nyu.edu");
  store.verifySchoolEmail(peerSession.user.id, "peer@nyu.edu");

  const authorActivity = store.createActivity(authorSession.user.id, {
    activityType: "study",
    durationMinutes: 80,
    notes: "Ready to post",
    timestamp: "2026-03-28T12:00:00.000Z"
  });

  store.createActivity(peerSession.user.id, {
    activityType: "workout",
    durationMinutes: 45,
    notes: "Leaderboard competitor",
    timestamp: "2026-03-28T13:00:00.000Z"
  });

  const post = store.createFeedPost(authorSession.user.id, {
    body: "Locked in at the library today.",
    activityId: authorActivity.activity.id
  });

  const reacted = store.reactToPost(peerSession.user.id, post.id, "fire");
  assert.equal(reacted.reactionCount, 1);

  const validated = store.validatePost(peerSession.user.id, post.id);
  assert.equal(validated.validationCount, 1);

  const report = store.reportPost(peerSession.user.id, post.id, "Spam check");
  assert.equal(report.state, "open");
  assert.equal(store.listReports().length, 1);

  store.removeFeedPost(post.id);
  assert.equal(store.listReports().length, 0);

  const leaderboard = store.getLeaderboard(authorSession.user.id, "daily");
  assert.equal(leaderboard[0].displayName, "Author");
  assert.equal(leaderboard[0].score, 120);
});

test("reward rule updates, notifications, analytics, and support lookup work", () => {
  const store = createStore(testDb);

  const session = store.signup({
    email: "ops@example.com",
    password: "secret123",
    displayName: "Ops User"
  });

  store.verifySchoolEmail(session.user.id, "ops@nyu.edu");
  store.updateRewardRule("reward-study", {
    xp: 150,
    stats: {
      focus: 9,
      knowledge: 12,
      momentum: 5
    }
  });

  const created = store.createActivity(session.user.id, {
    activityType: "study",
    durationMinutes: 100,
    notes: "Reward rule verification",
    timestamp: "2026-03-28T15:00:00.000Z"
  });

  assert.equal(created.rewardEvent.xpDelta, 150);
  assert.equal(created.progress.user.totalXp, 150);

  const quest = created.progress.quests.find((entry) => entry.template.id === "quest-daily-study");
  store.claimQuest(session.user.id, quest.id);

  const notifications = store.listNotifications(session.user.id);
  assert.ok(notifications.some((entry) => entry.type === "quest_completed"));
  assert.ok(notifications.some((entry) => entry.type === "quest_claimed"));

  const analytics = store.getAnalyticsSummary();
  assert.equal(analytics.totalUsers, 1);
  assert.equal(analytics.totalActivities, 1);

  const support = store.lookupUsers("ops");
  assert.equal(support.length, 1);
  assert.equal(support[0].recentActivities.length, 1);
});
