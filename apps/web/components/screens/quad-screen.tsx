"use client";

import { useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { InstagramFeed } from "@/components/ig/instagram-feed";
import { CreatePostForm } from "@/components/quad/create-post-form";

type QuadTab = "post" | "foryou" | "following";

const tabBtn =
  "flex-1 rounded-lg py-2 text-xs font-semibold transition sm:text-sm min-w-0 px-1";

export function QuadScreen() {
  const { state, confirmFeedPost } = useGameState();
  const [tab, setTab] = useState<QuadTab>("foryou");

  return (
    <div className="min-h-[60vh]">
      {/* First block under global top nav: Quad tabs */}
      <div
        className="border-b border-cq-keaney/30 bg-gradient-to-r from-cq-keaneyIce to-cq-white px-2 py-2 shadow-sm"
        role="tablist"
        aria-label="Quad"
      >
        <div className="flex gap-1 rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/50 p-1">
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

      {tab === "post" ? (
        <CreatePostForm
          onPosted={(a) => setTab(a === "friends" ? "following" : "foryou")}
        />
      ) : null}

      {tab === "foryou" ? (
        <>
          <div className="border-b border-cq-keaney/20 bg-cq-white px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">The Quad</p>
            <p className="text-sm font-bold text-cq-navy">For you · campus-wide</p>
          </div>
          <InstagramFeed
            posts={state.feed}
            onConfirm={confirmFeedPost}
            emptyTitle="No posts in For you"
            emptyBody="Campus highlights will show here—or open Post to share first."
          />
        </>
      ) : null}

      {tab === "following" ? (
        <>
          <div className="border-b border-cq-keaney/20 bg-cq-white px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Following</p>
            <p className="text-sm font-bold text-cq-navy">People you follow</p>
          </div>
          <InstagramFeed
            posts={state.feedFollowing}
            onConfirm={confirmFeedPost}
            emptyTitle="No posts from people you follow"
            emptyBody="Add friends on the Friends tab—then their wins will land here."
          />
        </>
      ) : null}
    </div>
  );
}
