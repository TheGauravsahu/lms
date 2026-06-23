import { progressModel } from "./model.js";
import { courseFolderModel } from "../course/models/folder.js";
import { courseContentModel } from "../course/models/content.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to calculate progress percentage
async function calculatePercentage(accountId, courseId, completedList) {
  // Get all folders of the course
  const folders = await courseFolderModel.find({ course_id: courseId });
  const folderIds = folders.map((f) => f._id);

  // Get count of total contents in those folders
  const totalContents = await courseContentModel.countDocuments({
    folder_id: { $in: folderIds },
  });

  if (totalContents === 0) return 0;
  return Math.min(
    100,
    Math.round((completedList.length / totalContents) * 100),
  );
}

export const progressController = {
  getProgress: asyncHandler(async (req, res) => {
    const { course_id } = req.params;
    const { account_id } = req.account;

    let progress = await progressModel.findOne({ account_id, course_id });
    if (!progress) {
      progress = await progressModel.create({
        account_id,
        course_id,
        completed_contents: [],
      });
    }

    const percentage = await calculatePercentage(
      account_id,
      course_id,
      progress.completed_contents,
    );

    res.success(
      200,
      {
        completed_contents: progress.completed_contents,
        progress_percentage: percentage,
      },
      "Progress fetched successfully.",
    );
  }),

  toggleContent: asyncHandler(async (req, res) => {
    const { course_id, content_id } = req.body;
    const { account_id } = req.account;

    if (!course_id || !content_id) {
      return res.error(
        400,
        "Bad Request",
        "course_id and content_id are required.",
      );
    }

    let progress = await progressModel.findOne({ account_id, course_id });
    if (!progress) {
      progress = new progressModel({
        account_id,
        course_id,
        completed_contents: [],
      });
    }

    const index = progress.completed_contents.indexOf(content_id);
    if (index > -1) {
      // Remove content ID if already exists (uncompleted)
      progress.completed_contents.splice(index, 1);
    } else {
      // Add content ID (completed)
      progress.completed_contents.push(content_id);
    }

    await progress.save();

    const percentage = await calculatePercentage(
      account_id,
      course_id,
      progress.completed_contents,
    );

    res.success(
      200,
      {
        completed_contents: progress.completed_contents,
        progress_percentage: percentage,
      },
      "Progress toggled successfully.",
    );
  }),
};
