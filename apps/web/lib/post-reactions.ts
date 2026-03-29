import type { FeedComment, FeedPost, FeedPostReactions, PostReactionKind } from "./types";

export const EMPTY_REACTIONS: FeedPostReactions = {
  nod: 0,
  hype: 0,
  verify: 0,
  assist: 0
};

/**
 * Legacy: missing .png files and `/feed/*` paths collide with Next redirect `/feed` → `/quad`.
 * Static assets live under `/quad-media/*`.
 */
const FEED_IMAGE_ALIASES: Record<string, string> = {
  "/feed/wbb-arena.png": "/quad-media/wbb-arena.svg",
  "/feed/wbb-arena.svg": "/quad-media/wbb-arena.svg",
  "/feed/keaney-gym.png": "/quad-media/keaney-lift.svg",
  "/feed/keaney-lift.svg": "/quad-media/keaney-lift.svg",
  "/feed/memorial-union.png": "/quad-media/memorial-union.svg",
  "/feed/memorial-union.svg": "/quad-media/memorial-union.svg",
  "/feed/library-carothers.png": "/quad-media/library-night.svg",
  "/feed/library-night.svg": "/quad-media/library-night.svg",
  "/feed/involvement-fair.svg": "/quad-media/involvement-fair.svg",
  "/feed/quad-sunset.svg": "/quad-media/quad-sunset.svg",
  "/feed/lab-science.svg": "/quad-media/lab-science.svg"
};

function rewriteFeedPublicPath(path: string): string {
  if (path.startsWith("/feed/")) {
    return `/quad-media/${path.slice(6)}`;
  }
  return path;
}

function migrateFeedImageUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== "string") return url;
  const raw = url.trim();
  if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const pathOnly = raw.split(/[?#]/)[0] ?? raw;
  const suffix = raw.slice(pathOnly.length);
  let p = pathOnly;
  if (!p.startsWith("/")) {
    p = `/${p.replace(/^\/+/, "")}`;
  }
  const mapped = FEED_IMAGE_ALIASES[p] ?? FEED_IMAGE_ALIASES[pathOnly];
  const out = rewriteFeedPublicPath(mapped ?? p);
  return out + suffix;
}

export const POST_REACTION_DEFS: { kind: PostReactionKind; emoji: string; label: string }[] = [
  { kind: "nod", emoji: "👍", label: "Nod" },
  { kind: "hype", emoji: "🔥", label: "Hype" },
  { kind: "verify", emoji: "✓", label: "Verify" },
  { kind: "assist", emoji: "🤝", label: "Assist" }
];

/** Normalize persisted posts; migrate legacy `confirmations` into verify counts. */
export function normalizeFeedPost(post: FeedPost & { confirmations?: number }): FeedPost {
  const ramarks = Array.isArray(post.ramarks)
    ? post.ramarks.filter((t): t is string => typeof t === "string" && t.length > 0)
    : [];
  const comments = Array.isArray(post.comments)
    ? post.comments.filter(
        (c): c is FeedComment =>
          c &&
          typeof c === "object" &&
          typeof (c as FeedComment).id === "string" &&
          typeof (c as FeedComment).author === "string" &&
          typeof (c as FeedComment).body === "string" &&
          typeof (c as FeedComment).timestamp === "string"
      )
    : [];
  const r = post.reactions;
  const imageUrl = migrateFeedImageUrl(post.imageUrl);

  if (r && typeof r === "object") {
    return {
      id: post.id,
      author: post.author,
      title: post.title,
      body: post.body,
      category: post.category,
      reactions: { ...EMPTY_REACTIONS, ...r },
      timestamp: post.timestamp,
      ramarks,
      comments,
      ...(imageUrl ? { imageUrl } : {}),
      ...(post.authorHandle ? { authorHandle: post.authorHandle } : {}),
      ...(post.streakDays != null ? { streakDays: post.streakDays } : {}),
      ...(post.postEmoji ? { postEmoji: post.postEmoji } : {})
    };
  }
  const legacy = post.confirmations ?? 0;
  return {
    id: post.id,
    author: post.author,
    title: post.title,
    body: post.body,
    category: post.category,
    reactions: { ...EMPTY_REACTIONS, verify: legacy },
    timestamp: post.timestamp,
    ramarks,
    comments,
    ...(imageUrl ? { imageUrl } : {}),
    ...(post.authorHandle ? { authorHandle: post.authorHandle } : {}),
    ...(post.streakDays != null ? { streakDays: post.streakDays } : {}),
    ...(post.postEmoji ? { postEmoji: post.postEmoji } : {})
  };
}

export function totalReactions(r: FeedPostReactions): number {
  return r.nod + r.hype + r.verify + r.assist;
}
