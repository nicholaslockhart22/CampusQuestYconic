"use client";

import type { FeedPost } from "@/lib/types";

export function InstagramFeed({
  posts,
  onConfirm,
  emptyTitle,
  emptyBody
}: {
  posts: FeedPost[];
  onConfirm?: (postId: string) => void;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="bg-cq-white px-6 py-16 text-center">
        <p className="text-sm font-bold text-cq-navy">{emptyTitle ?? "Nothing here yet"}</p>
        <p className="mt-2 text-sm leading-relaxed text-ig-secondary">
          {emptyBody ?? "Check back soon for new posts."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-cq-keaney/25 bg-cq-white">
      {posts.map((post) => (
        <article key={post.id} className="bg-cq-white">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright via-cq-keaney to-cq-navy text-xs font-bold text-white shadow-sm ring-2 ring-cq-white">
              {post.author
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cq-navy">{post.author}</p>
              <p className="text-[11px] font-medium text-cq-keaney">{post.category}</p>
            </div>
            <span className="shrink-0 text-xs text-ig-secondary">{post.timestamp}</span>
          </div>

          <div className="mx-3 flex aspect-[4/3] max-h-72 items-center justify-center rounded-lg bg-gradient-to-br from-cq-keaneyIce via-cq-keaneySoft to-cq-keaney/50 ring-1 ring-cq-keaney/30">
            <div className="px-6 text-center">
              <p className="text-lg font-bold text-cq-navy">{post.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ig-secondary">{post.body}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 px-3 py-2">
            <button
              type="button"
              className="rounded-md p-1.5 text-cq-navy transition hover:bg-cq-keaneyIce active:scale-95"
              aria-label="Confirm win"
              onClick={() => onConfirm?.(post.id)}
            >
              <HeartIcon />
            </button>
            <span className="text-sm font-semibold text-cq-navy">
              {post.confirmations} confirmations
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-6.716-4.728-9-8.5C.78 9.1 2.6 5.5 6 5.5c2.1 0 3.5 1.2 4 2 0.5-0.8 1.9-2 4-2 3.4 0 5.22 3.6 3 7-2.284 3.772-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
