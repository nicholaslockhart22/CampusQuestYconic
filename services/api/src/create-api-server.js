import { createServer } from "node:http";
import { createStore } from "./store.js";
import { activityTypes } from "../../../packages/contracts/src/index.js";
import { analyticsEvents, trackEvent } from "../../../packages/analytics/src/index.js";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS"
  });
  response.end(JSON.stringify(payload));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

function getToken(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return "";
  }
  return header.slice("Bearer ".length);
}

export function createApiHandler({ store, logRequests = true }) {
  function requireUser(request, response) {
    const token = getToken(request);
    const user = store.getUserByToken(token);
    if (!user) {
      sendJson(response, 401, { error: "Unauthorized" });
      return null;
    }
    return user;
  }

  function requireAdmin(request, response) {
    const token = getToken(request);
    const admin = store.getAdminByToken(token);
    if (!admin) {
      sendJson(response, 401, { error: "Admin authorization required" });
      return null;
    }
    return admin;
  }

  return async function apiHandler(request, response) {
    const started = Date.now();
    try {
      if (request.method === "OPTIONS") {
        sendJson(response, 204, {});
        return true;
      }

      const url = new URL(request.url, `http://${request.headers.host}`);

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { ok: true });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/ready") {
        sendJson(response, 200, { ok: true });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/campuses") {
        sendJson(response, 200, { campuses: store.listCampuses() });
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/signup") {
        const body = await parseBody(request);
        const session = store.signup(body);
        store.appendAnalytics(trackEvent(analyticsEvents.signupCompleted, { userId: session.user.id }));
        sendJson(response, 201, session);
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await parseBody(request);
        sendJson(response, 200, store.login(body));
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/admin/login") {
        const body = await parseBody(request);
        sendJson(response, 200, store.adminLogin(body));
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        const token = getToken(request);
        if (token) {
          store.logout(token);
        }
        sendJson(response, 200, { ok: true });
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/verify-school-email") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const body = await parseBody(request);
        const result = store.verifySchoolEmail(user.id, body.schoolEmail);
        store.appendAnalytics(trackEvent(analyticsEvents.schoolVerified, { userId: user.id, campusId: result.campus.id }));
        sendJson(response, 200, result);
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/me") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        sendJson(response, 200, { user: store.sanitizeUser(user) });
        return true;
      }

      if (request.method === "PATCH" && url.pathname === "/api/me") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const body = await parseBody(request);
        sendJson(response, 200, { user: store.updateProfile(user.id, body) });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/me/progress") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        sendJson(response, 200, store.getProgress(user.id));
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/quests") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        sendJson(response, 200, { quests: store.listUserQuests(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/quests/") && url.pathname.endsWith("/claim")) {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const userQuestId = url.pathname.split("/")[3];
        const result = store.claimQuest(user.id, userQuestId);
        store.appendAnalytics(trackEvent(analyticsEvents.rewardGranted, { userId: user.id, xpDelta: result.rewardEvent.xpDelta, sourceType: "quest" }));
        sendJson(response, 200, result);
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/feed") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        sendJson(response, 200, { posts: store.listCampusFeed(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/feed/posts") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const body = await parseBody(request);
        const post = store.createFeedPost(user.id, body);
        sendJson(response, 201, { post, feed: store.listCampusFeed(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/feed/posts/") && url.pathname.endsWith("/reactions")) {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const postId = url.pathname.split("/")[4];
        const body = await parseBody(request);
        sendJson(response, 200, { post: store.reactToPost(user.id, postId, body.type || "fire"), feed: store.listCampusFeed(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/feed/posts/") && url.pathname.endsWith("/validations")) {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const postId = url.pathname.split("/")[4];
        sendJson(response, 200, { post: store.validatePost(user.id, postId), feed: store.listCampusFeed(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/feed/posts/") && url.pathname.endsWith("/report")) {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const postId = url.pathname.split("/")[4];
        const body = await parseBody(request);
        sendJson(response, 200, { report: store.reportPost(user.id, postId, body.reason) });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/leaderboards") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const window = url.searchParams.get("window") || "all_time";
        sendJson(response, 200, { rows: store.getLeaderboard(user.id, window) });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/notifications") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        sendJson(response, 200, { notifications: store.listNotifications(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/notifications/") && url.pathname.endsWith("/read")) {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const notificationId = url.pathname.split("/")[3];
        sendJson(response, 200, { notification: store.markNotificationRead(user.id, notificationId) });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/activities/meta") {
        sendJson(response, 200, { activityTypes });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/activities") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        sendJson(response, 200, { activities: store.listActivities(user.id) });
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/activities") {
        const user = requireUser(request, response);
        if (!user) {
          return true;
        }
        const body = await parseBody(request);
        const result = store.createActivity(user.id, body);
        store.appendAnalytics(trackEvent(analyticsEvents.activityLogged, { userId: user.id, activityType: body.activityType }));
        store.appendAnalytics(trackEvent(analyticsEvents.rewardGranted, { userId: user.id, xpDelta: result.rewardEvent.xpDelta }));
        sendJson(response, 201, result);
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/reward-rules") {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        sendJson(response, 200, { rewardRules: store.listRewardRules() });
        return true;
      }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/reward-rules/")) {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        const ruleId = url.pathname.split("/")[4];
        const body = await parseBody(request);
        sendJson(response, 200, { rewardRule: store.updateRewardRule(ruleId, body) });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/reports") {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        sendJson(response, 200, { reports: store.listReports() });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/analytics") {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        sendJson(response, 200, { summary: store.getAnalyticsSummary() });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/support/users") {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        sendJson(response, 200, { users: store.lookupUsers(url.searchParams.get("q") || "") });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/api/admin/quests") {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        sendJson(response, 200, { questTemplates: store.listQuestTemplates() });
        return true;
      }

      if (request.method === "POST" && url.pathname === "/api/admin/quests") {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        const body = await parseBody(request);
        sendJson(response, 201, { questTemplate: store.createQuestTemplate(body) });
        return true;
      }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/quests/")) {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        const templateId = url.pathname.split("/")[4];
        const body = await parseBody(request);
        sendJson(response, 200, { questTemplate: store.updateQuestTemplate(templateId, body) });
        return true;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/admin/feed/posts/") && url.pathname.endsWith("/remove")) {
        const admin = requireAdmin(request, response);
        if (!admin) {
          return true;
        }
        const postId = url.pathname.split("/")[5];
        sendJson(response, 200, { post: store.removeFeedPost(postId), reports: store.listReports() });
        return true;
      }

      return false;
    } catch (error) {
      sendJson(response, 400, { error: error.message });
      return true;
    } finally {
      if (logRequests) {
        const url = request.url || "/";
        const durationMs = Date.now() - started;
        console.log(`${request.method} ${url} ${response.statusCode || 200} ${durationMs}ms`);
      }
    }
  };
}

export function createApiServer({ fileUrl, logRequests = true } = {}) {
  const store = createStore(fileUrl);
  const handler = createApiHandler({ store, logRequests });
  const server = createServer(async (request, response) => {
    const handled = await handler(request, response);
    if (!handled) {
      sendJson(response, 404, { error: "Not found" });
    }
  });
  return { server, store };
}
