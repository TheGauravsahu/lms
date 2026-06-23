export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Gaurav LMS API",
    version: "1.0.0",
    description:
      "REST API for the Gaurav Learning Management System. Handles authentication, courses, students, purchases, uploads, and admin dashboard.",
    contact: {
      name: "Gaurav LMS Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development Server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication & account management" },
    { name: "Courses", description: "Course listing, details, search" },
    { name: "Course Folders", description: "Course folder CRUD" },
    { name: "Course Content", description: "Course content CRUD" },
    { name: "Purchases", description: "Course purchase & purchase history" },
    { name: "Students", description: "Admin — Student account management" },
    { name: "Admin", description: "Admin — Dashboard & analytics" },
    { name: "Uploads", description: "File upload management" },
    { name: "Health", description: "Server health check" },
    { name: "Announcements", description: "Course and global announcements" },
    { name: "Productivity", description: "Calendar, Watch Later, Playback Tracking, Resources" },
    { name: "Search", description: "Global unified search" },
    { name: "AI", description: "AI Tutor, notes, quizzes, roadmaps" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT access token obtained from /auth/login",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          data: { type: "object", nullable: true },
          message: { type: "string", example: "Operation successful." },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 400 },
          error: { type: "object" },
          message: { type: "string", example: "Validation failed." },
        },
      },
      Course: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          thumbnail: { type: "object", properties: { url: { type: "string" } } },
          validity: { type: "integer" },
          offer_price: { type: "number" },
          original_price: { type: "number" },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          is_trending: { type: "boolean" },
          is_new: { type: "boolean" },
          is_featured: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Student: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          mobile_no: { type: "string" },
          email: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER"] },
          status: { type: "string", enum: ["ACTIVE", "BLOCKED", "ARCHIVED", "UNVERIFIED"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Purchase: {
        type: "object",
        properties: {
          _id: { type: "string" },
          account_id: { type: "string" },
          course_id: { type: "string" },
          base_price: { type: "number" },
          gst_percentage: { type: "number" },
          gst_amount: { type: "number" },
          total_price: { type: "number" },
          status: { type: "string", enum: ["COMPLETED", "PENDING", "FAILED"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server is running",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
        },
      },
    },

    // ─── Auth ───────────────────────────────────────────────────────
    "/auth/send-otp": {
      post: {
        tags: ["Auth"],
        summary: "Send OTP to mobile number",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mobile_no"],
                properties: { mobile_no: { type: "string", example: "9876543210" } },
              },
            },
          },
        },
        responses: {
          200: { description: "OTP sent successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "mobile_no", "otp"],
                properties: {
                  name: { type: "string" },
                  mobile_no: { type: "string" },
                  otp: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Account created" },
          400: { description: "Validation or OTP error" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mobile_no", "otp"],
                properties: {
                  mobile_no: { type: "string" },
                  otp: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful, returns JWT token" },
          401: { description: "Invalid OTP" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user data" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (invalidate token version)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/update-profile": {
      put: {
        tags: ["Auth"],
        summary: "Update profile (name, email)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Profile updated" } },
      },
    },

    // ─── Courses ────────────────────────────────────────────────────
    "/courses/all-courses": {
      get: {
        tags: ["Courses"],
        summary: "Get all published courses",
        responses: {
          200: {
            description: "List of courses",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Course" } } } },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/courses/course-details": {
      post: {
        tags: ["Courses"],
        summary: "Get full course details (overview + folders)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course_id"],
                properties: { course_id: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Course details" } },
      },
    },
    "/courses/search-course": {
      get: {
        tags: ["Courses"],
        summary: "Search courses by title",
        parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Matching courses" } },
      },
    },
    "/courses/create-course": {
      post: {
        tags: ["Courses"],
        summary: "Create a new course (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "thumbnail", "validity", "offer_price", "original_price", "status"],
                properties: {
                  title: { type: "string" },
                  thumbnail: { type: "string", description: "Upload ID" },
                  validity: { type: "integer" },
                  offer_price: { type: "number" },
                  original_price: { type: "number" },
                  status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Course created" } },
      },
    },
    "/courses/edit-course": {
      put: {
        tags: ["Courses"],
        summary: "Edit course details (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course_id", "edit"],
                properties: {
                  course_id: { type: "string" },
                  edit: { type: "object", description: "Fields to update (title, prices, status, flags, etc.)" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Course updated" } },
      },
    },
    "/courses/delete-course": {
      delete: {
        tags: ["Courses"],
        summary: "Delete a course with all its folders and content (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course_id"],
                properties: { course_id: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Course deleted" },
          404: { description: "Course not found" },
        },
      },
    },

    // ─── Course Folders ─────────────────────────────────────────────
    "/courses/course-folders": {
      post: {
        tags: ["Course Folders"],
        summary: "Get all folders for a course",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course_id"],
                properties: {
                  course_id: { type: "string" },
                  parent_id: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Folders list" } },
      },
    },
    "/courses/create-course-folder": {
      post: {
        tags: ["Course Folders"],
        summary: "Create a course folder (Admin)",
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Folder created" } },
      },
    },

    // ─── Purchases ──────────────────────────────────────────────────
    "/purchases/purchase-course": {
      post: {
        tags: ["Purchases"],
        summary: "Purchase a course",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course_id"],
                properties: { course_id: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Purchase completed" }, 400: { description: "Already purchased" } },
      },
    },
    "/purchases/my-purchased-courses": {
      get: {
        tags: ["Purchases"],
        summary: "Get all courses purchased by current user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Purchased courses list" } },
      },
    },
    "/purchases/check-purchase": {
      post: {
        tags: ["Purchases"],
        summary: "Check if a course is purchased by current user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["course_id"],
                properties: { course_id: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Returns { isPurchased: boolean }" } },
      },
    },

    // ─── Students ───────────────────────────────────────────────────
    "/students": {
      get: {
        tags: ["Students"],
        summary: "List all students (Admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of students",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Student" } } } },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Students"],
        summary: "Create a student account (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "mobile_no"],
                properties: {
                  name: { type: "string" },
                  mobile_no: { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Student created" }, 400: { description: "Duplicate or validation error" } },
      },
    },
    "/students/{id}": {
      put: {
        tags: ["Students"],
        summary: "Update a student account (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  mobile_no: { type: "string" },
                  email: { type: "string" },
                  status: { type: "string", enum: ["ACTIVE", "BLOCKED", "ARCHIVED", "UNVERIFIED"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Student updated" }, 404: { description: "Student not found" } },
      },
      delete: {
        tags: ["Students"],
        summary: "Delete a student account (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Student deleted" }, 404: { description: "Student not found" } },
      },
    },

    // ─── Admin ──────────────────────────────────────────────────────
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Get dashboard stats (students, courses, revenue, chart data) (Admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Dashboard statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    stats: {
                      type: "object",
                      properties: {
                        totalStudents: { type: "integer" },
                        totalCourses: { type: "integer" },
                        totalPurchases: { type: "integer" },
                        totalRevenue: { type: "number" },
                      },
                    },
                    monthlyChart: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          month: { type: "string", example: "2025-01" },
                          sales: { type: "integer" },
                          revenue: { type: "number" },
                        },
                      },
                    },
                    recentPurchases: { type: "array", items: { $ref: "#/components/schemas/Purchase" } },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── Uploads ────────────────────────────────────────────────────
    "/uploads/upload-file": {
      post: {
        tags: ["Uploads"],
        summary: "Upload a file (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                  course_id: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "File uploaded, returns upload record with URL" } },
      },
    },
    "/uploads/recent-uploads": {
      get: {
        tags: ["Uploads"],
        summary: "Get 5 most recent uploads (Admin)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Recent uploads list" } },
      },
    },

    // ─── Announcements ──────────────────────────────────────────────
    "/announcements": {
      get: {
        tags: ["Announcements"],
        summary: "Fetch announcements for authenticated user/admin",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Announcements list" } },
      },
      post: {
        tags: ["Announcements"],
        summary: "Create a course-specific or global announcement (Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "body"],
                properties: {
                  title: { type: "string" },
                  body: { type: "string" },
                  courseId: { type: "string", description: "Target course ID, omit for global" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Announcement created" } },
      },
    },
    "/announcements/{id}": {
      delete: {
        tags: ["Announcements"],
        summary: "Delete an announcement (Admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Announcement deleted" } },
      },
    },

    // ─── Productivity ───────────────────────────────────────────────
    "/productivity/calendar": {
      get: {
        tags: ["Productivity"],
        summary: "Get user calendar tasks, deadlines and reminders",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of calendar tasks" } },
      },
      post: {
        tags: ["Productivity"],
        summary: "Create a calendar task / reminder / deadline",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "dueDate"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string", enum: ["deadline", "reminder", "event"] },
                  dueDate: { type: "string", format: "date-time" },
                  courseId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Event created" } },
      },
    },
    "/productivity/calendar/{id}": {
      put: {
        tags: ["Productivity"],
        summary: "Update or complete a calendar task / reminder",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { 200: { description: "Event updated" } },
      },
      delete: {
        tags: ["Productivity"],
        summary: "Delete a calendar task",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Event deleted" } },
      },
    },
    "/productivity/watch-later": {
      get: {
        tags: ["Productivity"],
        summary: "Get watch later items list",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Watch later list" } },
      },
      post: {
        tags: ["Productivity"],
        summary: "Add content to watch later",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["contentId"],
                properties: { contentId: { type: "string" } },
              },
            },
          },
        },
        responses: { 201: { description: "Added to watch later" } },
      },
    },
    "/productivity/watch-later/{contentId}": {
      delete: {
        tags: ["Productivity"],
        summary: "Remove from watch later",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "contentId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Removed from watch later" } },
      },
    },
    "/productivity/video-progress": {
      get: {
        tags: ["Productivity"],
        summary: "Fetch active playback progress (Continue Watching)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Continue watching progresses" } },
      },
      post: {
        tags: ["Productivity"],
        summary: "Update video playback progress state",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["contentId", "courseId", "playbackTime", "duration"],
                properties: {
                  contentId: { type: "string" },
                  courseId: { type: "string" },
                  playbackTime: { type: "number" },
                  duration: { type: "number" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Playback position saved" } },
      },
    },
    "/productivity/resources": {
      get: {
        tags: ["Productivity"],
        summary: "centralized downloadable PDF resources lists for enrolled courses",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Resources lists" } },
      },
    },

    // ─── Search ─────────────────────────────────────────────────────
    "/search/global": {
      get: {
        tags: ["Search"],
        summary: "Global unified query search across courses contents, quizzes and forums",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Unified search results" } },
      },
    },

    // ─── AI ─────────────────────────────────────────────────────────
    "/ai/tutor/sessions": {
      get: {
        tags: ["AI"],
        summary: "Get chat sessions list",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Chat sessions list" } },
      },
    },
    "/ai/tutor/sessions/{id}": {
      get: {
        tags: ["AI"],
        summary: "Get single session details",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Session details" } },
      },
      delete: {
        tags: ["AI"],
        summary: "Delete a session",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Session deleted" } },
      },
    },
    "/ai/tutor/chat": {
      post: {
        tags: ["AI"],
        summary: "Send a message / start chat",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  sessionId: { type: "string" },
                  message: { type: "string" },
                  lessonId: { type: "string" },
                  lessonTitle: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "AI reply generated" } },
      },
    },
    "/ai/notes": {
      post: {
        tags: ["AI"],
        summary: "Generate study notes",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["lessonTitle"],
                properties: {
                  lessonTitle: { type: "string" },
                  context: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Study notes generated" } },
      },
    },
    "/ai/quiz": {
      post: {
        tags: ["AI"],
        summary: "Generate MCQs practice quiz",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["lessonTitle"],
                properties: {
                  lessonTitle: { type: "string" },
                  context: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Quiz generated" } },
      },
    },
    "/ai/roadmap": {
      get: {
        tags: ["AI"],
        summary: "Get user saved roadmaps",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Roadmaps list" } },
      },
      post: {
        tags: ["AI"],
        summary: "Generate and save a roadmap",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["goal"],
                properties: {
                  goal: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Roadmap generated" } },
      },
    },
    "/ai/roadmap/{id}": {
      delete: {
        tags: ["AI"],
        summary: "Delete a saved roadmap",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Roadmap deleted" } },
      },
    },
  },
};
