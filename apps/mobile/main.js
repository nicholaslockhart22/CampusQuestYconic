const API_BASE = globalThis.__CAMPUSQUEST_API_BASE__
  || (window.location.port === "3000" || window.location.port === "3002"
    ? "http://localhost:3001"
    : window.location.origin);
const storageKey = "campusquest-session-token";

const state = {
  mode: "signup",
  token: localStorage.getItem(storageKey) || "",
  user: null,
  campuses: [],
  activityTypes: {}
};

const authPanel = document.getElementById("auth-panel");
const onboardingPanel = document.getElementById("onboarding-panel");
const dashboardPanel = document.getElementById("dashboard-panel");
const authForm = document.getElementById("auth-form");
const verifyForm = document.getElementById("verify-form");
const activityForm = document.getElementById("activity-form");
const modeToggle = document.getElementById("mode-toggle");
const authStatus = document.getElementById("auth-status");
const verifyStatus = document.getElementById("verify-status");
const activityStatus = document.getElementById("activity-status");
const welcomeHeading = document.getElementById("welcome-heading");
const campusList = document.getElementById("campus-list");
const activityTypeSelect = document.getElementById("activityType");
const progressGrid = document.getElementById("progress-grid");
const recentActivities = document.getElementById("recent-activities");
const levelValue = document.getElementById("level-value");
const xpValue = document.getElementById("xp-value");
const campusValue = document.getElementById("campus-value");
const logoutButton = document.getElementById("logout-button");
const streakValue = document.getElementById("streak-value");
const streakStatus = document.getElementById("streak-status");
const streakDate = document.getElementById("streak-date");
const questList = document.getElementById("quest-list");
const feedForm = document.getElementById("feed-form");
const feedStatus = document.getElementById("feed-status");
const feedList = document.getElementById("feed-list");
const feedActivityId = document.getElementById("feed-activity-id");
const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardWindow = document.getElementById("leaderboard-window");
const notificationList = document.getElementById("notification-list");

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function setMode(mode) {
  state.mode = mode;
  modeToggle.textContent = mode === "signup" ? "Switch to login" : "Switch to signup";
  authForm.querySelector("button").textContent = mode === "signup" ? "Create account" : "Login";
  document.getElementById("displayName").parentElement.style.display = mode === "signup" ? "grid" : "none";
}

function setToken(token) {
  state.token = token;
  if (token) {
    localStorage.setItem(storageKey, token);
  } else {
    localStorage.removeItem(storageKey);
  }
}

function showPanel(panel) {
  [authPanel, onboardingPanel, dashboardPanel].forEach((entry) => entry.classList.add("hidden"));
  panel.classList.remove("hidden");
}

function renderCampuses() {
  campusList.innerHTML = "";
  state.campuses.forEach((campus) => {
    const chip = document.createElement("div");
    chip.className = "campus-chip";
    chip.textContent = `${campus.name} (${campus.emailDomains.join(", ")})`;
    campusList.appendChild(chip);
  });
}

