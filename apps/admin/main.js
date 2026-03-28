const API_BASE = globalThis.__CAMPUSQUEST_API_BASE__
  || (window.location.port === "3000" || window.location.port === "3002"
    ? "http://localhost:3001"
    : window.location.origin);
const storageKey = "campusquest-admin-token";

const state = {
  token: localStorage.getItem(storageKey) || ""
};

const loginCard = document.getElementById("login-card");
const adminCard = document.getElementById("admin-card");
const loginForm = document.getElementById("admin-login-form");
const loginStatus = document.getElementById("login-status");
const questForm = document.getElementById("quest-form");
const questStatus = document.getElementById("quest-status");
const questTemplates = document.getElementById("quest-templates");
const rewardRules = document.getElementById("reward-rules");
const logoutButton = document.getElementById("admin-logout");
const reportQueue = document.getElementById("report-queue");
const analyticsSummary = document.getElementById("analytics-summary");
const supportForm = document.getElementById("support-form");
const supportResults = document.getElementById("support-results");

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

function setToken(token) {
  state.token = token;
  if (token) {
    localStorage.setItem(storageKey, token);
  } else {
    localStorage.removeItem(storageKey);
  }
}

function setView(isAuthenticated) {
  loginCard.classList.toggle("hidden", isAuthenticated);
  adminCard.classList.toggle("hidden", !isAuthenticated);
}

function renderQuestTemplates(items) {
  questTemplates.innerHTML = "";
  items.forEach((quest) => {
    const node = document.createElement("div");
    node.className = "quest-template";
    node.innerHTML = `
      <strong>${quest.title}</strong>
      <p>${quest.description}</p>
      <span>${quest.recurrence} • ${quest.activityType} • target ${quest.targetCount} • +${quest.rewardXp} XP</span>
    `;
    questTemplates.appendChild(node);
  });
}

function renderRewardRules(items) {
  rewardRules.innerHTML = "";
  items.forEach((rule) => {
    const node = document.createElement("div");
    node.className = "rule-card";
    node.innerHTML = `
      <strong>${rule.activityType}</strong>
      <span>XP: ${rule.xp}</span>
      <p>${Object.entries(rule.stats).map(([key, value]) => `${key} +${value}`).join(" • ")}</p>
      <button type="button" data-rule-id="${rule.id}" data-rule-xp="${rule.xp}">Increase XP by 10</button>
    `;
    rewardRules.appendChild(node);
  });
}

function renderReports(items) {
  reportQueue.innerHTML = "";
  if (items.length === 0) {
    reportQueue.innerHTML = `<div class="report-card"><strong>No open reports</strong><p>The moderation queue is clear.</p></div>`;
    return;
  }

  items.forEach((report) => {
    const node = document.createElement("div");
    node.className = "report-card";
    node.innerHTML = `
      <strong>Report from ${report.reporter?.displayName || "Unknown user"}</strong>
      <p>Reason: ${report.reason}</p>
      <p>Author: ${report.author?.displayName || "Unknown user"}</p>
      <p>Post: ${report.post?.body || "Post unavailable"}</p>
      <button type="button" data-remove-post-id="${report.postId}">Remove post</button>
    `;
    reportQueue.appendChild(node);
  });
}

function renderAnalytics(summary) {
  analyticsSummary.innerHTML = `
    <div class="metrics-grid">
      <div class="metric-card"><strong>Total users</strong><span>${summary.totalUsers}</span></div>
      <div class="metric-card"><strong>Verified users</strong><span>${summary.verifiedUsers}</span></div>
      <div class="metric-card"><strong>Daily active users</strong><span>${summary.dailyActiveUsers}</span></div>
      <div class="metric-card"><strong>Weekly active users</strong><span>${summary.weeklyActiveUsers}</span></div>
      <div class="metric-card"><strong>Total activities</strong><span>${summary.totalActivities}</span></div>
      <div class="metric-card"><strong>Total posts</strong><span>${summary.totalPosts}</span></div>
      <div class="metric-card"><strong>Open reports</strong><span>${summary.openReports}</span></div>
      <div class="metric-card"><strong>Quest completion rate</strong><span>${summary.questCompletionRate}</span></div>
    </div>
  `;
}

