import { FeedPostImage } from "@/components/ig/feed-post-image";
import { RamarkChipsUri } from "@/components/ig/ramark-chips";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { totalReactions } from "@/lib/post-reactions";
import type { FeedPost, PostReactionKind } from "@/lib/types";

export function FeedPanel({
  posts,
  onReact
}: {
  posts: FeedPost[];
  onReact?: (postId: string, kind: PostReactionKind) => void;
}) {
  return (
    <Card>
      <SectionHeading
        eyebrow="The Quad"
        title="URI-only momentum feed"
        description="Reactions and verifies keep the feed supportive—tap through from the mobile Quad for the full experience."
      />
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-3xl border border-uri-navy/10 bg-white/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-uri-ink">
                  {post.postEmoji ? <span className="mr-1">{post.postEmoji}</span> : null}
                  {post.author}
                </p>
                {post.authorHandle ? (
                  <p className="text-xs text-uri-navy/55">@{post.authorHandle}</p>
                ) : null}
                <p className="text-xs uppercase tracking-[0.18em] text-uri-navy/50">{post.category}</p>
              </div>
              <span className="shrink-0 text-sm text-uri-navy/52">{post.timestamp}</span>
            </div>
            {post.imageUrl ? (
              <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-uri-navy/10">
                <FeedPostImage
                  src={post.imageUrl}
                  alt={post.title}
                  className="max-h-48 w-full object-cover"
                  placeholderClassName="flex min-h-32 w-full items-center justify-center rounded-2xl bg-uri-navy/5 text-xs font-medium text-uri-navy/50"
                />
              </div>
            ) : null}
            <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
            <p className="mt-2 text-sm leading-6 text-uri-navy/66">{post.body}</p>
            <RamarkChipsUri ramarks={post.ramarks} className="mt-2" />
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-uri-navy/58">{totalReactions(post.reactions)} reactions</span>
              <button
                type="button"
                className="rounded-full border border-uri-navy/12 bg-uri-sky px-4 py-2 text-sm font-semibold text-uri-navy transition hover:border-uri-navy/24"
                onClick={() => onReact?.(post.id, "verify")}
              >
                Verify
              </button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
