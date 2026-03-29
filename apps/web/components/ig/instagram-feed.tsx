"use client";

import { useState } from "react";
import { RamarkChips } from "@/components/ig/ramark-chips";
import { POST_REACTION_DEFS, totalReactions } from "@/lib/post-reactions";
import type { FeedPost, PostReactionKind } from "@/lib/types";

const COMMENT_MAX = 500;

export function InstagramFeed({
  posts,
  onReact,
  onComment,
  emptyTitle,
  emptyBody
}: {
  posts: FeedPost[];
  onReact?: (postId: string, kind: PostReactionKind) => void;
  onComment?: (postId: string, body: string) => void;
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
          <div className="flex items-start gap-3 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright via-cq-keaney to-cq-navy text-xs font-bold text-white shadow-sm ring-2 ring-cq-white">
              {post.author
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold text-cq-navy">
                  {post.postEmoji ? (
                    <span className="mr-1 inline-block" aria-hidden>
                      {post.postEmoji}
                    </span>
                  ) : null}
                  {post.author}
                </p>
                <span className="shrink-0 text-xs text-ig-secondary">{post.timestamp}</span>
              </div>
              {post.streakDays != null && post.streakDays > 0 ? (
                <p className="mt-0.5 text-[11px] font-semibold text-amber-700">
                  🔥 {post.streakDays}-day streak
                </p>
              ) : null}
              {post.authorHandle ? (
                <p className="text-[11px] font-medium text-cq-keaney">@{post.authorHandle}</p>
              ) : null}
              <p className="mt-0.5 text-[11px] font-medium text-cq-keaney/90">{post.category}</p>
            </div>
          </div>

          {post.imageUrl ? (
            <div className="mx-3 overflow-hidden rounded-lg ring-1 ring-cq-keaney/30">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URLs + public paths */}
              <img src={post.imageUrl} alt="" className="max-h-80 w-full object-cover" />
            </div>
          ) : null}

          <div
            className={`mx-3 flex min-h-[8rem] flex-col justify-center rounded-lg bg-gradient-to-br from-cq-keaneyIce via-cq-keaneySoft to-cq-keaney/50 px-4 py-4 ring-1 ring-cq-keaney/30 ${
              post.imageUrl ? "mt-2" : ""
            }`}
          >
            <p className="text-lg font-bold text-cq-navy">{post.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ig-secondary">{post.body}</p>
            <RamarkChips ramarks={post.ramarks} className="mt-3" />
          </div>

          <div className="px-3 py-2.5">
            <div className="flex flex-wrap gap-1.5">
              {POST_REACTION_DEFS.map(({ kind, emoji, label }) => {
                const count = post.reactions[kind];
                return (
                  <button
                    key={kind}
                    type="button"
                    className="flex min-w-[3.25rem] flex-col items-center rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/40 px-2 py-1.5 text-cq-navy transition hover:border-cq-keaney/50 hover:bg-cq-keaneyIce active:scale-95"
                    aria-label={`${label}: ${count}`}
                    onClick={() => onReact?.(post.id, kind)}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {emoji}
                    </span>
                    <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-ig-secondary">
                      {label}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-cq-navy">{count}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-ig-secondary">
              {totalReactions(post.reactions)} reactions
            </p>
          </div>

          <PostCommentBlock post={post} onComment={onComment} />
        </article>
      ))}
    </div>
  );
}

function PostCommentBlock({
  post,
  onComment
}: {
  post: FeedPost;
  onComment?: (postId: string, body: string) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const count = post.comments.length;

  function toggleDropdown() {
    setDropdownOpen((open) => {
      if (open) {
        setComposing(false);
        setDraft("");
      }
      return !open;
    });
  }

  function submit() {
    const t = draft.trim();
    if (!t) return;
    onComment?.(post.id, t);
    setDraft("");
    setComposing(false);
  }

  const label =
    count === 0 ? "Comments" : `Comments (${count})`;

  return (
    <div className="border-t border-cq-keaney/15 px-3 py-1">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg py-2 text-left transition hover:bg-cq-keaneyIce/50"
        aria-expanded={dropdownOpen}
        aria-controls={`comments-${post.id}`}
        id={`comments-trigger-${post.id}`}
        onClick={toggleDropdown}
      >
        <span className="text-xs font-semibold text-cq-navy">{label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-cq-keaney transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
        />
      </button>

      {dropdownOpen ? (
        <div
          id={`comments-${post.id}`}
          role="region"
          aria-labelledby={`comments-trigger-${post.id}`}
          className="border-t border-cq-keaney/10 pb-2 pt-2"
        >
          {count > 0 ? (
            <ul className="mb-3 space-y-2.5">
              {post.comments.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-semibold text-cq-navy">{c.author}</span>
                  <span className="text-ig-secondary"> · {c.timestamp}</span>
                  <p className="mt-0.5 text-ig-secondary">{c.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-xs text-ig-secondary">No comments yet.</p>
          )}

          {composing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, COMMENT_MAX))}
                placeholder="Write a comment…"
                rows={2}
                className="w-full rounded-xl border border-cq-keaney/35 bg-cq-keaneyIce/40 px-3 py-2 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-cq-navy px-3 py-1.5 text-xs font-bold text-white"
                  onClick={submit}
                >
                  Post
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-cq-keaney/40 px-3 py-1.5 text-xs font-semibold text-cq-navy"
                  onClick={() => {
                    setComposing(false);
                    setDraft("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-xs font-semibold text-cq-keaney hover:underline"
              onClick={() => setComposing(true)}
            >
              Add a comment
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
