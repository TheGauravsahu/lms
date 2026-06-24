import { useParams } from "react-router";
import { careerApi } from "@/api/careerApi";
import {
  User,
  ShieldCheck,
  FolderOpen,
  Link as LinkIcon,
  Brain,
  Mail,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";
import Loader2 from "@/components/loading-button";

const GithubIcon = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const PublicProfile = () => {
  const { username } = useParams();
  const { data: profile, isPending, isError } = careerApi.useGetPublicProfile(username);

  if (isPending) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center space-y-3 bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold">Loading learner profile...</span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-4">
        <div className="p-4 bg-red-100 rounded-full text-red-500">
          <User className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-xl font-black">Learner Not Found</h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">This user has not registered a public username yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background select-text pb-12">
      {/* Visual Accent header */}
      <div className="h-44 bg-linear-to-r from-orange-400 to-red-500 w-full" />

      <div className="max-w-4xl mx-auto px-4 -mt-16 space-y-6">
        {/* Profile Info card */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 relative">
          <div className="w-24 h-24 rounded-full bg-linear-to-b from-orange-400 to-red-500 flex items-center justify-center text-white text-4xl font-black shadow-md border-4 border-card -mt-12 md:-mt-16 md:absolute md:left-6">
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 md:pl-28 text-center md:text-left space-y-2 mt-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="font-black text-2xl text-foreground">@{profile.username}</h1>
              <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/10" />
            </div>
            
            <p className="text-sm text-muted-foreground font-semibold max-w-xl">
              {profile.bio || "Software developer studying computer science."}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs font-semibold text-muted-foreground">
              {profile.user_id?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-orange-500" />
                  {profile.user_id.email}
                </span>
              )}
              {profile.user_id?.currentStreak > 0 && (
                <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {profile.user_id.currentStreak} Day Learning Streak
                </span>
              )}
              <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <Award className="w-4 h-4 text-blue-500" />
                {profile.user_id?.xp || 0} XP Earned
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Skills Matrix card */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
              <Brain className="w-4.5 h-4.5 text-orange-500" />
              Skills Matrix
            </h3>
            
            {profile.skills?.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground font-semibold py-4">No skills loaded yet.</div>
            ) : (
              <div className="space-y-4">
                {profile.skills?.map((skill, idx) => {
                  let levelLabel = "Beginner";
                  let levelColor = "bg-blue-500";
                  if (skill.level >= 80) {
                    levelLabel = "Expert";
                    levelColor = "bg-red-500";
                  } else if (skill.level >= 50) {
                    levelLabel = "Intermediate";
                    levelColor = "bg-orange-500";
                  }

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-foreground">{skill.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border">
                        <div
                          className={`h-full ${levelColor} rounded-full`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Projects showcase card */}
          <div className="md:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2 border-b pb-2.5">
              <FolderOpen className="w-4.5 h-4.5 text-orange-500" />
              Completed Projects
            </h3>

            {profile.completed_projects?.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground font-semibold py-8">No showcased projects yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.completed_projects?.map((proj, idx) => (
                  <div key={idx} className="bg-muted/20 border border-border/40 rounded-xl p-4 space-y-3.5 hover:shadow-2xs transition-shadow">
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-foreground">{proj.title}</h4>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>
                    </div>
                    <div className="flex gap-2.5">
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-muted-foreground hover:text-orange-500 flex items-center gap-1 bg-card border border-border/60 px-2 py-0.5 rounded-md"
                        >
                          <GithubIcon className="w-3.5 h-3.5" /> Code
                        </a>
                      )}
                      {proj.demo_url && (
                        <a
                          href={proj.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-muted-foreground hover:text-orange-500 flex items-center gap-1 bg-card border border-border/60 px-2 py-0.5 rounded-md"
                        >
                          <LinkIcon className="w-3 h-3 text-orange-500" /> Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
