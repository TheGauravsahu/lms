import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { forumApi } from "@/api/forumApi";
import { useAuthStore } from "@/store/auth";
import {
  ArrowLeft, ThumbsUp, CheckCircle2, MessageSquare, Eye, Pin, Send,
  Trash2, Crown, Clock, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TimeAgo = ({ date }) => {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return <span>{days}d ago</span>;
  if (hrs > 0) return <span>{hrs}h ago</span>;
  return <span>{mins}m ago</span>;
};

const AuthorAvatar = ({ name, size = "md" }) => {
  const sizes = { sm: "w-7 h-7 text-[9px]", md: "w-9 h-9 text-xs" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold uppercase shrink-0`}>
      {name?.[0] || "U"}
    </div>
  );
};

const ReplyCard = ({ reply, postAuthorId, postId, onAccept, onUpvote }) => {
  const user = useAuthStore((s) => s.user);
  const upvoteCount = reply.upvotes?.length || 0;
  const hasUpvoted = user && reply.upvotes?.includes(user._id);

  return (
    <div className={`relative rounded-2xl border p-5 transition-all duration-300 ${reply.isAccepted ? "bg-green-500/5 border-green-500/30" : "bg-card border-border/50"}`}>
      {reply.isAccepted && (
        <div className="absolute -top-3 left-5 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" /> Accepted Answer
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Upvote */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          <button
            onClick={() => onUpvote({ postId, replyId: reply._id })}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all ${hasUpvoted ? "text-orange-400" : "text-muted-foreground hover:text-orange-400"}`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-bold">{upvoteCount}</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{reply.body}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <AuthorAvatar name={reply.authorId?.name} size="sm" />
              <div>
                <p className="text-xs font-semibold text-foreground">{reply.authorId?.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <TimeAgo date={reply.createdAt} />
                  {reply.authorId?.xp > 0 && <span className="ml-1 text-orange-400 font-semibold">{reply.authorId.xp} XP</span>}
                </p>
              </div>
            </div>

            {/* Accept button - only for post author */}
            {user && postAuthorId && user._id === postAuthorId && !reply.isAccepted && (
              <button
                onClick={() => onAccept({ postId, replyId: reply._id })}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-green-400 transition-colors cursor-pointer border border-border/50 hover:border-green-500/30 rounded-lg px-2.5 py-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Accept Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ForumPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [replyBody, setReplyBody] = useState("");

  const { data, isLoading } = forumApi.useGetForumPost(postId);
  const addReplyMutation = forumApi.useAddForumReply(postId);
  const upvotePostMutation = forumApi.useUpvotePost();
  const upvoteReplyMutation = forumApi.useUpvoteReply(postId);
  const acceptReplyMutation = forumApi.useAcceptReply(postId);
  const deletePostMutation = forumApi.useDeletePost();
  const pinMutation = forumApi.usePinPost();

  const { post, replies = [] } = data || {};

  const handleReply = () => {
    if (!replyBody.trim()) return toast.error("Reply cannot be empty.");
    addReplyMutation.mutate({ postId, body: replyBody }, { onSuccess: () => setReplyBody("") });
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this post?")) return;
    deletePostMutation.mutate(postId, { onSuccess: () => navigate("/forums") });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded-xl" />
        <div className="bg-card border border-border/30 rounded-2xl p-6 h-48" />
        <div className="bg-card border border-border/30 rounded-2xl p-6 h-32" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">Post not found.</p>
        <Button variant="outline" onClick={() => navigate("/forums")} className="mt-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Forums
        </Button>
      </div>
    );
  }

  const isAuthor = user && post.authorId?._id === user._id;
  const isAdmin = user?.role === "ADMIN";
  const hasUpvoted = user && post.upvotes?.includes(user._id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate("/forums")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Forums
      </button>

      {/* Post */}
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        {/* Meta tags */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.isAnswered ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
            <CheckCircle2 className="w-2.5 h-2.5" />
            {post.isAnswered ? "Answered" : "Open"}
          </span>
          {post.courseId && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
              📚 {post.courseId.title}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-foreground mb-4">{post.title}</h1>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-5">{post.body}</p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/20">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => upvotePostMutation.mutate(postId)}
              className={`flex items-center gap-1.5 text-sm font-semibold cursor-pointer transition-all px-3 py-1.5 rounded-xl border ${hasUpvoted ? "text-orange-400 bg-orange-500/10 border-orange-500/20" : "text-muted-foreground border-border/50 hover:border-orange-500/30 hover:text-orange-400"}`}
            >
              <ThumbsUp className="w-4 h-4" /> {post.upvotes?.length || 0}
            </button>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" /> {replies.length} replies
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" /> {post.views || 0} views
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(isAuthor || isAdmin) && (
              <button onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => pinMutation.mutate(postId)}
                className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer px-2.5 py-1 rounded-lg border transition-all ${post.isPinned ? "text-orange-400 border-orange-500/30 bg-orange-500/10" : "text-muted-foreground border-border/50 hover:border-orange-500/30 hover:text-orange-400"}`}
              >
                <Pin className="w-3 h-3" /> {post.isPinned ? "Unpin" : "Pin"}
              </button>
            )}
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <AuthorAvatar name={post.authorId?.name} size="sm" />
              <div>
                <p className="text-xs font-semibold">{post.authorId?.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  <TimeAgo date={post.createdAt} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>

        {replies.map((reply) => (
          <ReplyCard
            key={reply._id}
            reply={reply}
            postId={postId}
            postAuthorId={post.authorId?._id}
            onAccept={acceptReplyMutation.mutate}
            onUpvote={upvoteReplyMutation.mutate}
          />
        ))}
      </div>

      {/* Reply box */}
      {user ? (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Your Answer</h3>
          <Textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write a helpful, detailed answer..."
            rows={5}
            className="bg-background border-border/60 resize-none mb-3"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleReply}
              disabled={addReplyMutation.isPending}
              className="bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {addReplyMutation.isPending ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="text-orange-400 font-semibold hover:underline cursor-pointer">
              Sign in
            </button>{" "}
            to post a reply.
          </p>
        </div>
      )}
    </div>
  );
};

export default ForumPost;