function renderActivityTypes() {
  activityTypeSelect.innerHTML = "";
  Object.entries(state.activityTypes).forEach(([value, meta]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${meta.label} (+${meta.xp} XP)`;
    activityTypeSelect.appendChild(option);
  });
}

function renderProgress(progress) {
  state.user = progress.user;
  welcomeHeading.textContent = `Welcome back, ${progress.user.displayName}`;
  levelValue.textContent = String(progress.user.level);
  xpValue.textContent = String(progress.user.totalXp);
  const campus = state.campuses.find((entry) => entry.id === progress.user.campusId);
  campusValue.textContent = campus ? campus.name : "Unverified";
  streakValue.textContent = String(progress.streak?.currentCount || 0);
  streakStatus.textContent = progress.streak?.status || "cold";
  streakDate.textContent = progress.streak?.lastQualifiedDate
    ? `Last qualifying day: ${progress.streak.lastQualifiedDate}`
    : "No qualifying activity yet";

  progressGrid.innerHTML = "";
  Object.entries(progress.user.stats).forEach(([name, value]) => {
    const card = document.createElement("article");
    card.innerHTML = `<span>${name}</span><strong>${value}</strong>`;
    progressGrid.appendChild(card);
  });

  questList.innerHTML = "";
  if (!progress.quests || progress.quests.length === 0) {
    questList.innerHTML = `<div class="quest-card"><span>No quests yet</span><strong>Verify your campus and log an activity to activate quests.</strong></div>`;
  } else {
    progress.quests.forEach((quest) => {
      const progressPercent = Math.min(100, Math.round((quest.progressValue / quest.targetCount) * 100));
      const card = document.createElement("div");
      card.className = "quest-card";
      const action = quest.state === "completed"
        ? `<button class="primary-button claim-button" data-quest-id="${quest.id}" type="button">Claim +${quest.template.rewardXp} XP</button>`
        : quest.state === "claimed"
          ? `<button class="ghost-button" type="button" disabled>Claimed</button>`
          : `<button class="ghost-button" type="button" disabled>In progress</button>`;
      card.innerHTML = `
        <div class="quest-head">
          <div>
            <span>${quest.template.recurrence}</span>
            <h4>${quest.template.title}</h4>
            <p>${quest.template.description}</p>
          </div>
          <strong>${quest.progressValue}/${quest.targetCount}</strong>
        </div>
        <div class="quest-progress"><div class="quest-progress-bar" style="width:${progressPercent}%"></div></div>
        <div class="quest-meta">
          <span>${quest.template.activityType === "any" ? "Any activity counts" : `Track ${quest.template.activityType}`}</span>
          ${action}
        </div>
      `;
      questList.appendChild(card);
    });
  }

  feedActivityId.innerHTML = `<option value="">No linked activity</option>`;
  progress.recentActivities.forEach((activity) => {
    const option = document.createElement("option");
    option.value = activity.id;
    option.textContent = `${state.activityTypes[activity.activityType]?.label || activity.activityType} • ${new Date(activity.createdAt).toLocaleDateString()}`;
    feedActivityId.appendChild(option);
  });

  recentActivities.innerHTML = "";
  if (progress.recentActivities.length === 0) {
    recentActivities.innerHTML = `<div class="recent-card"><span>No activity yet</span><strong>Log your first study session, workout, or campus event.</strong></div>`;
    return;
  }

  progress.recentActivities.forEach((activity) => {
    const meta = state.activityTypes[activity.activityType];
    const card = document.createElement("div");
    card.className = "recent-card";
    card.innerHTML = `
      <span>${new Date(activity.createdAt).toLocaleString()}</span>
      <strong>${meta?.label || activity.activityType}</strong>
      <p>${activity.notes || "No notes provided"}${activity.durationMinutes ? ` • ${activity.durationMinutes} min` : ""}</p>
    `;
    recentActivities.appendChild(card);
  });

  renderFeed(progress.feed || []);
  renderLeaderboards(progress.leaderboards || {});
  renderNotifications(progress.notifications || []);
}

async function claimQuest(userQuestId) {
  const result = await api(`/api/quests/${userQuestId}/claim`, {
    method: "POST",
    body: JSON.stringify({})
  });
  renderProgress(result.progress);
  activityStatus.textContent = `Quest claimed. +${result.rewardEvent.xpDelta} XP granted.`;
}

function renderFeed(posts) {
  feedList.innerHTML = "";
  if (posts.length === 0) {
    feedList.innerHTML = `<div class="feed-card"><span>No campus posts yet</span><strong>Share your first achievement and set the tone.</strong></div>`;
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "feed-card";
    card.innerHTML = `
      <div class="feed-card-head">
        <div>
          <strong>${post.author.displayName}</strong>
          <span>${new Date(post.createdAt).toLocaleString()}</span>
        </div>
        ${post.activity ? `<span>${state.activityTypes[post.activity.activityType]?.label || post.activity.activityType}</span>` : "<span>Campus update</span>"}
      </div>
      <p>${post.body}</p>
      <div class="feed-actions">
        <span>${post.reactionCount} reactions • ${post.validationCount} validations</span>
        <div>
          <button type="button" data-action="react" data-post-id="${post.id}">${post.viewerHasReacted ? "Reacted" : "React"}</button>
          <button type="button" data-action="validate" data-post-id="${post.id}" ${post.viewerHasValidated || post.author.id === state.user.id ? "disabled" : ""}>${post.viewerHasValidated ? "Validated" : "Validate"}</button>
          <button type="button" data-action="report" data-post-id="${post.id}">Report</button>
        </div>
      </div>
    `;
    feedList.appendChild(card);
  });
}

function renderLeaderboards(leaderboards) {
  const key = leaderboardWindow.value === "all_time" ? "allTime" : leaderboardWindow.value;
  const rows = leaderboards[key] || [];
  leaderboardList.innerHTML = "";
  if (rows.length === 0) {
    leaderboardList.innerHTML = `<div class="leaderboard-row"><strong>No rankings yet</strong></div>`;
    return;
  }

  rows.forEach((row) => {
    const node = document.createElement("div");
    node.className = "leaderboard-row";
    node.innerHTML = `
      <strong>#${row.rank} ${row.displayName} <span>Level ${row.level}</span></strong>
      <span>${row.score} XP</span>
    `;
    leaderboardList.appendChild(node);
  });
}

function renderNotifications(items) {
  notificationList.innerHTML = "";
  if (items.length === 0) {
    notificationList.innerHTML = `<div class="notification-card"><strong>No notifications yet</strong><span>Your quest wins, reactions, validations, and streak risks will appear here.</span></div>`;
    return;
  }

  items.forEach((item) => {
    const node = document.createElement("div");
    node.className = `notification-card${item.readAt ? " read" : ""}`;
    node.innerHTML = `
      <strong>${item.title}</strong>
      <p>${item.body}</p>
      <div class="feed-actions">
        <span>${new Date(item.createdAt).toLocaleString()}</span>
        ${item.readAt ? `<button type="button" disabled>Read</button>` : `<button type="button" data-notification-id="${item.id}">Mark read</button>`}
      </div>
    `;
    notificationList.appendChild(node);
  });
}

async function refreshDashboard() {
  const progress = await api("/api/me/progress");
  renderProgress(progress);
  showPanel(dashboardPanel);
}

async function bootstrap() {
  const [campusesPayload, activityMeta] = await Promise.all([
    api("/api/campuses"),
    api("/api/activities/meta")
  ]);

  state.campuses = campusesPayload.campuses;
  state.activityTypes = activityMeta.activityTypes;
  renderCampuses();
  renderActivityTypes();

  if (!state.token) {
    showPanel(authPanel);
    return;
  }

  try {
    const progress = await api("/api/me/progress");
    if (progress.user.schoolVerified) {
      renderProgress(progress);
      showPanel(dashboardPanel);
    } else {
      showPanel(onboardingPanel);
    }
  } catch {
    setToken("");
    showPanel(authPanel);
  }
}

modeToggle.addEventListener("click", () => {
  setMode(state.mode === "signup" ? "login" : "signup");
  authStatus.textContent = "";
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authStatus.textContent = "Submitting...";

  try {
    const form = new FormData(authForm);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
      displayName: form.get("displayName")
    };
    const route = state.mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const result = await api(route, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setToken(result.token);
    authStatus.textContent = "";
    showPanel(result.user.schoolVerified ? dashboardPanel : onboardingPanel);
    if (result.user.schoolVerified) {
      await refreshDashboard();
    }
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

verifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  verifyStatus.textContent = "Verifying...";

  try {
    const form = new FormData(verifyForm);
    await api("/api/auth/verify-school-email", {
      method: "POST",
      body: JSON.stringify({
        schoolEmail: form.get("schoolEmail")
      })
    });
    await refreshDashboard();
    verifyStatus.textContent = "";
    showPanel(dashboardPanel);
  } catch (error) {
    verifyStatus.textContent = error.message;
  }
});

activityForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  activityStatus.textContent = "Logging activity...";

  try {
    const form = new FormData(activityForm);
    const result = await api("/api/activities", {
      method: "POST",
      body: JSON.stringify({
        activityType: form.get("activityType"),
        durationMinutes: Number(form.get("durationMinutes") || 0),
        notes: form.get("notes")
      })
    });
    renderProgress(result.progress);
    activityStatus.textContent = `Activity logged. +${result.rewardEvent.xpDelta} XP granted.`;
    activityForm.reset();
    renderActivityTypes();
  } catch (error) {
    activityStatus.textContent = error.message;
  }
});

questList.addEventListener("click", async (event) => {
  const button = event.target.closest(".claim-button");
  if (!button) {
    return;
  }
  activityStatus.textContent = "Claiming quest reward...";
  try {
    await claimQuest(button.dataset.questId);
  } catch (error) {
    activityStatus.textContent = error.message;
  }
});

feedForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedStatus.textContent = "Posting to campus feed...";
  try {
    const result = await api("/api/feed/posts", {
      method: "POST",
      body: JSON.stringify({
        body: document.getElementById("feed-body").value,
        activityId: feedActivityId.value
      })
    });
    document.getElementById("feed-body").value = "";
    feedActivityId.value = "";
    renderFeed(result.feed);
    feedStatus.textContent = "Post published.";
  } catch (error) {
    feedStatus.textContent = error.message;
  }
});

feedList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const postId = button.dataset.postId;
  const action = button.dataset.action;

  try {
    if (action === "react") {
      const result = await api(`/api/feed/posts/${postId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ type: "fire" })
      });
      renderFeed(result.feed);
      return;
    }

    if (action === "validate") {
      const result = await api(`/api/feed/posts/${postId}/validations`, {
        method: "POST",
        body: JSON.stringify({})
      });
      renderFeed(result.feed);
      return;
    }

    if (action === "report") {
      await api(`/api/feed/posts/${postId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: "Needs moderation" })
      });
      feedStatus.textContent = "Post reported for moderation.";
    }
  } catch (error) {
    feedStatus.textContent = error.message;
  }
});

leaderboardWindow.addEventListener("change", () => {
  refreshDashboard().catch(() => {
    // Keep current UI if refresh fails.
  });
});

notificationList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-notification-id]");
  if (!button) {
    return;
  }
  try {
    await api(`/api/notifications/${button.dataset.notificationId}/read`, {
      method: "POST",
      body: JSON.stringify({})
    });
    await refreshDashboard();
  } catch (error) {
    feedStatus.textContent = error.message;
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore logout transport errors and clear the local session anyway.
  }
  setToken("");
  showPanel(authPanel);
});

setMode("signup");
bootstrap();