function renderSupportResults(users) {
  supportResults.innerHTML = "";
  if (users.length === 0) {
    supportResults.innerHTML = `<div class="support-card"><strong>No matching users</strong></div>`;
    return;
  }
  users.forEach((user) => {
    const node = document.createElement("div");
    node.className = "support-card";
    node.innerHTML = `
      <strong>${user.displayName}</strong>
      <span>${user.email}</span>
      <p>Campus: ${user.campusId || "unverified"} • XP: ${user.totalXp} • Level: ${user.level}</p>
      <p>Recent activities: ${user.recentActivities.map((activity) => activity.activityType).join(", ") || "none"}</p>
    `;
    supportResults.appendChild(node);
  });
}

async function refreshAdminData() {
  const [questPayload, rulePayload, reportPayload, analyticsPayload] = await Promise.all([
    api("/api/admin/quests"),
    api("/api/admin/reward-rules"),
    api("/api/admin/reports"),
    api("/api/admin/analytics")
  ]);
  renderQuestTemplates(questPayload.questTemplates);
  renderRewardRules(rulePayload.rewardRules);
  renderReports(reportPayload.reports);
  renderAnalytics(analyticsPayload.summary);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "Logging in...";
  try {
    const result = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("admin-email").value,
        password: document.getElementById("admin-password").value
      })
    });
    setToken(result.token);
    await refreshAdminData();
    setView(true);
    loginStatus.textContent = "";
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});

questForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  questStatus.textContent = "Creating quest...";

  try {
    await api("/api/admin/quests", {
      method: "POST",
      body: JSON.stringify({
        title: document.getElementById("quest-title").value,
        description: document.getElementById("quest-description").value,
        recurrence: document.getElementById("quest-recurrence").value,
        activityType: document.getElementById("quest-activity-type").value,
        targetCount: document.getElementById("quest-target-count").value,
        rewardXp: document.getElementById("quest-reward-xp").value,
        rewardFocus: document.getElementById("reward-focus").value,
        rewardKnowledge: document.getElementById("reward-knowledge").value,
        rewardStrength: document.getElementById("reward-strength").value,
        rewardSocial: document.getElementById("reward-social").value,
        rewardMomentum: document.getElementById("reward-momentum").value
      })
    });
    questForm.reset();
    document.getElementById("quest-recurrence").value = "daily";
    document.getElementById("quest-activity-type").value = "study";
    document.getElementById("quest-target-count").value = "1";
    document.getElementById("quest-reward-xp").value = "100";
    await refreshAdminData();
    questStatus.textContent = "Quest template created.";
  } catch (error) {
    questStatus.textContent = error.message;
  }
});

logoutButton.addEventListener("click", () => {
  setToken("");
  setView(false);
});

reportQueue.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-remove-post-id]");
  if (!button) {
    return;
  }

  try {
    await api(`/api/admin/feed/posts/${button.dataset.removePostId}/remove`, {
      method: "POST",
      body: JSON.stringify({})
    });
    await refreshAdminData();
  } catch (error) {
    questStatus.textContent = error.message;
  }
});

rewardRules.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-rule-id]");
  if (!button) {
    return;
  }

  try {
    await api(`/api/admin/reward-rules/${button.dataset.ruleId}`, {
      method: "PATCH",
      body: JSON.stringify({
        xp: Number(button.dataset.ruleXp) + 10
      })
    });
    await refreshAdminData();
  } catch (error) {
    questStatus.textContent = error.message;
  }
});

supportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const query = encodeURIComponent(document.getElementById("support-query").value);
    const result = await api(`/api/admin/support/users?q=${query}`);
    renderSupportResults(result.users);
  } catch (error) {
    questStatus.textContent = error.message;
  }
});

async function bootstrap() {
  if (!state.token) {
    setView(false);
    return;
  }

  try {
    await refreshAdminData();
    setView(true);
  } catch {
    setToken("");
    setView(false);
  }
}

bootstrap();
