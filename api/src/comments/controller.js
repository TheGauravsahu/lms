import { commentModel } from "./model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const commentsController = {
  getComments: asyncHandler(async (req, res) => {
    const { content_id } = req.params;

    const comments = await commentModel
      .find({ content_id })
      .populate("account_id", "name role")
      .sort({ createdAt: 1 }); // Sort chronologically

    res.success(200, comments, "Comments fetched successfully.");
  }),

  addComment: asyncHandler(async (req, res) => {
    const { content_id, comment, parent_id } = req.body;
    const { account_id } = req.account;

    if (!content_id || !comment) {
      return res.error(
        400,
        "Bad Request",
        "content_id and comment text are required.",
      );
    }

    const newComment = await commentModel.create({
      content_id,
      account_id,
      comment,
      parent_id: parent_id || null,
    });

    const populated = await commentModel
      .findById(newComment._id)
      .populate("account_id", "name role");

    res.success(201, populated, "Comment posted successfully.");
  }),

  deleteComment: asyncHandler(async (req, res) => {
    const { comment_id } = req.params;
    const { account_id } = req.account;
    const userRole = req.account.role;

    const commentObj = await commentModel.findById(comment_id);
    if (!commentObj) {
      return res.error(404, "Not Found", "Comment not found.");
    }

    // Only allow owner or admin to delete comment
    if (
      commentObj.account_id.toString() !== account_id &&
      userRole !== "ADMIN"
    ) {
      return res.error(
        403,
        "Forbidden",
        "You do not have permission to delete this comment.",
      );
    }

    // Delete comment and all its child replies recursively
    await commentModel.deleteMany({
      $or: [{ _id: comment_id }, { parent_id: comment_id }],
    });

    res.success(200, null, "Comment deleted successfully.");
  }),
};
