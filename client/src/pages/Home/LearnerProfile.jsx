import { useState, useEffect } from "react";
import { careerApi } from "@/api/careerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Sparkles,
  Plus,
  Trash2,
  FolderOpen,
  Globe,
  Award,
  Link as LinkIcon,
  ShieldCheck,
  Brain,
  Edit3,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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

const LearnerProfile = () => {
  const { data: profile, isPending } = careerApi.useGetProfile();
  const updateProfileMutation = careerApi.useUpdateProfile();

  const [activeTab, setActiveTab] = useState("portfolio"); // 'portfolio' | 'skills' | 'edit'

  // Edit profile form states
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);

  // Copy link helper
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
      setProjects(profile.completed_projects || []);
    }
  }, [profile]);

  if (isPending) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/career/profile/public/${profile?.username}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    toast.success("Public portfolio link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddProject = () => {
    setProjects([...projects, { title: "", description: "", github_url: "", demo_url: "" }]);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleAddSkill = () => {
    setSkills([...skills, { name: "", level: 50 }]);
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!username.trim()) return toast.error("Username is required");

    updateProfileMutation.mutate(
      {
        username,
        bio,
        skills: skills.filter((s) => s.name.trim()),
        completed_projects: projects.filter((p) => p.title.trim() && p.description.trim()),
      },
      {
        onSuccess: () => {
          setActiveTab("portfolio");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-col md:flex-row text-center md:text-left z-10">
          <div className="w-20 h-20 rounded-full bg-linear-to-b from-orange-400 to-red-500 flex items-center justify-center text-white text-3xl font-black shadow-md border-4 border-card">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="font-black text-2xl text-foreground flex items-center justify-center md:justify-start gap-2">
              @{profile?.username}
              <ShieldCheck className="w-5 h-5 text-orange-500 fill-orange-500/10" />
            </h1>
            <p className="text-xs text-muted-foreground font-semibold max-w-md">
              {profile?.bio || "Learning development and engineering on Gaurav LMS!"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 z-10 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleCopyPublicLink}
            className="rounded-xl text-xs font-bold border-border/80 flex items-center justify-center gap-1.5 h-10 px-4"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Globe className="w-3.5 h-3.5 text-orange-500" />}
            Share Portfolio
          </Button>
          <Button
            onClick={() => setActiveTab("edit")}
            className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 px-4"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-xs space-y-1.5">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === "portfolio"
                ? "bg-orange-500/10 text-orange-600 font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <FolderOpen className="w-4 h-4 text-orange-500" />
            Projects Showcase
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === "skills"
                ? "bg-orange-500/10 text-orange-600 font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Brain className="w-4 h-4 text-orange-500" />
            Skills Matrix
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === "edit"
                ? "bg-orange-500/10 text-orange-600 font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Edit3 className="w-4 h-4 text-orange-500" />
            Configure Portfolio
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3">
          {activeTab === "portfolio" && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-border/40 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Completed Projects</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Showcase your applications and coding products</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("edit")}
                  className="rounded-lg text-[10px] font-bold border-orange-500/20 text-orange-600 hover:bg-orange-50 h-7 px-2.5"
                >
                  Manage Projects
                </Button>
              </div>

              {profile?.completed_projects?.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground font-semibold">
                  No projects added yet. Click "Configure Portfolio" to showcase your developer projects!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.completed_projects?.map((proj, idx) => (
                    <div key={idx} className="bg-muted/10 border border-border/40 rounded-xl p-5 space-y-4 hover:shadow-2xs transition-shadow">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">{proj.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-muted-foreground hover:text-orange-500 flex items-center gap-1 bg-card border border-border/60 px-2.5 py-1 rounded-lg"
                          >
                            <GithubIcon className="w-3.5 h-3.5" /> Code repo
                          </a>
                        )}
                        {proj.demo_url && (
                          <a
                            href={proj.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-muted-foreground hover:text-orange-500 flex items-center gap-1 bg-card border border-border/60 px-2.5 py-1 rounded-lg"
                          >
                            <LinkIcon className="w-3.5 h-3.5 text-orange-500" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-border/40 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Skills Matrix</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Visual tracking of your engineering competencies</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("edit")}
                  className="rounded-lg text-[10px] font-bold border-orange-500/20 text-orange-600 hover:bg-orange-50 h-7 px-2.5"
                >
                  Manage Skills
                </Button>
              </div>

              {profile?.skills?.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground font-semibold">
                  No skills entered. Click "Configure Portfolio" to populate your matrix scores!
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  {profile?.skills?.map((skill, idx) => {
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
                          <span className="text-muted-foreground">
                            {skill.level}% ({levelLabel})
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
                          <div
                            className={`h-full ${levelColor} rounded-full transition-all duration-500`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "edit" && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs">
              <div className="border-b border-border/40 pb-3 mb-5">
                <h3 className="font-extrabold text-sm text-foreground">Configure Portfolio</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Update biography data, skills lists, and completed products</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="username"
                      className="rounded-xl bg-input/50 focus-visible:ring-orange-500 text-xs h-10 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Biography</Label>
                    <Input
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Passionate backend Node.js developer"
                      className="rounded-xl bg-input/50 focus-visible:ring-orange-500 text-xs h-10 font-semibold"
                    />
                  </div>
                </div>

                {/* Skills Management */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black text-foreground uppercase tracking-wider">Skills Competency List</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSkill}
                      className="text-[10px] font-black h-7 rounded-lg border-orange-500/20 text-orange-600 hover:bg-orange-50 cursor-pointer"
                    >
                      + Add Skill
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-muted/20 border p-3.5 rounded-xl animate-in fade-in duration-200">
                        <div className="flex-1">
                          <Input
                            placeholder="Skill (e.g. Node.js)"
                            value={skill.name}
                            onChange={(e) => handleSkillChange(idx, "name", e.target.value)}
                            className="bg-card rounded-lg text-xs"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Level %"
                            value={skill.level}
                            onChange={(e) => handleSkillChange(idx, "level", parseInt(e.target.value) || 0)}
                            className="bg-card rounded-lg text-xs"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Management */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black text-foreground uppercase tracking-wider">Completed Projects</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddProject}
                      className="text-[10px] font-black h-7 rounded-lg border-orange-500/20 text-orange-600 hover:bg-orange-50 cursor-pointer"
                    >
                      + Add Project
                    </Button>
                  </div>

                  <div className="space-y-3.5">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="bg-muted/20 border border-border/40 rounded-xl p-4 space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-muted-foreground">Project #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Project Title"
                            value={proj.title}
                            onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                            className="bg-card rounded-lg text-xs"
                            required
                          />
                          <Input
                            placeholder="Description"
                            value={proj.description}
                            onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                            className="bg-card rounded-lg text-xs"
                            required
                          />
                          <Input
                            placeholder="GitHub Repository URL"
                            value={proj.github_url}
                            onChange={(e) => handleProjectChange(idx, "github_url", e.target.value)}
                            className="bg-card rounded-lg text-xs"
                          />
                          <Input
                            placeholder="Live Demo URL"
                            value={proj.demo_url}
                            onChange={(e) => handleProjectChange(idx, "demo_url", e.target.value)}
                            className="bg-card rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setActiveTab("portfolio")}
                    className="rounded-xl text-xs font-bold"
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold px-5 text-xs flex items-center gap-1.5"
                  >
                    {updateProfileMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Portfolio
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { Loader2 } from "lucide-react";
export default LearnerProfile;
