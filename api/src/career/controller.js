import { asyncHandler } from "../utils/asyncHandler.js";
import { learnerProfileModel, jobBoardModel, mockInterviewModel } from "./model.js";
import { generateGeminiContent } from "../utils/gemini.js";
import { accountModel } from "../auth/model.js";

class CareerController {
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    let profile = await learnerProfileModel.findOne({ user_id: userId });

    if (!profile) {
      // Find the account document to get email and name
      const accountDoc = await accountModel.findById(userId);
      const email = accountDoc?.email || "";
      const baseName = (email && email.includes("@"))
        ? email.split("@")[0]
        : (accountDoc?.name ? accountDoc.name.replace(/\s+/g, "").toLowerCase() : "learner");
      
      const username = baseName + "_" + Math.floor(100 + Math.random() * 900);
      
      profile = await learnerProfileModel.create({
        user_id: userId,
        username,
        bio: "Learning development on Gaurav LMS!",
        skills: [
          { name: "HTML5", level: 60 },
          { name: "CSS3", level: 50 },
          { name: "JavaScript", level: 40 }
        ],
        completed_projects: [],
        resume: {
          experience: [],
          education: [],
          contactEmail: email,
        }
      });
    }

    res.success(200, profile, "Learner profile fetched.");
  });

  getPublicProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const profile = await learnerProfileModel.findOne({ username })
      .populate("user_id", "email currentStreak maxStreak rewards xp");

    if (!profile) {
      return res.error(404, "Not Found", "Public profile not found.");
    }

    res.success(200, profile, "Public profile fetched.");
  });

  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { bio, skills, completed_projects, resume, username } = req.body;

    const profile = await learnerProfileModel.findOne({ user_id: userId });
    if (!profile) {
      return res.error(404, "Not Found", "Profile not found.");
    }

    if (username && username.trim() !== profile.username) {
      const existing = await learnerProfileModel.findOne({ username: username.trim() });
      if (existing) {
        return res.error(400, "Validation Error", "Username is already taken.");
      }
      profile.username = username.trim();
    }

    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills;
    if (completed_projects !== undefined) profile.completed_projects = completed_projects;
    if (resume !== undefined) {
      profile.resume = {
        ...profile.resume,
        ...resume,
      };
    }

    await profile.save();
    res.success(200, profile, "Profile updated successfully.");
  });

  getJobs = asyncHandler(async (req, res) => {
    let jobs = await jobBoardModel.find().sort({ createdAt: -1 });

    if (jobs.length === 0) {
      // Seed mock job data for premium job board experience
      jobs = await jobBoardModel.create([
        {
          title: "Frontend Development Intern",
          company: "Accenture",
          location: "Bangalore (Hybrid)",
          description: "Join the digital experience team to build modern React.js web interfaces for international clients.",
          requirements: ["React.js", "Tailwind CSS", "JavaScript ES6", "Git"],
          apply_url: "https://accenture.com/careers"
        },
        {
          title: "Junior Full Stack Developer",
          company: "Cognizant",
          location: "Pune (On-site)",
          description: "Work on Node.js services and React dashboards. Collaborate closely with database engineers and designers.",
          requirements: ["Node.js", "Express", "MongoDB", "REST APIs"],
          apply_url: "https://cognizant.com/careers"
        },
        {
          title: "Associate DevOps Pipeline Engineer",
          company: "TCS",
          location: "Remote",
          description: "Maintain build integration pipelines, manage container registry instances, and support cloud configurations.",
          requirements: ["Docker", "Kubernetes", "CI/CD", "AWS basics"],
          apply_url: "https://tcs.com/careers"
        }
      ]);
    }

    res.success(200, jobs, "Job board listings fetched.");
  });

  startMockInterview = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { role } = req.body;

    if (!role) {
      return res.error(400, "Validation Error", "role is required.");
    }

    // Cancel previous started interviews
    await mockInterviewModel.deleteMany({ user_id: userId, status: "STARTED" });

    const systemInstruction = `You are a professional software engineering mock interviewer.
You are interviewing a candidate for the target role: "${role}".
Ask only one technical question at a time. Do not write a long paragraph. Make questions precise and challenging.
At the beginning, greet the candidate warmly and ask a basic warm-up question related to the target role.`;

    const firstQuestion = await generateGeminiContent("Hello, I am ready to start the mock interview.", [], false, systemInstruction);

    const interview = await mockInterviewModel.create({
      user_id: userId,
      role,
      status: "STARTED",
      chatLog: [
        { role: "model", content: firstQuestion }
      ]
    });

    res.success(201, interview, "Mock interview session started.");
  });

  getActiveInterview = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const interview = await mockInterviewModel.findOne({ user_id: userId, status: "STARTED" });
    res.success(200, interview, "Active interview session fetched.");
  });

  submitInterviewResponse = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const { responseText } = req.body;

    if (!responseText || !responseText.trim()) {
      return res.error(400, "Validation Error", "responseText is required.");
    }

    const interview = await mockInterviewModel.findOne({ user_id: userId, status: "STARTED" });
    if (!interview) {
      return res.error(404, "Not Found", "No active interview session found.");
    }

    // Add user response to log
    interview.chatLog.push({ role: "user", content: responseText });

    // Calculate how many questions have been asked (model replies)
    const modelQuestionsCount = interview.chatLog.filter((msg) => msg.role === "model").length;

    if (modelQuestionsCount >= 5) {
      // 5 questions completed, trigger evaluation
      const evalInstruction = `You are an expert technical recruiter. Evaluate the mock interview chat transcript.
Generate a structured JSON output of the performance matching this schema exactly:
{
  "overallGrade": "A" | "B" | "C" | "D" | "F",
  "score": Number (0 to 100),
  "strengths": ["list strength 1", "list strength 2"],
  "weaknesses": ["list weakness 1", "list weakness 2"],
  "detailedFeedback": "Detailed constructive evaluation and improvement tips"
}
Do not include any markup blocks, JSON formatting backticks (like \`\`\`json), or prefix text. Return only the raw JSON.`;

      const transcriptPrompt = `Evaluate this interview transcript for the role of "${interview.role}":\n` + 
        interview.chatLog.map((log) => `${log.role === "user" ? "Candidate" : "Interviewer"}: ${log.content}`).join("\n");

      try {
        const evalResponse = await generateGeminiContent(transcriptPrompt, [], true, evalInstruction);
        const parsedEval = JSON.parse(evalResponse);

        interview.evaluation = {
          overallGrade: parsedEval.overallGrade || "B",
          score: parsedEval.score || 70,
          strengths: parsedEval.strengths || [],
          weaknesses: parsedEval.weaknesses || [],
          detailedFeedback: parsedEval.detailedFeedback || "Completed successfully.",
        };
        interview.status = "COMPLETED";
        await interview.save();

        return res.success(200, interview, "Mock interview completed and evaluated.");
      } catch (err) {
        console.error("Interview Evaluation Error:", err);
        // Save placeholder evaluation so candidate doesn't lose progress
        interview.evaluation = {
          overallGrade: "B",
          score: 75,
          strengths: ["Detailed responses", "Good technical vocabulary"],
          weaknesses: ["Could explain structure better"],
          detailedFeedback: "Completed. Evaluation service returned error but saved successfully.",
        };
        interview.status = "COMPLETED";
        await interview.save();
        return res.success(200, interview, "Mock interview completed with fallback evaluation.");
      }
    } else {
      // Ask next question
      const systemInstruction = `You are a professional software engineering mock interviewer.
You are interviewing a candidate for the target role: "${interview.role}".
Ask only one technical question at a time. Do not write a long paragraph.
Look at the candidate's response to your last question, briefly provide context or brief feedback if necessary, then ask the next challenging technical question.`;

      try {
        // Map database log to Gemini history format (exclude current user message because it's passed as prompt)
        const history = interview.chatLog.slice(0, -1);
        const nextQuestion = await generateGeminiContent(responseText, history, false, systemInstruction);

        interview.chatLog.push({ role: "model", content: nextQuestion });
        await interview.save();

        res.success(200, interview, "Next mock interview question fetched.");
      } catch (err) {
        return res.error(500, "AI Service Error", err.message);
      }
    }
  });

  getInterviewsHistory = asyncHandler(async (req, res) => {
    const userId = req.account.account_id;
    const history = await mockInterviewModel.find({ user_id: userId, status: "COMPLETED" }).sort({ createdAt: -1 });
    res.success(200, history, "Mock interview history fetched.");
  });

  adminCreateJob = asyncHandler(async (req, res) => {
    const { title, company, location, description, requirements, apply_url } = req.body;
    if (!title || !company || !location || !description || !apply_url) {
      return res.error(400, "Validation Error", "All fields are required.");
    }
    const reqs = Array.isArray(requirements) ? requirements : (requirements ? requirements.split(",").map(r => r.trim()) : []);
    const job = await jobBoardModel.create({
      title,
      company,
      location,
      description,
      requirements: reqs,
      apply_url
    });
    res.success(201, job, "Job post created successfully by admin.");
  });

  adminDeleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const job = await jobBoardModel.findByIdAndDelete(id);
    if (!job) {
      return res.error(404, "Not Found", "Job post not found.");
    }
    res.success(200, null, "Job post deleted successfully by admin.");
  });

  adminGetInterviews = asyncHandler(async (req, res) => {
    const history = await mockInterviewModel.find()
      .populate("user_id", "email")
      .sort({ createdAt: -1 });
    res.success(200, history, "Admin all mock interview history fetched.");
  });
}

export const careerController = new CareerController();
