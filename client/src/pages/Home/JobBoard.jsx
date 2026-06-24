import { useState } from "react";
import { careerApi } from "@/api/careerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Briefcase,
  MapPin,
  ListChecks,
  Plus,
  ArrowUpRight,
  Search,
  Building2,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const JobBoard = () => {
  const { data: jobs = [], isPending } = careerApi.useGetJobs();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Apply dialog states
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (isPending) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleApply = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success(`Application submitted to ${selectedJob.company}!`);
    setTimeout(() => {
      setSelectedJob(null);
      setSubmitted(false);
      setApplicantName("");
      setApplicantEmail("");
    }, 1500);
  };

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.requirements.some((r) => r.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Job Board Header */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground flex items-center gap-2">
              Career Center
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Explore active job postings and internship listings curated for LMS graduates.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search roles, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 rounded-xl bg-input/50 focus-visible:ring-orange-500 text-xs h-10 font-semibold"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center text-xs text-muted-foreground font-semibold">
          No matches found for your search term. Try another query!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs flex flex-col justify-between items-start gap-4 hover:shadow-2xs transition-shadow"
            >
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-sm text-foreground leading-tight">{job.title}</h3>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-orange-500" />
                      {job.company}
                    </span>
                  </div>
                  <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                    <MapPin className="w-3 h-3" />
                    {job.location.split(" ")[0]}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-semibold line-clamp-3">
                  {job.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {job.requirements.map((req, rIdx) => (
                    <span
                      key={rIdx}
                      className="bg-muted text-muted-foreground border border-border/60 text-[9px] font-bold px-2 py-0.5 rounded-md"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setSelectedJob(job)}
                className="w-full mt-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 hover:bg-orange-500 hover:text-white font-extrabold text-xs h-9 cursor-pointer flex items-center justify-center gap-1"
              >
                Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Dialog: Job Application */}
      <Dialog open={!!selectedJob} onOpenChange={(val) => !val && setSelectedJob(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black">
              <Briefcase className="w-5 h-5 text-orange-500" />
              Apply: {selectedJob?.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              Submit your application details to {selectedJob?.company}.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto animate-bounce" />
              <div>
                <h4 className="font-extrabold text-sm text-foreground">Application Sent!</h4>
                <p className="text-xs text-muted-foreground font-semibold">Gaurav LMS has forwarded your profile data.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Your Full Name</Label>
                <Input
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Gaurav Sahu"
                  required
                  className="rounded-xl bg-input/50 focus-visible:ring-orange-500 text-xs h-10 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Email Address</Label>
                <Input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="rounded-xl bg-input/50 focus-visible:ring-orange-500 text-xs h-10 font-bold"
                />
              </div>

              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3.5 flex items-center gap-3 mt-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-muted-foreground font-bold leading-normal">
                  Your public learner portfolio, course completions, and resume achievements will be attached automatically.
                </span>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl text-xs font-bold h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold h-10 px-5 text-xs"
                >
                  Submit Application
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default JobBoard;
