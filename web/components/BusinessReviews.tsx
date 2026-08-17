"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import {
  createReview,
  deleteReview,
  getBusinessReviews,
  replyToReview,
  type Review,
} from "@/lib/api";
import { isClerkConfigured } from "@/lib/clerk";

/** Mirrors the reviews section of the mobile app's business screen. */
export function BusinessReviews({ businessId, isOwner }: { businessId: number; isOwner: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getBusinessReviews(businessId)
      .then(setReviews)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, [businessId]);

  useEffect(load, [load]);

  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold tracking-tight">
        Reviews{" "}
        {average && (
          <span className="font-medium text-ink-400">
            · {average} ★ ({reviews.length})
          </span>
        )}
      </h2>

      {error && <p className="mt-3 text-sm text-brand-600">{error}</p>}

      {isClerkConfigured && <ReviewComposer businessId={businessId} onDone={load} />}

      {loading ? (
        <div className="mt-4 h-20 animate-pulse rounded-[10px] bg-ink-900/5" />
      ) : reviews.length === 0 ? (
        <p className="mt-3 text-ink-600">No reviews yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-[10px] border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{review.authorName}</p>
                <p className="text-sm text-brand-500">{"★".repeat(review.rating)}</p>
              </div>
              {review.comment && <p className="mt-2 text-ink-600">{review.comment}</p>}

              {review.reply && (
                <div className="mt-3 rounded-[8px] bg-ink-900/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Reply from the business
                  </p>
                  <p className="mt-1 text-sm text-ink-600">{review.reply}</p>
                </div>
              )}

              {isOwner && !review.reply && <ReplyForm reviewId={review.id} onDone={load} />}

              {review.isMine && (
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-brand-500 transition hover:text-brand-600"
                  onClick={() => {
                    if (window.confirm("Delete your review?")) {
                      void deleteReview(review.id).then(load);
                    }
                  }}
                >
                  Delete my review
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewComposer({ businessId, onDone }: { businessId: number; onDone: () => void }) {
  const { isSignedIn } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <p className="mt-3 text-sm text-ink-400">
        <a href="/sign-in" className="font-medium text-brand-500 hover:text-brand-600">
          Sign in
        </a>{" "}
        to leave a review.
      </p>
    );
  }

  return (
    <form
      className="mt-4 rounded-[10px] border border-line p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await createReview(businessId, { rating, comment: comment.trim() || null });
          setComment("");
          onDone();
        } catch (err) {
          // The RPC rejects reviewing your own business and duplicate reviews.
          setError(err instanceof Error ? err.message : "Could not post that review.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onClick={() => setRating(value)}
            className={`text-2xl leading-none transition ${
              value <= rating ? "text-brand-500" : "text-ink-400/40 hover:text-brand-400"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="mt-3 min-h-20 w-full rounded-[10px] border border-line px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
      />

      {error && <p className="mt-2 text-sm text-brand-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-3 rounded-[10px] bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        {busy ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}

function ReplyForm({ reviewId, onDone }: { reviewId: number; onDone: () => void }) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setBusy(true);
        try {
          await replyToReview(reviewId, reply.trim());
          setReply("");
          onDone();
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        className="flex-1 rounded-[10px] border border-line px-3 py-2 text-sm outline-none focus:border-brand-500"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Reply to this review"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-[10px] border border-line px-4 py-2 text-sm font-semibold text-ink-600 transition hover:border-brand-500 hover:text-brand-500 disabled:opacity-50"
      >
        Reply
      </button>
    </form>
  );
}
