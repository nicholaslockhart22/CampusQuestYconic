import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FeedPost } from "@/lib/types";

export function FeedPanel({
  posts,
  onConfirm
}: {
  posts: FeedPost[];
  onConfirm?: (postId: string) => void;
}) {
  return (
    <Card>
      <SectionHeading
        eyebrow="The Quad"
        title="URI-only momentum feed"
        description="A positive accomplishments feed designed for confirmation, not toxicity."
      />
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-3xl border border-uri-navy/10 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-uri-ink">{post.author}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-uri-navy/50">{post.category}</p>
              </div>
              <span className="text-sm text-uri-navy/52">{post.timestamp}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
            <p className="mt-2 text-sm leading-6 text-uri-navy/66">{post.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-uri-navy/58">{post.confirmations} confirmations</span>
              <button
                type="button"
                className="rounded-full border border-uri-navy/12 bg-uri-sky px-4 py-2 text-sm font-semibold text-uri-navy transition hover:border-uri-navy/24"
                onClick={() => onConfirm?.(post.id)}
              >
                Confirm
              </button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
