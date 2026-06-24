import { useState, useEffect } from "react";
import { careerApi } from "@/api/careerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Loader2,
  Printer,
  Sparkles,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

const ResumeBuilder = () => {
  const { data: profile, isPending } = careerApi.useGetProfile();
  const updateProfileMutation = careerApi.useUpdateProfile();

  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");

  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);

  useEffect(() => {
    if (profile?.resume) {
      setContactEmail(profile.resume.contactEmail || "");
      setPhoneNumber(profile.resume.phoneNumber || "");
      setLinkedin(profile.resume.socialLinks?.linkedin || "");
      setGithub(profile.resume.socialLinks?.github || "");
      setTwitter(profile.resume.socialLinks?.twitter || "");
      setExperience(profile.resume.experience || []);
      setEducation(profile.resume.education || []);
    }
  }, [profile]);

  if (isPending) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const handleAddExperience = () => {
    setExperience([...experience, { role: "", company: "", duration: "", description: "" }]);
  };

  const handleRemoveExperience = (idx) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const handleExpChange = (idx, field, val) => {
    const updated = [...experience];
    updated[idx][field] = val;
    setExperience(updated);
  };

  const handleAddEducation = () => {
    setEducation([...education, { degree: "", school: "", year: "" }]);
  };

  const handleRemoveEducation = (idx) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const handleEduChange = (idx, field, val) => {
    const updated = [...education];
    updated[idx][field] = val;
    setEducation(updated);
  };

  const handleSaveResume = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      resume: {
        contactEmail,
        phoneNumber,
        socialLinks: { linkedin, github, twitter },
        experience: experience.filter((exp) => exp.role.trim() && exp.company.trim()),
        education: education.filter((edu) => edu.degree.trim() && edu.school.trim()),
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print styles injected directly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything except the resume paper */
          body * {
            visibility: hidden;
          }
          #resume-paper, #resume-paper * {
            visibility: visible;
          }
          #resume-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          /* Hide scrollbars or side margins */
          @page {
            margin: 1.5cm;
          }
        }
      ` }} />

      {/* Builder Header Controls */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground flex items-center gap-2">
              Resume Builder
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Compile your education, work experience, and course accomplishments into a clean printable resume.
            </p>
          </div>
        </div>

        <Button
          onClick={handlePrint}
          className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 h-10 px-4 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column: input form */}
        <div className="space-y-6 print:hidden">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <User className="w-4.5 h-4.5 text-orange-500" />
              <h3 className="font-extrabold text-sm text-foreground">Contact & Links</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Contact Email</Label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="rounded-xl bg-input/50 text-xs focus-visible:ring-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rounded-xl bg-input/50 text-xs focus-visible:ring-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">LinkedIn Profile URL</Label>
                <Input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="rounded-xl bg-input/50 text-xs focus-visible:ring-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">GitHub Profile URL</Label>
                <Input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="github.com/username"
                  className="rounded-xl bg-input/50 text-xs focus-visible:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Work Experience Form */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-orange-500" />
                <h3 className="font-extrabold text-sm text-foreground">Work Experience</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddExperience}
                className="text-[10px] font-black h-7 rounded-lg border-orange-500/20 text-orange-600 hover:bg-orange-50"
              >
                + Add Work
              </Button>
            </div>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="bg-muted/20 border rounded-xl p-4 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground">Work Position #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Role (e.g. Frontend Intern)"
                      value={exp.role}
                      onChange={(e) => handleExpChange(idx, "role", e.target.value)}
                      className="bg-card text-xs rounded-lg"
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => handleExpChange(idx, "company", e.target.value)}
                      className="bg-card text-xs rounded-lg"
                    />
                    <Input
                      placeholder="Duration (e.g. 2024 - 2025)"
                      value={exp.duration}
                      onChange={(e) => handleExpChange(idx, "duration", e.target.value)}
                      className="bg-card text-xs rounded-lg"
                    />
                  </div>
                  <Textarea
                    placeholder="Short description of achievements..."
                    value={exp.description}
                    onChange={(e) => handleExpChange(idx, "description", e.target.value)}
                    className="bg-card text-xs rounded-lg min-h-[60px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education Form */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-orange-500" />
                <h3 className="font-extrabold text-sm text-foreground">Education</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEducation}
                className="text-[10px] font-black h-7 rounded-lg border-orange-500/20 text-orange-600 hover:bg-orange-50"
              >
                + Add Education
              </Button>
            </div>

            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-muted/20 border rounded-xl p-4 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground">Degree #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Degree / Course"
                      value={edu.degree}
                      onChange={(e) => handleEduChange(idx, "degree", e.target.value)}
                      className="bg-card text-xs rounded-lg"
                    />
                    <Input
                      placeholder="School / University"
                      value={edu.school}
                      onChange={(e) => handleEduChange(idx, "school", e.target.value)}
                      className="bg-card text-xs rounded-lg"
                    />
                    <Input
                      placeholder="Graduation Year"
                      value={edu.year}
                      onChange={(e) => handleEduChange(idx, "year", e.target.value)}
                      className="bg-card text-xs rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={handleSaveResume}
              disabled={updateProfileMutation.isPending}
              className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold px-6 text-xs h-10 flex items-center gap-1.5"
            >
              {updateProfileMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Resume Data
            </Button>
          </div>
        </div>

        {/* Right column: Print Preview Paper */}
        <div id="resume-paper" className="bg-white border rounded-2xl p-8 shadow-sm text-black font-sans space-y-6 max-h-[85vh] overflow-y-auto select-text">
          {/* Header section */}
          <div className="text-center space-y-2 border-b pb-4 border-slate-300">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800">
              {profile?.username ? profile.username.replace(/_/g, " ").toUpperCase() : "STUDENT NAME"}
            </h2>
            <div className="text-xs text-slate-500 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {contactEmail && <span>{contactEmail}</span>}
              {phoneNumber && <span>{phoneNumber}</span>}
              {linkedin && <span>LinkedIn: {linkedin}</span>}
              {github && <span>GitHub: {github}</span>}
            </div>
          </div>

          {/* Profile Overview */}
          {profile?.bio && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-0.5 border-slate-200">
                Summary
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Experience list */}
          {experience.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-0.5 border-slate-200">
                Experience
              </h4>
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>{exp.role} @ {exp.company}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{exp.duration}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education list */}
          {education.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-0.5 border-slate-200">
                Education
              </h4>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>{edu.degree} — {edu.school}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills tags */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-0.5 border-slate-200">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600 font-medium leading-relaxed">
                {profile.skills.map((s) => s.name).join(", ")}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {profile?.completed_projects && profile.completed_projects.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-0.5 border-slate-200">
                Projects Showcase
              </h4>
              <div className="space-y-2">
                {profile.completed_projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">{proj.title}</span>
                    <p className="text-xs text-slate-600 leading-normal">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
