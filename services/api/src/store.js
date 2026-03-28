import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID, createHash } from "node:crypto";
import { campuses as canonicalCampuses, defaultStats, activityTypes } from "../../../packages/contracts/src/index.js";
import { applyActivityReward, applyDirectReward } from "./rewards.js";

const dataDir = new URL("../data/", import.meta.url);
const defaultDbPath = new URL("./db.json", dataDir);

function now() {
  return new Date().toISOString();
}

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function mergeCampusesWithCanonical(persisted) {
  const canonical = canonicalCampuses.map((campus) => ({
    ...campus,
    emailDomains: [...campus.emailDomains]
  }));
  const canonicalIds = new Set(canonical.map((campus) => campus.id));
  const extras = (persisted || [])
    .filter((campus) => !canonicalIds.has(campus.id))
    .map((campus) => ({
      ...campus,
      emailDomains: [...campus.emailDomains]
    }));
  return [...canonical, ...extras];
}

function resolveCampusByEmail(email, campusList) {
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  const at = normalized.lastIndexOf("@");
  if (at === -1 || at === normalized.length - 1) {
    return null;
  }
  const domain = normalized.slice(at + 1);
  return campusList.find((campus) => campus.emailDomains.includes(domain)) ?? null;
}

function startOfDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addDays(dayString, offset) {
  const date = new Date(`${dayString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return startOfDay(date);
}

function startOfWeek(date = new Date()) {
  const day = new Date(`${startOfDay(date)}T00:00:00.000Z`);
  const weekday = day.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  day.setUTCDate(day.getUTCDate() + diff);
  return startOfDay(day);
}

function defaultRewardRules() {
  return Object.entries(activityTypes).map(([activityType, meta]) => ({
    id: `reward-${activityType}`,
    activityType,
    xp: meta.xp,
    stats: meta.stats
  }));
}

function defaultQuestTemplates() {
  return [
    {
      id: "quest-daily-study",
      title: "Daily Deep Work",
      description: "Complete one study session today.",
      recurrence: "daily",
      activityType: "study",
      targetCount: 1,
      rewardXp: 60,
      rewardStats: { focus: 4, knowledge: 3 },
      status: "active",
      campusId: null
    },
    {
      id: "quest-daily-campus",
      title: "Show Up on Campus",
      description: "Attend an event or club activity today.",
      recurrence: "daily",
      activityType: "event",
      targetCount: 1,
      rewardXp: 50,
      rewardStats: { social: 4, momentum: 3 },
      status: "active",
      campusId: null
    },
    {
      id: "quest-weekly-balance",
      title: "Balanced Builder",
      description: "Complete any three logged activities this week.",
      recurrence: "weekly",
      activityType: "any",
      targetCount: 3,
      rewardXp: 180,
      rewardStats: { momentum: 8, focus: 3, social: 3 },
      status: "active",
      campusId: null
    }
  ];
}

function defaultAdminUsers() {
  return [
    {
      id: "admin-1",
      email: "admin@campusquest.local",
      passwordHash: hashPassword("admin123"),
      name: "CampusQuest Admin"
    }
  ];
}

function normalizeState(state) {
  return {
    users: state.users || [],
    sessions: state.sessions || [],
    adminSessions: state.adminSessions || [],
    activities: state.activities || [],
    rewardEvents: state.rewardEvents || [],
    analytics: state.analytics || [],
    campuses: mergeCampusesWithCanonical(state.campuses),
    questTemplates: state.questTemplates || defaultQuestTemplates(),
    userQuests: state.userQuests || [],
    streakStates: state.streakStates || [],
    rewardRules: state.rewardRules || defaultRewardRules(),
    adminUsers: state.adminUsers || defaultAdminUsers(),
    feedPosts: state.feedPosts || [],
    reports: state.reports || [],
    notifications: state.notifications || []
  };
}

function createInitialState() {
  return normalizeState({});
}

export class CampusQuestStore {
  constructor(fileUrl = defaultDbPath) {
    this.fileUrl = fileUrl;
    this.state = this.#load();
  }

  #load() {
    mkdirSync(dataDir, { recursive: true });
    if (!existsSync(this.fileUrl)) {
      const initial = createInitialState();
      writeFileSync(this.fileUrl, JSON.stringify(initial, null, 2));
      return initial;
    }
    return normalizeState(JSON.parse(readFileSync(this.fileUrl, "utf8")));
  }

  #save() {
    writeFileSync(this.fileUrl, JSON.stringify(this.state, null, 2));
  }

  listCampuses() {
    return this.state.campuses;
  }

  listRewardRules() {
    return this.state.rewardRules;
  }

  updateRewardRule(ruleId, patch) {
    const rule = this.state.rewardRules.find((entry) => entry.id === ruleId);
    if (!rule) {
      throw new Error("Reward rule not found.");
    }
    if (patch.xp !== undefined) {
      rule.xp = Number(patch.xp);
    }
    if (patch.stats) {
      rule.stats = {
        ...defaultStats,
        ...patch.stats
      };
    }
    this.#save();
    return rule;
  }

  listQuestTemplates() {
    return [...this.state.questTemplates].sort((left, right) => left.title.localeCompare(right.title));
  }

  listReports() {
    return this.state.reports
      .filter((report) => report.state === "open")
      .map((report) => {
        const post = this.state.feedPosts.find((entry) => entry.id === report.postId);
        const reporter = this.state.users.find((entry) => entry.id === report.reporterUserId);
        const author = post ? this.state.users.find((entry) => entry.id === post.userId) : null;
        return {
          ...report,
          post,
          reporter: reporter ? this.sanitizeUser(reporter) : null,
          author: author ? this.sanitizeUser(author) : null
        };
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  getAnalyticsSummary() {
    const nowDate = Date.now();
    const dayAgo = nowDate - 24 * 60 * 60 * 1000;
    const weekAgo = nowDate - 7 * 24 * 60 * 60 * 1000;
    const daily = new Set();
    const weekly = new Set();

    for (const activity of this.state.activities) {
      const ts = new Date(activity.createdAt).getTime();
      if (ts >= dayAgo) {
        daily.add(activity.userId);
      }
      if (ts >= weekAgo) {
        weekly.add(activity.userId);
      }
    }

    const completedQuests = this.state.userQuests.filter((entry) => entry.completedAt).length;
    return {
      totalUsers: this.state.users.length,
      verifiedUsers: this.state.users.filter((entry) => entry.schoolVerified).length,
      totalActivities: this.state.activities.length,
      totalPosts: this.state.feedPosts.filter((entry) => entry.state === "active").length,
      openReports: this.state.reports.filter((entry) => entry.state === "open").length,
      dailyActiveUsers: daily.size,
      weeklyActiveUsers: weekly.size,
      questCompletionRate: this.state.userQuests.length === 0 ? 0 : Number((completedQuests / this.state.userQuests.length).toFixed(2))
    };
  }

  lookupUsers(query = "") {
    const normalized = String(query).trim().toLowerCase();
    return this.state.users
      .filter((user) => {
        if (!normalized) {
          return true;
        }
        return user.email.includes(normalized) || user.displayName.toLowerCase().includes(normalized);
      })
      .slice(0, 20)
      .map((user) => ({
        ...this.sanitizeUser(user),
        recentActivities: this.listActivities(user.id).slice(0, 5)
      }));
  }

  createNotification(userId, type, title, body, dedupeKey = "") {
    if (dedupeKey && this.state.notifications.some((entry) => entry.userId === userId && entry.dedupeKey === dedupeKey)) {
      return null;
    }
    const notification = {
      id: randomUUID(),
      userId,
      type,
      title,
      body,
      dedupeKey,
      createdAt: now(),
      readAt: ""
    };
    this.state.notifications.unshift(notification);
    return notification;
  }

  ensureStreakRiskNotification(userId) {
    const streak = this.getUserStreak(userId);
    if (streak.status !== "at-risk") {
      return;
    }
    const created = this.createNotification(
      userId,
      "streak_risk",
      "Your streak is at risk",
      "Log one activity today to preserve your daily streak.",
      `streak-risk:${userId}:${startOfDay()}`
    );
    if (created) {
      this.#save();
    }
  }

  listNotifications(userId) {
    this.ensureStreakRiskNotification(userId);
    return this.state.notifications
      .filter((entry) => entry.userId === userId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  markNotificationRead(userId, notificationId) {
    const notification = this.state.notifications.find((entry) => entry.id === notificationId && entry.userId === userId);
    if (!notification) {
      throw new Error("Notification not found.");
    }
    notification.readAt = now();
    this.#save();
    return notification;
  }

  signup({ email, password, displayName }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.state.users.some((user) => user.email === normalizedEmail)) {
      throw new Error("An account with that email already exists.");
    }

    const user = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      displayName: displayName?.trim() || "New Player",
      avatarUrl: "",
      bio: "",
      schoolEmail: "",
      campusId: "",
      schoolVerified: false,
      totalXp: 0,
      level: 1,
      stats: { ...defaultStats },
      createdAt: now(),
      updatedAt: now()
    };

    this.state.users.push(user);
    this.#save();
    return this.createSession(user.id);
  }

  login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.state.users.find((candidate) => candidate.email === normalizedEmail);
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error("Invalid credentials.");
    }
    return this.createSession(user.id);
  }

  adminLogin({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const admin = this.state.adminUsers.find((candidate) => candidate.email === normalizedEmail);
    if (!admin || admin.passwordHash !== hashPassword(password)) {
      throw new Error("Invalid admin credentials.");
    }

    const session = {
      token: randomUUID(),
      adminId: admin.id,
      createdAt: now()
    };
    this.state.adminSessions.push(session);
    this.#save();

    return {
      token: session.token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    };
  }

  createSession(userId) {
    const session = {
      token: randomUUID(),
      userId,
      createdAt: now()
    };
    this.state.sessions.push(session);
    this.#save();
    return {
      token: session.token,
      user: this.sanitizeUser(this.requireUser(userId))
    };
  }

  logout(token) {
    this.state.sessions = this.state.sessions.filter((session) => session.token !== token);
    this.#save();
  }

  sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      schoolEmail: user.schoolEmail,
      campusId: user.campusId,
      schoolVerified: user.schoolVerified,
      totalXp: user.totalXp,
      level: user.level,
      stats: user.stats,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  getUserByToken(token) {
    const session = this.state.sessions.find((entry) => entry.token === token);
    if (!session) {
      return null;
    }
    return this.requireUser(session.userId);
  }

  getAdminByToken(token) {
    const session = this.state.adminSessions.find((entry) => entry.token === token);
    if (!session) {
      return null;
    }
    return this.state.adminUsers.find((entry) => entry.id === session.adminId) || null;
  }

  requireUser(userId) {
    const user = this.state.users.find((entry) => entry.id === userId);
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  }

  updateProfile(userId, patch) {
    const user = this.requireUser(userId);
    if (typeof patch.displayName === "string") {
      user.displayName = patch.displayName.trim();
    }
    if (typeof patch.bio === "string") {
      user.bio = patch.bio.trim();
    }
    if (typeof patch.avatarUrl === "string") {
      user.avatarUrl = patch.avatarUrl.trim();
    }
    if (typeof patch.campusId === "string") {
      user.campusId = patch.campusId;
    }
    user.updatedAt = now();
    this.#save();
    return this.sanitizeUser(user);
  }

  verifySchoolEmail(userId, schoolEmail) {
    const user = this.requireUser(userId);
    const campus = resolveCampusByEmail(schoolEmail, this.state.campuses);
    if (!campus) {
      throw new Error("That school email domain is not supported yet.");
    }

    user.schoolEmail = schoolEmail.trim().toLowerCase();
    user.schoolVerified = true;
    user.campusId = campus.id;
    user.updatedAt = now();
    this.ensureUserQuests(user.id);
    this.#save();

    return {
      user: this.sanitizeUser(user),
      campus
    };
  }

  createActivity(userId, payload) {
    const user = this.requireUser(userId);
    const duplicateWindowMs = 60 * 1000;
    const normalizedType = payload.activityType;
    const submittedAt = payload.timestamp ? new Date(payload.timestamp) : new Date();

    const duplicate = this.state.activities.find((activity) => {
      return activity.userId === userId &&
        activity.activityType === normalizedType &&
        Math.abs(new Date(activity.createdAt).getTime() - submittedAt.getTime()) < duplicateWindowMs;
    });

    if (duplicate) {
      throw new Error("That activity was already logged recently.");
    }

    const configuredRule = this.state.rewardRules.find((entry) => entry.activityType === normalizedType);
    const reward = configuredRule
      ? applyDirectReward(user, { xp: configuredRule.xp, stats: configuredRule.stats })
      : applyActivityReward(user, normalizedType);
    user.totalXp = reward.totalXp;
    user.level = reward.level;
    user.stats = reward.stats;
    user.updatedAt = now();

    const activity = {
      id: randomUUID(),
      userId,
      campusId: user.campusId,
      activityType: normalizedType,
      durationMinutes: Number(payload.durationMinutes || 0),
      notes: payload.notes?.trim() || "",
      createdAt: submittedAt.toISOString()
    };

    const rewardEvent = {
      id: randomUUID(),
      userId,
      sourceType: "activity",
      sourceId: activity.id,
      xpDelta: reward.xpDelta,
      statDelta: reward.statDelta,
      createdAt: now()
    };

    this.state.activities.unshift(activity);
    this.state.rewardEvents.unshift(rewardEvent);
    this.updateDailyStreak(userId, submittedAt);
    this.updateQuestProgress(userId, activity, submittedAt);
    this.#save();

    return {
      activity,
      rewardEvent,
      progress: this.getProgress(userId)
    };
  }

  listActivities(userId) {
    return this.state.activities.filter((activity) => activity.userId === userId);
  }

  listCampusFeed(userId) {
    const user = this.requireUser(userId);
    return this.state.feedPosts
      .filter((post) => post.campusId === user.campusId && post.state === "active")
      .map((post) => {
        const author = this.requireUser(post.userId);
        const activity = post.activityId
          ? this.state.activities.find((entry) => entry.id === post.activityId) || null
          : null;
        return {
          ...post,
          author: this.sanitizeUser(author),
          activity,
          reactionCount: post.reactions.length,
          validationCount: post.validations.length,
          viewerHasReacted: post.reactions.some((reaction) => reaction.userId === userId),
          viewerHasValidated: post.validations.some((validation) => validation.userId === userId)
        };
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  createFeedPost(userId, payload) {
    const user = this.requireUser(userId);
    if (!user.campusId) {
      throw new Error("Verify your campus before posting.");
    }

    let activityId = payload.activityId || "";
    if (activityId) {
      const activity = this.state.activities.find((entry) => entry.id === activityId && entry.userId === userId);
      if (!activity) {
        throw new Error("Selected activity is invalid.");
      }
    } else {
      activityId = "";
    }

    const body = String(payload.body || "").trim();
    if (!body) {
      throw new Error("Post body is required.");
    }

    const post = {
      id: randomUUID(),
      userId,
      campusId: user.campusId,
      body,
      activityId,
      reactions: [],
      validations: [],
      reports: [],
      state: "active",
      createdAt: now()
    };
    this.state.feedPosts.unshift(post);
    this.#save();
    return post;
  }

  reactToPost(userId, postId, type = "fire") {
    const post = this.state.feedPosts.find((entry) => entry.id === postId && entry.state === "active");
    if (!post) {
      throw new Error("Post not found.");
    }

    const existing = post.reactions.find((reaction) => reaction.userId === userId);
    if (existing) {
      existing.type = type;
      existing.updatedAt = now();
    } else {
      post.reactions.push({
        id: randomUUID(),
        userId,
        type,
        createdAt: now(),
        updatedAt: now()
      });
      if (post.userId !== userId) {
        this.createNotification(
          post.userId,
          "post_reacted",
          "Someone reacted to your post",
          "A campus peer reacted to your achievement.",
          `react:${post.id}:${userId}`
        );
      }
    }
    this.#save();
    return this.listCampusFeed(userId).find((entry) => entry.id === postId);
  }

  validatePost(userId, postId) {
    const post = this.state.feedPosts.find((entry) => entry.id === postId && entry.state === "active");
    if (!post) {
      throw new Error("Post not found.");
    }
    if (post.userId === userId) {
      throw new Error("You cannot validate your own post.");
    }
    if (post.validations.some((validation) => validation.userId === userId)) {
      throw new Error("You already validated this post.");
    }

    post.validations.push({
      id: randomUUID(),
      userId,
      createdAt: now()
    });
    this.createNotification(
      post.userId,
      "post_validated",
      "Your post was validated",
      "A campus peer validated your achievement.",
      `validate:${post.id}:${userId}`
    );
    this.#save();
    return this.listCampusFeed(userId).find((entry) => entry.id === postId);
  }

  reportPost(userId, postId, reason) {
    const post = this.state.feedPosts.find((entry) => entry.id === postId && entry.state === "active");
    if (!post) {
      throw new Error("Post not found.");
    }

    const existing = this.state.reports.find((report) => report.postId === postId && report.reporterUserId === userId && report.state === "open");
    if (existing) {
      throw new Error("You already reported this post.");
    }

    const report = {
      id: randomUUID(),
      postId,
      reporterUserId: userId,
      reason: String(reason || "Needs moderation").trim(),
      state: "open",
      createdAt: now()
    };
    this.state.reports.unshift(report);
    post.reports.push(report.id);
    this.#save();
    return report;
  }

  removeFeedPost(postId) {
    const post = this.state.feedPosts.find((entry) => entry.id === postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    post.state = "removed";
    for (const report of this.state.reports.filter((entry) => entry.postId === postId && entry.state === "open")) {
      report.state = "resolved";
      report.resolvedAt = now();
    }
    this.#save();
    return post;
  }

  getLeaderboard(userId, window = "all_time") {
    const user = this.requireUser(userId);
    const campusUsers = this.state.users.filter((entry) => entry.campusId === user.campusId);
    const startDate = window === "daily"
      ? `${startOfDay()}T00:00:00.000Z`
      : window === "weekly"
        ? `${startOfWeek()}T00:00:00.000Z`
        : "";

    const rows = campusUsers.map((candidate) => {
      let score = candidate.totalXp;
      if (window !== "all_time") {
        score = this.state.rewardEvents
          .filter((event) =>
            event.userId === candidate.id &&
            new Date(event.createdAt).getTime() >= new Date(startDate).getTime()
          )
          .reduce((sum, event) => sum + event.xpDelta, 0);
      }
      return {
        userId: candidate.id,
        displayName: candidate.displayName,
        level: candidate.level,
        score
      };
    });

    return rows
      .sort((left, right) => right.score - left.score || left.displayName.localeCompare(right.displayName))
      .map((row, index) => ({
        ...row,
        rank: index + 1
      }));
  }

  getUserStreak(userId) {
    const streak = this.state.streakStates.find((entry) => entry.userId === userId && entry.streakType === "daily_activity");
    if (!streak) {
      return {
        streakType: "daily_activity",
        currentCount: 0,
        lastQualifiedDate: "",
        status: "cold"
      };
    }

    const today = startOfDay();
    let status = "cold";
    if (streak.lastQualifiedDate === today) {
      status = "active";
    } else if (streak.lastQualifiedDate === addDays(today, -1)) {
      status = "at-risk";
    }

    return {
      streakType: streak.streakType,
      currentCount: streak.currentCount,
      lastQualifiedDate: streak.lastQualifiedDate,
      status
    };
  }

  updateDailyStreak(userId, activityDate = new Date()) {
    const qualifyingDate = startOfDay(activityDate);
    let streak = this.state.streakStates.find((entry) => entry.userId === userId && entry.streakType === "daily_activity");
    if (!streak) {
      streak = {
        id: randomUUID(),
        userId,
        streakType: "daily_activity",
        currentCount: 0,
        lastQualifiedDate: "",
        updatedAt: now()
      };
      this.state.streakStates.push(streak);
    }

    if (streak.lastQualifiedDate === qualifyingDate) {
      streak.updatedAt = now();
      return streak;
    }

    if (streak.lastQualifiedDate === addDays(qualifyingDate, -1)) {
      streak.currentCount += 1;
    } else {
      streak.currentCount = 1;
    }

    streak.lastQualifiedDate = qualifyingDate;
    streak.updatedAt = now();
    return streak;
  }

  getQuestPeriodKey(recurrence, referenceDate = new Date()) {
    if (recurrence === "weekly") {
      return `week:${startOfWeek(referenceDate)}`;
    }
    return `day:${startOfDay(referenceDate)}`;
  }

  ensureUserQuests(userId, referenceDate = new Date()) {
    const user = this.requireUser(userId);
    if (!user.campusId) {
      return [];
    }

    const activeTemplates = this.state.questTemplates.filter((template) => {
      return template.status === "active" &&
        (!template.campusId || template.campusId === user.campusId);
    });

    const created = [];
    for (const template of activeTemplates) {
      const periodKey = this.getQuestPeriodKey(template.recurrence, referenceDate);
      const existing = this.state.userQuests.find((entry) =>
        entry.userId === userId &&
        entry.questTemplateId === template.id &&
        entry.periodKey === periodKey
      );

      if (!existing) {
        const quest = {
          id: randomUUID(),
          userId,
          questTemplateId: template.id,
          periodKey,
          progressValue: 0,
          targetCount: template.targetCount,
          state: "active",
          completedAt: "",
          claimedAt: "",
          createdAt: now(),
          updatedAt: now()
        };
        this.state.userQuests.push(quest);
        created.push(quest);
      }
    }
    return created;
  }

  updateQuestProgress(userId, activity, referenceDate = new Date()) {
    this.ensureUserQuests(userId, referenceDate);

    const activityDay = startOfDay(referenceDate);
    const weekKey = `week:${startOfWeek(referenceDate)}`;
    const dayKey = `day:${activityDay}`;
    const userQuests = this.state.userQuests.filter((entry) =>
      entry.userId === userId &&
      entry.state === "active" &&
      (entry.periodKey === dayKey || entry.periodKey === weekKey)
    );

    for (const userQuest of userQuests) {
      const template = this.state.questTemplates.find((entry) => entry.id === userQuest.questTemplateId);
      if (!template) {
        continue;
      }

      const matchesType = template.activityType === "any" || template.activityType === activity.activityType;
      if (!matchesType) {
        continue;
      }

      userQuest.progressValue += 1;
      userQuest.updatedAt = now();
      if (userQuest.progressValue >= userQuest.targetCount) {
        userQuest.progressValue = userQuest.targetCount;
        userQuest.state = "completed";
        userQuest.completedAt = now();
        this.createNotification(
          userId,
          "quest_completed",
          `Quest complete: ${template.title}`,
          `Claim ${template.rewardXp} XP from your ${template.recurrence} quest.`,
          `quest-complete:${userQuest.id}`
        );
      }
    }
  }

  listUserQuests(userId, referenceDate = new Date()) {
    const created = this.ensureUserQuests(userId, referenceDate);
    if (created.length > 0) {
      this.#save();
    }
    const activePeriodKeys = [
      `day:${startOfDay(referenceDate)}`,
      `week:${startOfWeek(referenceDate)}`
    ];

    return this.state.userQuests
      .filter((entry) => entry.userId === userId && activePeriodKeys.includes(entry.periodKey))
      .map((entry) => {
        const template = this.state.questTemplates.find((templateEntry) => templateEntry.id === entry.questTemplateId);
        return {
          ...entry,
          template
        };
      })
      .sort((left, right) => left.template.recurrence.localeCompare(right.template.recurrence));
  }

  claimQuest(userId, userQuestId) {
    const user = this.requireUser(userId);
    const userQuest = this.state.userQuests.find((entry) => entry.id === userQuestId && entry.userId === userId);
    if (!userQuest) {
      throw new Error("Quest not found.");
    }
    if (userQuest.state !== "completed") {
      throw new Error("Quest is not ready to claim.");
    }
    if (userQuest.claimedAt) {
      throw new Error("Quest reward already claimed.");
    }

    const template = this.state.questTemplates.find((entry) => entry.id === userQuest.questTemplateId);
    if (!template) {
      throw new Error("Quest template not found.");
    }

    const reward = applyDirectReward(user, {
      xp: template.rewardXp,
      stats: template.rewardStats
    });

    user.totalXp = reward.totalXp;
    user.level = reward.level;
    user.stats = reward.stats;
    user.updatedAt = now();
    userQuest.state = "claimed";
    userQuest.claimedAt = now();
    userQuest.updatedAt = now();

    const rewardEvent = {
      id: randomUUID(),
      userId,
      sourceType: "quest",
      sourceId: userQuest.id,
      xpDelta: reward.xpDelta,
      statDelta: reward.statDelta,
      createdAt: now()
    };
    this.state.rewardEvents.unshift(rewardEvent);
    this.createNotification(
      userId,
      "quest_claimed",
      `Quest claimed: ${template.title}`,
      `You received ${reward.xpDelta} XP.`,
      `quest-claimed:${userQuest.id}`
    );
    this.#save();

    return {
      userQuest: {
        ...userQuest,
        template
      },
      rewardEvent,
      progress: this.getProgress(userId)
    };
  }

  createQuestTemplate(payload) {
    const template = {
      id: randomUUID(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      recurrence: payload.recurrence,
      activityType: payload.activityType,
      targetCount: Number(payload.targetCount),
      rewardXp: Number(payload.rewardXp),
      rewardStats: {
        focus: Number(payload.rewardFocus || 0),
        knowledge: Number(payload.rewardKnowledge || 0),
        strength: Number(payload.rewardStrength || 0),
        social: Number(payload.rewardSocial || 0),
        momentum: Number(payload.rewardMomentum || 0)
      },
      status: payload.status || "active",
      campusId: payload.campusId || null
    };
    this.state.questTemplates.push(template);
    this.#save();
    return template;
  }

  updateQuestTemplate(templateId, patch) {
    const template = this.state.questTemplates.find((entry) => entry.id === templateId);
    if (!template) {
      throw new Error("Quest template not found.");
    }

    const fields = ["title", "description", "recurrence", "activityType", "status", "campusId"];
    for (const field of fields) {
      if (patch[field] !== undefined) {
        template[field] = patch[field];
      }
    }
    if (patch.targetCount !== undefined) {
      template.targetCount = Number(patch.targetCount);
    }
    if (patch.rewardXp !== undefined) {
      template.rewardXp = Number(patch.rewardXp);
    }
    if (patch.rewardStats) {
      template.rewardStats = {
        ...defaultStats,
        ...patch.rewardStats
      };
    }
    this.#save();
    return template;
  }

  getProgress(userId) {
    const user = this.requireUser(userId);
    const recentActivities = this.listActivities(userId).slice(0, 5);
    const quests = this.listUserQuests(userId);
    const streak = this.getUserStreak(userId);
    const feed = this.listCampusFeed(userId).slice(0, 10);
    const leaderboards = {
      daily: this.getLeaderboard(userId, "daily").slice(0, 5),
      weekly: this.getLeaderboard(userId, "weekly").slice(0, 5),
      allTime: this.getLeaderboard(userId, "all_time").slice(0, 5)
    };
    const notifications = this.listNotifications(userId).slice(0, 10);
    return {
      user: this.sanitizeUser(user),
      recentActivities,
      streak,
      quests,
      feed,
      leaderboards,
      notifications
    };
  }

  appendAnalytics(event) {
    this.state.analytics.unshift(event);
    this.#save();
  }
}

export function createStore(fileUrl) {
  return new CampusQuestStore(fileUrl);
}
