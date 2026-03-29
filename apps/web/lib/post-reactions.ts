import { resolveFeedImageUrl } from "./feed-image-url";
import type { FeedComment, FeedPost, FeedPostReactions, PostReactionKind } from "./types";

export const EMPTY_REACTIONS: FeedPostReactions = {
  nod: 0,
  hype: 0,
  verify: 0,
  assist: 0
};

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
  const imageUrl = resolveFeedImageUrl(post.imageUrl);

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
