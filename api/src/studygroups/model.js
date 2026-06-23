import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "study_groups",
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    message: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const studyGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user_accounts" }],
    isPrivate: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true, sparse: true },
    maxMembers: { type: Number, default: 20, min: 2, max: 100 },
  },
  { timestamps: true }
);

export const StudyGroup = mongoose.model("study_groups", studyGroupSchema);
export const GroupMessage = mongoose.model("group_messages", groupMessageSchema);
