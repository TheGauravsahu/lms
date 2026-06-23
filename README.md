# Gaurav LMS - Interactive Developer Learning Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-orange?logo=github)](https://github.com/TheGauravsahu/lms)
[![Author](https://img.shields.io/badge/Author-TheGauravsahu-blue)](https://github.com/TheGauravsahu/)

Gaurav LMS is a premium, developer-first interactive learning platform designed to provide a highly interactive and community-driven educational experience. Built with a modern, minimal warm-charcoal and vibrant orange layout (inspired by ChaiCode and Quyl aesthetics), it prioritizes hands-on learning with rich quiz features, verified buyer reviews, and instant theme toggling.

---

## ✨ Features

### 1. Curated Homepage & AllCourses Browse Portal
* **Curated Landing Page**: Shows a handpicked list of top-featured courses with elegant row headers and visual alignment.
* **Interactive Portal (`/all-courses`)**: Dedicated page featuring real-time client-side search by title and filter chips (All, Trending, New, Featured) for smooth browsing.
* **Premium Cards**: Restyled course cards with rounded-2xl corners, hover zooms, status badges (Trending/New), and gradient CTAs.

### 2. High-Fidelity Interactive Quiz Player
* **Quiz-Wide Countdown Timer**: Shifts stress away from per-question timers to a full-quiz countdown (60 seconds per question) with automatic score calculation and auto-submission.
* **Progress Navigation Matrix**: A visual grid in the sidebar showing Answered/Unanswered states, allowing students to skip, review, and jump between questions.
* **Confirmation Prompts**: Radix UI-based confirmation modal preventing accidental partial submissions.
* **Detailed Results & Review**: Renders a circular progress chart indicating score/percentage and an inline list reviewing each answer options alongside correct highlights and explanation boxes.

### 3. Verified Buyer Reviews & Upsert Flow
* **Verified Purchase Lock**: The review writing block is securely locked only to students who have purchased the course (checked backend and frontend).
* **Edit/Update Flow**: Verified buyers can edit their existing rating and review text at any time. An "Edit Review" button pre-populates their rating and text for resubmission.

### 4. Direct Theme Toggle (No Dropdown)
* **Direct Cycle Toggle**: Instantly toggles between light and dark modes on click with rotating Sun/Moon hover micro-animations, eliminating redundant dropdown selection paths.

### 5. Radix UI Dialog deletes
* Replaced native browser `confirm()` alerts in the Admin Quiz panel with an animated custom confirmation Dialog box.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Core**: React 19, Vite, React Router 7
* **Styling**: TailwindCSS v4, Lucide Icons, Plus Jakarta Sans & Outfit Fonts (via Google Fonts)
* **State & Query**: TanStack React Query v5, Zustand, Axios
* **Components**: Radix UI Primitives, Sonner (Toasts)

### Backend (API)
* **Framework**: Node.js, Express
* **Database**: MongoDB (via Mongoose ODM)
* **Validation**: Zod schema validation
* **Security**: JWT-based Authentication, HTTP-only cookie tokens

---

## 📁 Project Structure

```bash
lms/
├── api/                  # Backend Node.js express API
│   ├── src/
│   │   ├── course/       # Course routing, controllers, schemas
│   │   ├── quiz/         # Quiz models & controllers
│   │   ├── reviews/      # Rating and feedback services
│   │   ├── purchase/     # Purchase check middleware
│   │   ├── middleware/   # Authentication token validators
│   │   └── app.js        # Main express bootstrapper
│   └── package.json
│
└── client/               # Frontend React/Vite app
    ├── src/
    │   ├── api/          # Query hooks (quizApi, reviewApi, progressApi)
    │   ├── components/   # UI components (QuizPlayer, CourseReviews)
    │   ├── pages/        # Route page views (HomePage, AllCourses, Quizzes)
    │   ├── router/       # React Router configurations
    │   ├── index.css     # OKLCH styling configurations
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### 1. API Setup
1. Navigate to the backend directory:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure the environment variables in a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

### 2. Client Setup
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure the API URL in a `.env` file:
   ```env
   VITE_LMS_API_URL=http://localhost:5000/api
   ```
4. Start the Vite server:
   ```bash
   pnpm dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🗺️ Future Feature Roadmap

To continue building Gaurav LMS into an industry-leading educational platform, here is the proposed future roadmap:

### 1. In-Browser Interactive Coding Sandboxes
* **Feature**: Integrate an in-browser code editor (e.g. Monaco Editor used in VS Code) running code sandboxes (using WebContainers or isolated server runtimes).
* **Benefit**: Allows students to write, compile, and debug programming challenges directly inside course modules without installing local developer setups.

### 2. Gamification & Student Leaderboards
* **Feature**: Award Experience Points (XP), achievement badges (e.g., "Quiz Master", "Syllabus Conqueror"), and showcase weekly/monthly student leaderboards.
* **Benefit**: Drives user engagement, consistency, and healthy competition amongst student developer cohorts.

### 3. Peer Code Reviews & Discussion Hubs
* **Feature**: Create specialized spaces for students to post their code submissions for course projects and allow peer reviews, comments, and ratings.
* **Benefit**: Deepens community bonds and simulates real-world developer team workflows.

### 4. Instructor Analytics Console
* **Feature**: Build a comprehensive admin dashboard plotting student course completions, quiz averages, popular drop-off contents, and feedback ratings.
* **Benefit**: Enables content creators to identify weak segments, optimize quiz difficulties, and address student learning obstacles.

### 5. Automated Certificate Generation & Verification
* **Feature**: Automatically generate PDF/SVG certificates upon 100% course progress, offering a verifiable link (hash) that students can share on LinkedIn.
* **Benefit**: Increases credential legitimacy and boosts platform word-of-mouth branding.
