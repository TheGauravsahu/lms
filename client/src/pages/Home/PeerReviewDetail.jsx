import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { peerReviewApi } from "@/api/peerReviewApi";
import { useAuthStore } from "@/store/auth";
import {
  ArrowLeft, MessageSquare, Star, Clock, CheckCircle, XCircle,
  Send, Trash2, Code2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

const LANG_COLORS = {
  javascript: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  html: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  css: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  python: "bg-green-500/10 text-green-400 border-green-500/20",
  typescript: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

const PeerReviewDetail = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [comment, setComment] = useState("");
  const [lineNumber, setLineNumber] = useState("");
  const [rating, setRating] = useState(0);

  const { data: review, isLoading } = peerReviewApi.useGetPeerReview(reviewId);
  const addCommentMutation = peerReviewApi.useAddReviewComment(reviewId);
  const closeMutation = peerReviewApi.useCloseReview();
  const rateMutation = peerReviewApi.useRateReview(reviewId);
  const deleteMutation = peerReviewApi.useDeletePeerReview();

  const isSubmitter = user && review?.submitterId?._id === user._id;
  const isAdmin = user?.role === "ADMIN";
  const isOwnCode = isSubmitter;

  const handleComment = () => {
    if (!comment.trim()) return toast.error("Comment cannot be empty.");
    if (isOwnCode) return toast.error("You cannot review your own code.");
    addCommentMutation.mutate(
      { reviewId, comment, lineNumber: lineNumber ? parseInt(lineNumber) : undefined },
      { onSuccess: () => { setComment(""); setLineNumber(""); } }
    );
  };

  const handleClose = () => {
    if (!window.confirm("Close this review?")) return;
    closeMutation.mutate(reviewId);
  };

  const handleRate = (r) => {
    setRating(r);
    rateMutation.mutate({ reviewId, rating: r });
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this review?")) return;
    deleteMutation.mutate(reviewId, { onSuccess: () => navigate("/peer-reviews") });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-muted rounded-xl" />
        <div className="bg-card border border-border/30 rounded-2xl h-[400px]" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Code2 className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">Review not found.</p>
        <Button variant="outline" onClick={() => navigate("/peer-reviews")} className="mt-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reviews
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate("/peer-reviews")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Reviews
      </button>

      {/* Header */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${LANG_COLORS[review.language] || LANG_COLORS.other}`}>
                {review.language}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${review.status === "open" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-muted text-muted-foreground border-border/50"}`}>
                {review.status === "open" ? "● Open" : "✓ Closed"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{review.title}</h1>
            {review.description && <p className="text-sm text-muted-foreground mb-3">{review.description}</p>}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[8px] font-bold uppercase">
                  {review.submitterId?.name?.[0]}
                </div>
                {review.submitterId?.name}
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {review.comments?.length || 0} comments
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isSubmitter && review.status === "open" && (
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                disabled={closeMutation.isPending}
                className="text-xs cursor-pointer border-border/60"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Close Review
              </Button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Rating (for submitter after close) */}
        {isSubmitter && review.status === "closed" && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Rate this review session:</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleRate(s)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star className={`w-5 h-5 ${s <= (review.rating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`} />
                </button>
              ))}
              {review.rating && <span className="text-xs text-muted-foreground ml-2">{review.rating}/5 rated</span>}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor (read-only) */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 border-b border-border/50 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Source Code</span>
        </div>
        <Editor
          height="350px"
          language={review.language === "other" ? "javascript" : review.language}
          theme="vs-dark"
          value={review.code}
          options={{
            readOnly: true,
            fontSize: 12,
            minimap: { enabled: false },
            lineNumbers: "on",
            fontFamily: "Space Grotesk, monospace",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          {review.comments?.length || 0} Review Comments
        </h2>

        {review.comments?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Be the first to review this code and earn <span className="text-purple-400 font-semibold">+30 XP</span>!
          </div>
        )}

        {review.comments?.map((c, i) => (
          <div key={c._id || i} className="bg-card border border-border/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold uppercase">
                {c.authorId?.name?.[0] || "U"}
              </div>
              <span className="font-semibold text-foreground">{c.authorId?.name}</span>
              {c.lineNumber && (
                <span className="bg-muted border border-border/60 rounded px-1.5 py-0.5 font-mono text-[10px]">
                  Line {c.lineNumber}
                </span>
              )}
              <span className="ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pl-8">{c.comment}</p>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      {user && !isOwnCode && review.status === "open" ? (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">
            Leave a Review <span className="text-purple-400 font-normal text-xs ml-1">+30 XP</span>
          </h3>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave constructive feedback, explain improvements, suggest alternatives..."
                rows={4}
                className="bg-background border-border/60 resize-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Line #</label>
              <input
                type="number"
                value={lineNumber}
                onChange={(e) => setLineNumber(e.target.value)}
                placeholder="Optional"
                className="w-24 bg-background border border-border/60 rounded-lg px-2 py-1.5 text-xs text-foreground"
              />
            </div>
            <Button
              onClick={handleComment}
              disabled={addCommentMutation.isPending}
              className="ml-auto bg-gradient-to-b from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold cursor-pointer"
            >
              {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1.5" />}
              Post Comment
            </Button>
          </div>
        </div>
      ) : user && isOwnCode ? (
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center text-sm text-muted-foreground">
          This is your own code submission. You cannot review it yourself.
        </div>
      ) : review.status === "closed" ? (
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center text-sm text-muted-foreground">
          This review is closed. No more comments can be added.
        </div>
      ) : null}
    </div>
  );
};

export default PeerReviewDetail;
