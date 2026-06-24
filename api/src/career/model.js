import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  github_url: { type: String, default: "" },
  demo_url: { type: String, default: "" },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 50 }, // 0 to 100 representing expertise
});

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bio: { type: String, default: "" },
    skills: [skillSchema],
    completed_projects: [projectSchema],
    resume: {
      experience: [
        {
          role: String,
          company: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          degree: String,
          school: String,
          year: String,
        },
      ],
      contactEmail: String,
      phoneNumber: String,
      socialLinks: {
        linkedin: String,
        github: String,
        twitter: String,
      },
    },
  },
  { timestamps: true },
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    apply_url: { type: String, default: "" },
  },
  { timestamps: true },
);

const interviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_accounts",
      required: true,
    },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["STARTED", "COMPLETED"],
      default: "STARTED",
    },
    chatLog: [
      {
        role: { type: String, enum: ["user", "model"], required: true },
        content: { type: String, required: true },
      },
    ],
    evaluation: {
      overallGrade: String,
      score: Number, // 0 to 100
      strengths: [String],
      weaknesses: [String],
      detailedFeedback: String,
    },
  },
  { timestamps: true },
);

export const learnerProfileModel = mongoose.model(
  "learner_profiles",
  profileSchema,
);
export const jobBoardModel = mongoose.model("job_board", jobSchema);
export const mockInterviewModel = mongoose.model(
  "mock_interviews",
  interviewSchema,
);
