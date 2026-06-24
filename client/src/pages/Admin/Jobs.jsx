import { useState } from "react";
import { careerApi } from "@/api/careerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Plus,
  Trash2,
  MapPin,
  Building,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminJobs = () => {
  const { data: jobs, isPending } = careerApi.useGetJobs();
  const createJobMutation = careerApi.useAdminCreateJob();
  const deleteJobMutation = careerApi.useAdminDeleteJob();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    createJobMutation.mutate(
      {
        title,
        company,
        location,
        description,
        requirements,
        apply_url: applyUrl,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          // reset form
          setTitle("");
          setCompany("");
          setLocation("");
          setDescription("");
          setRequirements("");
          setApplyUrl("");
        },
      }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      deleteJobMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 select-text p-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground">Manage Internships & Jobs</h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Post, edit, and delete corporate job vacancies and internships visible on the student board.
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 h-10 px-4 cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Job Posting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl border-border/50 bg-card p-6">
            <DialogHeader>
              <DialogTitle className="font-black text-lg text-foreground">Create Job Listing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Job Title</Label>
                <Input
                  required
                  placeholder="e.g. Node.js Backend Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Company</Label>
                  <Input
                    required
                    placeholder="e.g. Amazon"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Location</Label>
                  <Input
                    required
                    placeholder="e.g. Pune, India (Hybrid)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Description</Label>
                <Textarea
                  required
                  placeholder="Summarize the core day-to-day responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl text-xs min-h-[80px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Requirements (comma-separated)</Label>
                <Input
                  placeholder="e.g. Node.js, Mongoose, REST, Docker"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Application / Careers URL</Label>
                <Input
                  required
                  type="url"
                  placeholder="https://company.com/careers"
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createJobMutation.isPending}
                  className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs"
                >
                  {createJobMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  Create Posting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List of jobs */}
      {isPending ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-xs text-muted-foreground font-semibold">Loading job listings...</span>
        </div>
      ) : jobs?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center text-xs text-muted-foreground font-semibold">
          No job vacancy listings found. Add your first job posting above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <div
              key={job._id}
              className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xs transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground leading-tight">{job.title}</h3>
                    <p className="text-[10px] text-orange-500 font-extrabold flex items-center gap-1 mt-1">
                      <Building className="w-3 h-3" /> {job.company}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(job._id)}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg w-8 h-8 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                  <MapPin className="w-3 h-3 text-muted-foreground/60" /> {job.location}
                </div>

                <p className="text-xs text-muted-foreground font-semibold leading-relaxed line-clamp-3">
                  {job.description}
                </p>

                {job.requirements?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-black bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border/40 pt-3">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 w-fit"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-orange-500" /> Apply Link
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
