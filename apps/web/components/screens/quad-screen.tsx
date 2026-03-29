"use client";

import { useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { InstagramFeed } from "@/components/ig/instagram-feed";
import { CreatePostForm } from "@/components/quad/create-post-form";

type QuadTab = "post" | "foryou" | "following";

const tabBtn =
  "flex-1 rounded-lg py-2 text-xs font-semibold transition sm:text-sm min-w-0 px-1";

/** Fixed below app header; matches tab row + padding so content clears the bar. */
const QUAD_TAB_BAR_TOP = "top-[calc(3.5rem+env(safe-area-inset-top,0px))]";
const QUAD_TAB_BAR_RESERVE = "min-h-[3.75rem]";

export function QuadScreen() {
  const { state, reactToFeedPost, addFeedComment } = useGameState();
  const [tab, setTab] = useState<QuadTab>("foryou");

  return (
    <div className="min-h-[50vh] pb-2">
      {/* Fixed tab bar — always visible while scrolling (not dependent on sticky containment). */}
      <div
        className={`fixed left-1/2 z-[35] w-full max-w-lg -translate-x-1/2 ${QUAD_TAB_BAR_TOP} rounded-t-[1.75rem] border-x border-b border-cq-keaney/25 bg-cq-white/95 px-2 py-2 shadow-[0_4px_16px_rgba(11,31,65,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-cq-white/88`}
        role="tablist"
        aria-label="Quad"
      >
        <div className="flex gap-1 rounded-xl border border-cq-keaney/30 bg-cq-keaneyIce/45 p-1 backdrop-blur-sm">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "post"}
            className={`${tabBtn} ${
              tab === "post"
                ? "bg-cq-white text-cq-navy shadow-sm ring-1 ring-cq-keaney/40"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setTab("post")}
          >
            Post
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "foryou"}
            className={`${tabBtn} ${
              tab === "foryou"
                ? "bg-cq-white text-cq-navy shadow-sm ring-1 ring-cq-keaney/40"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setTab("foryou")}
          >
            For you
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "following"}
            className={`${tabBtn} ${
              tab === "following"
                ? "bg-cq-white text-cq-navy shadow-sm ring-1 ring-cq-keaney/40"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setTab("following")}
          >
            Following
          </button>
        </div>
      </div>

      {/* Reserve space so feed starts below the fixed tabs */}
      <div className={`${QUAD_TAB_BAR_RESERVE} shrink-0`} aria-hidden />

      {tab === "foryou" ? (
        <div className="border-b border-cq-keaney/20 bg-cq-white px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">The Quad</p>
          <p className="text-sm font-bold text-cq-navy">For you · campus-wide</p>
        </div>
      ) : null}
      {tab === "following" ? (
        <div className="border-b border-cq-keaney/20 bg-cq-white px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Following</p>
          <p className="text-sm font-bold text-cq-navy">People you follow</p>
        </div>
      ) : null}

      {tab === "post" ? (
        <CreatePostForm
          onPosted={(a) => setTab(a === "friends" ? "following" : "foryou")}
        />
      ) : null}

      {tab === "foryou" ? (
        <InstagramFeed
          posts={state.feed}
          onReact={reactToFeedPost}
          onComment={addFeedComment}
          emptyTitle="No posts in For you"
          emptyBody="Campus highlights will show here—or open Post to share first."
        />
      ) : null}

      {tab === "following" ? (
        <InstagramFeed
          posts={state.feedFollowing}
          onReact={reactToFeedPost}
          onComment={addFeedComment}
          emptyTitle="No posts from people you follow"
          emptyBody="Add friends on the Friends tab—then their wins will land here."
        />
      ) : null}
    </div>
  );
}
