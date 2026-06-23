import { studentApi } from "@/api/studentApi";
import { authApi } from "@/api/authApi";
import {
  Trophy,
  Award,
  Zap,
  Lock,
  Sparkles,
  Crown,
  CheckCircle2,
  Terminal,
  BookOpen,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

// List of all active achievements/badges and descriptions
const BADGES_LIST = [
  {
    id: "Code Explorer",
    name: "Code Explorer",
    description: "Run your first script in the JavaScript Sandbox.",
    icon: Terminal,
    color: "from-cyan-500 to-blue-600",
    xp: 15,
  },
  {
    id: "Web Creator",
    name: "Web Creator",
    description: "Build and run a layout using the HTML/CSS Sandbox.",
    icon: Sparkles,
    color: "from-purple-500 to-indigo-600",
    xp: 20,
  },
  {
    id: "Quiz Champion",
    name: "Quiz Champion",
    description: "Pass any quiz with a score of 70% or higher.",
    icon: Crown,
    color: "from-amber-400 to-orange-500",
    xp: 100,
  },
  {
    id: "Quiz Taker",
    name: "Quiz Taker",
    description: "Complete your first quiz attempt.",
    icon: HelpCircle,
    color: "from-emerald-400 to-teal-500",
    xp: 50,
  },
  {
    id: "Course Reviewer",
    name: "Course Reviewer",
    description: "Write and submit a verified review for a course.",
    icon: MessageSquare,
    color: "from-pink-500 to-rose-600",
    xp: 30,
  },
  {
    id: "Knowledge Seeker",
    name: "Knowledge Seeker",
    description: "Complete a course lecture, video, or reading item.",
    icon: BookOpen,
    color: "from-orange-400 to-red-500",
    xp: 20,
  },
];

export const Leaderboard = () => {
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } =
    studentApi.useGetLeaderboard();
  const { data: userStats, isLoading: isUserLoading } =
    authApi.useGetAccountDetails();

  // Find user's position in the overall leaderboard
  const userRank = userStats
    ? leaderboard.findIndex((item) => item.email === userStats.email) + 1
    : 0;

  // Split top 3 for podium
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const remainingLeaders = leaderboard.slice(3);

  const getPodiumBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-amber-400 text-amber-950 border-amber-300";
      case 2:
        return "bg-slate-300 text-slate-900 border-slate-200";
      case 3:
        return "bg-amber-600 text-amber-50 border-amber-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRankIndicator = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />;
      case 2:
        return <Trophy className="w-5 h-5 text-slate-300 fill-slate-300" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600 fill-amber-600" />;
      default:
        return <span className="text-sm font-black text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLeaderboardLoading || isUserLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-card border rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-64 bg-card border rounded-2xl" />
            <div className="h-48 bg-card border rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-56 bg-card border rounded-2xl" />
            <div className="h-96 bg-card border rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Title Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg border border-orange-400/25">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-orange-200 text-xs font-semibold tracking-wider uppercase">
              <Trophy className="w-4 h-4" />
              Gamification & Rankings
            </div>
            <h1 className="text-3xl font-black tracking-tight">Arena Leaderboard</h1>
            <p className="text-orange-100 text-xs md:text-sm max-w-lg leading-relaxed">
              Earn XP and unlock profile badges by completing quizzes, writing reviews, completing lessons, and solving sandbox code scripts!
            </p>
          </div>

          {/* User Score Summary Card */}
          {userStats && (
            <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0 flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-lg text-white">
                <Zap className="w-6 h-6 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">Your Total XP</div>
                <div className="text-2xl font-black leading-none">{userStats.xp || 0} XP</div>
                <div className="text-xs text-orange-100 mt-1 font-medium">
                  {userRank > 0 ? (
                    <>Ranked <span className="font-bold text-white">#{userRank}</span> overall</>
                  ) : (
                    "Unranked (Start earning XP!)"
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Podium and Rankings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Podium for top 3 */}
          {leaderboard.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                <Crown className="w-4 h-4 text-orange-500" /> Top Contenders
              </h3>

              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-2 pt-6 pb-2">
                {/* 2nd Place */}
                {top2 && (
                  <div className="flex flex-col items-center w-full sm:w-1/3 order-2 sm:order-1">
                    <div className="relative group flex flex-col items-center mb-3">
                      <div className="w-16 h-16 rounded-full border-3 border-slate-300 bg-secondary flex items-center justify-center font-black text-slate-700 text-lg shadow-sm">
                        {top2.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="absolute -bottom-1 bg-slate-300 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                        2nd
                      </div>
                    </div>
                    <span className="font-bold text-foreground text-sm text-center truncate w-full px-2">{top2.name}</span>
                    <span className="text-xs text-muted-foreground font-semibold mt-0.5">{top2.xp} XP</span>
                    {/* Pedestal block */}
                    <div className="hidden sm:block w-full h-16 bg-slate-100 dark:bg-muted border border-border border-b-0 rounded-t-xl mt-4 relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1 bg-slate-300" />
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {top1 && (
                  <div className="flex flex-col items-center w-full sm:w-1/3 order-1 sm:order-2 z-10">
                    <div className="relative group flex flex-col items-center mb-3 scale-110 sm:scale-115">
                      <Crown className="absolute -top-6 w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-md animate-bounce" />
                      <div className="w-18 h-18 rounded-full border-4 border-amber-400 bg-amber-500/10 flex items-center justify-center font-black text-amber-500 text-xl shadow-md">
                        {top1.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="absolute -bottom-1 bg-amber-400 text-amber-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                        1st
                      </div>
                    </div>
                    <span className="font-black text-foreground text-base text-center truncate w-full px-2">{top1.name}</span>
                    <span className="text-xs font-bold text-orange-500 mt-0.5">{top1.xp} XP</span>
                    {/* Pedestal block */}
                    <div className="hidden sm:block w-full h-24 bg-orange-50 dark:bg-orange-950/10 border border-orange-500/20 border-b-0 rounded-t-xl mt-4 relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3 && (
                  <div className="flex flex-col items-center w-full sm:w-1/3 order-3">
                    <div className="relative group flex flex-col items-center mb-3">
                      <div className="w-16 h-16 rounded-full border-3 border-amber-600 bg-secondary flex items-center justify-center font-black text-amber-800 text-lg shadow-sm">
                        {top3.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="absolute -bottom-1 bg-amber-600 text-amber-50 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                        3rd
                      </div>
                    </div>
                    <span className="font-bold text-foreground text-sm text-center truncate w-full px-2">{top3.name}</span>
                    <span className="text-xs text-muted-foreground font-semibold mt-0.5">{top3.xp} XP</span>
                    {/* Pedestal block */}
                    <div className="hidden sm:block w-full h-12 bg-slate-50 dark:bg-muted/80 border border-border border-b-0 rounded-t-xl mt-4 relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1 bg-amber-600" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* List of remaining ranks */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Leaderboard Rankings
              </h3>
            </div>

            <div className="divide-y divide-border/50">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No students ranked yet. Start completing tasks to show up here!
                </div>
              ) : (
                leaderboard.map((student, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser = userStats?.email === student.email;
                  return (
                    <div
                      key={student._id || idx}
                      className={`flex items-center justify-between p-4 transition-colors ${
                        isCurrentUser ? "bg-orange-500/5 dark:bg-orange-500/10 font-medium" : "hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank indicator */}
                        <div className="w-8 flex justify-center shrink-0">
                          {getRankIndicator(rank)}
                        </div>

                        {/* Initial badge / Avatar */}
                        <div className="w-10 h-10 rounded-full bg-secondary text-foreground text-xs font-bold flex items-center justify-center shrink-0 border border-border/60">
                          {student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>

                        {/* Name & Badges */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground truncate max-w-[140px] sm:max-w-[200px]">
                              {student.name}
                            </span>
                            {isCurrentUser && (
                              <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.badges && student.badges.slice(0, 3).map((badge, bIdx) => (
                              <span
                                key={bIdx}
                                className="text-[9px] font-bold bg-muted text-muted-foreground border px-1.5 py-0.5 rounded-full"
                              >
                                {badge}
                              </span>
                            ))}
                            {student.badges && student.badges.length > 3 && (
                              <span className="text-[9px] font-bold text-muted-foreground px-1 py-0.5">
                                +{student.badges.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* XP Indicator */}
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <span className="text-sm font-black text-foreground">{student.xp || 0}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">XP</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Badges checklist */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Achievement progress */}
          {userStats && (
            <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" /> Achievement Badges
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  You unlocked {userStats.badges?.length || 0} of {BADGES_LIST.length} total badges.
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${((userStats.badges?.length || 0) / BADGES_LIST.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mt-1.5">
                  <span>Progress</span>
                  <span>
                    {Math.round(((userStats.badges?.length || 0) / BADGES_LIST.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Badges Grid Checklist */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-foreground mb-4">Badges Directory</h3>

            <div className="space-y-4">
              {BADGES_LIST.map((badge) => {
                const hasUnlocked = userStats?.badges?.includes(badge.id);
                const IconComponent = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      hasUnlocked
                        ? "bg-secondary/15 border-border/80"
                        : "bg-muted/10 border-border/40 opacity-70"
                    }`}
                  >
                    {/* Badge Icon */}
                    <div
                      className={`p-2.5 rounded-lg text-white bg-linear-to-br shrink-0 ${
                        hasUnlocked ? badge.color : "from-slate-400 to-slate-500 grayscale"
                      }`}
                    >
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${hasUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                          {badge.name}
                        </span>
                        {hasUnlocked ? (
                          <span className="text-emerald-500 flex items-center gap-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-white" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-0.5 text-[10px] font-bold">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="bg-orange-500/10 text-orange-500 text-[8px] font-black px-1.5 py-0.2 rounded-md">
                          +{badge.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
