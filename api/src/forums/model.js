import mongoose from "mongoose";

const forumReplySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "forum_posts",
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    body: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user_accounts" }],
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const forumPostSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      index: true,
      default: null,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user_accounts" }],
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isAnswered: { type: Boolean, default: false },
    replyCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ForumPost = mongoose.model("forum_posts", forumPostSchema);
export const ForumReply = mongoose.model("forum_replies", forumReplySchema);
