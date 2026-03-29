"use client";

import { useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";

const CATEGORIES = ["Campus", "Knowledge", "Social", "Strength", "Focus", "Study"] as const;

export type PostAudience = "foryou" | "friends";

export function CreatePostForm({
  onPosted
}: {
  onPosted?: (audience: PostAudience) => void;
}) {
  const { addFeedPost } = useGameState();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [audience, setAudience] = useState<PostAudience>("foryou");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write something to share with the Quad.");
      return;
    }
    setError("");
    addFeedPost({ title: title.trim(), body: trimmed, category, audience });
    setTitle("");
    setBody("");
    onPosted?.(audience);
  }

  return (
    <form className="space-y-4 border-b border-cq-keaney/25 bg-cq-white px-4 py-4" onSubmit={handleSubmit}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">New post</p>
        <p className="mt-1 text-xs font-semibold text-cq-navy">Who can see this?</p>
        <div
          className="mt-2 flex gap-1 rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/50 p-1"
          role="group"
          aria-label="Post audience"
        >
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition sm:text-sm ${
              audience === "foryou"
                ? "bg-cq-white text-cq-navy shadow-sm ring-1 ring-cq-keaney/40"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setAudience("foryou")}
          >
            For you
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition sm:text-sm ${
              audience === "friends"
                ? "bg-cq-white text-cq-navy shadow-sm ring-1 ring-cq-keaney/40"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setAudience("friends")}
          >
            Friends only
          </button>
        </div>
        <p className="mt-2 text-sm text-ig-secondary">
          {audience === "foryou" ? (
            <>
              Everyone at your campus can see this on <strong className="text-cq-navy">For you</strong>.
            </>
          ) : (
            <>
              Only people you follow will see this on <strong className="text-cq-navy">Following</strong>.
            </>
          )}
        </p>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-cq-navy">Headline (optional)</span>
        <input
          className="rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 px-3 py-2.5 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/35"
          placeholder="e.g. Passed orgo exam"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-cq-navy">What happened?</span>
        <textarea
          required
          className="min-h-32 rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 px-3 py-2.5 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/35"
          placeholder="Share your win, event, or shout-out—keep it positive and campus-safe."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-cq-navy">Category</span>
        <select
          className="rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 px-3 py-2.5 text-sm text-cq-navy focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/35"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-cq-navy py-3 text-sm font-bold text-white shadow-md transition hover:bg-cq-navyLight"
      >
        {audience === "friends" ? "Share with friends" : "Post to For you"}
      </button>
    </form>
  );
}
