import React, { useState } from "react";
import { commentApi } from "@/api/commentApi";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Trash2, CornerDownRight, MessageSquare } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

const ContentComments = ({ contentId }) => {
  const user = useAuthStore((state) => state.user);
  const haptic = useHaptic();

  const { data: comments = [], isPending } = commentApi.useGetComments(contentId);
  const addCommentMutation = commentApi.useAddComment();
  const deleteCommentMutation = commentApi.useDeleteComment();

  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    haptic.tap();
    addCommentMutation.mutate(
      {
        content_id: contentId,
        comment: newComment.trim(),
      },
      {
        onSuccess: () => {
          haptic.success();
          setNewComment("");
        },
        onError: () => haptic.error(),
      }
    );
  };

  const handleReplySubmit = (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    haptic.tap();
    addCommentMutation.mutate(
      {
        content_id: contentId,
        comment: replyText.trim(),
        parent_id: parentId,
      },
      {
        onSuccess: () => {
          haptic.success();
          setReplyText("");
          setReplyToId(null);
        },
        onError: () => haptic.error(),
      }
    );
  };

  const handleDelete = (commentId) => {
    haptic.tap();
    deleteCommentMutation.mutate(
      { commentId, contentId },
      {
        onSuccess: () => haptic.success(),
        onError: () => haptic.error(),
      }
    );
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  // Filter root comments and replies
  const rootComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId) => comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-6 pt-4 border-t mt-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-lg text-foreground">Discussions & Q&A</h3>
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
          {comments.length}
        </span>
      </div>

      {/* Main Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <Avatar className="w-9 h-9 border shrink-0">
          <AvatarFallback className="bg-orange-500 text-white text-sm font-semibold">
            {user?.name?.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts about this lesson..."
            className="min-h-[80px] bg-input rounded-md resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={addCommentMutation.isPending || !newComment.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm text-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              Post Question
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No questions posted yet. Start the conversation!
          </p>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment._id);
            const isOwner = comment.account_id?._id === user?._id;
            const isAdmin = user?.role === "ADMIN";

            return (
              <div key={comment._id} className="space-y-3 p-4 bg-muted/20 dark:bg-muted/5 rounded-xl border border-border/50">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border">
                      <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
                        {comment.account_id?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{comment.account_id?.name}</span>
                        {comment.account_id?.role === "ADMIN" && (
                          <span className="text-[9px] bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-900 uppercase">
                            Instructor
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {(isOwner || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comment._id)}
                      disabled={deleteCommentMutation.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer rounded-full"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-sm text-foreground/90 pl-10 whitespace-pre-wrap">
                  {comment.comment}
                </p>

                {/* Reply Actions */}
                <div className="pl-10">
                  {replyToId === comment._id ? (
                    <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="space-y-2 mt-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="min-h-[60px] bg-input rounded-md resize-none text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            haptic.tap();
                            setReplyToId(null);
                            setReplyText("");
                          }}
                          className="text-xs h-7 px-2.5 cursor-pointer rounded-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={addCommentMutation.isPending || !replyText.trim()}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm text-xs h-7 px-3 flex items-center gap-1 cursor-pointer"
                        >
                          Submit Reply
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        haptic.tap();
                        setReplyToId(comment._id);
                      }}
                      className="text-xs h-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-sm flex items-center gap-1"
                    >
                      Reply
                    </Button>
                  )}
                </div>

                {/* Replies Thread */}
                {replies.length > 0 && (
                  <div className="pl-10 space-y-3 pt-2 border-t border-border/30">
                    {replies.map((reply) => {
                      const isReplyOwner = reply.account_id?._id === user?._id;

                      return (
                        <div key={reply._id} className="flex gap-2 items-start bg-secondary/20 p-3 rounded-lg border border-border/20">
                          <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground">
                                  {reply.account_id?.name}
                                </span>
                                {reply.account_id?.role === "ADMIN" && (
                                  <span className="text-[8px] bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-900 uppercase">
                                    Instructor
                                  </span>
                                )}
                                <span className="text-[9px] text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              {(isReplyOwner || isAdmin) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(reply._id)}
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer rounded-full"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-foreground/90 whitespace-pre-wrap">
                              {reply.comment}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContentComments;
