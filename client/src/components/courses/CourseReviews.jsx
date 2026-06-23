import { useState } from "react";
import { reviewApi } from "@/api/reviewApi";
import { purchaseApi } from "@/api/purchaseApi";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

export const CourseReviews = ({ courseId }) => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  // Queries
  const { data: reviewData, isPending } = reviewApi.useGetCourseReviews(courseId);
  const { data: isPurchased } = purchaseApi.useCheckPurchase(courseId);

  // Mutations
  const addReviewMutation = reviewApi.useAddReview();
  const deleteReviewMutation = reviewApi.useDeleteReview(courseId);

  // Local state for review form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseId) return;

    addReviewMutation.mutate(
      {
        course_id: courseId,
        rating,
        review_text: reviewText,
      },
      {
        onSuccess: () => {
          setReviewText("");
        },
      }
    );
  };

  const handleDelete = (reviewId) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  if (isPending) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  const { reviews = [], summary = { averageRating: 0, totalReviews: 0, ratingDistribution: {} } } = reviewData || {};

  // Check if current user has already reviewed the course
  const hasReviewed = reviews.some((r) => r.account_id?._id === user?._id);

  // Can the user submit a review? (Must be logged in, not admin, has purchased, and not already reviewed)
  const canReview = user && !isAdmin && isPurchased && !hasReviewed;

  return (
    <div className="space-y-8 mt-12 border-t border-border/50 pt-8">
      <div>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          Ratings & Reviews
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Hear from students who completed this course.
        </p>
      </div>

      {/* Ratings Summary & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card border rounded-xl p-6 shadow-2xs">
        {/* Average Rating Big Block */}
        <div className="flex flex-col items-center justify-center text-center md:border-r border-border/50 py-2">
          <span className="text-5xl font-extrabold text-foreground">{summary.averageRating}</span>
          <div className="flex gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(summary.averageRating)
                    ? "fill-orange-500 text-orange-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="col-span-2 space-y-2.5 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.ratingDistribution[stars] || 0;
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-right font-medium text-foreground">{stars}</span>
                <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500 shrink-0" />
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a Review Block */}
      {canReview && (
        <form onSubmit={handleSubmit} className="bg-card border border-orange-500/20 rounded-xl p-5 shadow-2xs space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-sm">Share Your Experience</h4>
            <p className="text-xs text-muted-foreground">Your review will help other students decide.</p>
          </div>

          {/* Star selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer transition-transform hover:scale-110 shrink-0"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= (hoverRating || rating)
                        ? "fill-orange-500 text-orange-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-orange-500 ml-2">
              {rating === 5 ? "Excellent! 🔥" : rating === 4 ? "Very Good! 👍" : rating === 3 ? "Good! 🙂" : rating === 2 ? "Fair 😐" : "Poor 🙁"}
            </span>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <Textarea
              placeholder="What did you like or dislike about the course? How was the instructor?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-24 bg-background border-border text-foreground text-sm rounded-md"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={addReviewMutation.isPending}
            className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-xs cursor-pointer rounded-md h-9 py-0 px-4"
          >
            Submit Review
          </Button>
        </form>
      )}

      {/* Review Warnings / Context boxes */}
      {user && !isAdmin && !isPurchased && (
        <div className="bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-500 p-3 rounded-lg flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>You must purchase this course to write a review. Only verified students can rate this course.</span>
        </div>
      )}

      {hasReviewed && (
        <div className="bg-green-500/5 border border-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>You have already submitted a review for this course. Thank you for your feedback!</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-bold text-foreground text-sm">
          Reviews ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-muted/5 border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const isOwner = r.account_id?._id === user?._id;
              const showDelete = isOwner || isAdmin;
              
              return (
                <div key={r._id} className="bg-card border rounded-xl p-4 shadow-3xs space-y-2 flex flex-col justify-between relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                        {r.account_id?.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-foreground block">
                          {r.account_id?.name || "Student"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Review Stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? "fill-orange-500 text-orange-500" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  {r.review_text && (
                    <p className="text-xs text-foreground leading-relaxed pl-11">
                      {r.review_text}
                    </p>
                  )}

                  {/* Delete Button */}
                  {showDelete && (
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deleteReviewMutation.isPending}
                      className="absolute right-3 bottom-3 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded-md hover:bg-secondary shrink-0"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
