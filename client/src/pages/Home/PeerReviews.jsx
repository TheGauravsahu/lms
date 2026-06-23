import { useState } from "react";
import { useNavigate } from "react-router";
import { peerReviewApi } from "@/api/peerReviewApi";
import { useAuthStore } from "@/store/auth";
import {
  Code2, Plus, ChevronRight, X, Search, Clock, CheckCircle,
  MessageSquare, Star, Filter, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

const LANG_COLORS = {
  javascript: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  html: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  css: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  python: "bg-green-500/10 text-green-400 border-green-500/20",
  typescript: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

const LANG_ICONS = {
  javascript: "JS",
  html: "HTML",
  css: "CSS",
  python: "PY",
  typescript: "TS",
  other: "?",
};

const ReviewCard = ({ review, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-card border border-border/50 rounded-2xl p-5 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
  >
    <div className="flex items-start gap-4">
      {/* Language Badge */}
      <div className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black tracking-widest shrink-0 ${LANG_COLORS[review.language] || LANG_COLORS.other}`}>
        {LANG_ICONS[review.language] || "?"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${review.status === "open" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-muted text-muted-foreground border-border/50"}`}>
            {review.status === "open" ? "● Open" : "✓ Closed"}
          </span>
          {review.rating && (
            <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-bold">
              <Star className="w-2.5 h-2.5 fill-yellow-400" /> {review.rating}/5
            </span>
          )}
        </div>
        <h3 className="font-semibold text-sm text-foreground group-hover:text-orange-400 transition-colors line-clamp-1 mb-1.5">
          {review.title}
        </h3>
        {review.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{review.description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {review.comments?.length || 0} comments
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[7px] font-bold uppercase">
              {review.submitterId?.name?.[0] || "U"}
            </div>
            <span>{review.submitterId?.name || "Unknown"}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-orange-400 transition-colors mt-1 shrink-0" />
    </div>
  </div>
);

const SubmitReviewModal = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Paste your code here for review\n");
  const submitMutation = peerReviewApi.useSubmitPeerReview();

  const handleSubmit = () => {
    if (!title.trim() || !code.trim()) return toast.error("Title and code are required.");
    submitMutation.mutate({ title, description, language, code }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-border/50 shrink-0">
          <h2 className="font-bold">Submit Code for Peer Review</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What should reviewers focus on?" className="bg-background border-border/60" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-background border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["javascript", "typescript", "html", "css", "python", "other"].map((l) => (
                    <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Context or specific concerns..." className="bg-background border-border/60" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Code *</label>
            <div className="rounded-xl overflow-hidden border border-border/60 h-[250px]">
              <Editor
                height="250px"
                language={language === "other" ? "javascript" : language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{ fontSize: 12, minimap: { enabled: false }, lineNumbers: "on", fontFamily: "Space Grotesk, monospace" }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-border/50 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex-1 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer"
          >
            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit for Review
          </Button>
        </div>
      </div>
    </div>
  );
};

const PeerReviews = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);

  const { data, isLoading } = peerReviewApi.useGetPeerReviews({
    status: statusFilter || undefined,
    language: langFilter || undefined,
  });

  const reviews = data?.reviews || [];
  const filtered = reviews.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/40 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Peer Code Reviews</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit your code, get feedback. Review others, earn XP.
            </p>
          </div>
        </div>
        {user && (
          <Button
            onClick={() => setShowSubmit(true)}
            className="bg-gradient-to-b from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Submit Code
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="pl-9 bg-card border-border/60" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-card border-border/60"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={langFilter} onValueChange={setLangFilter}>
            <SelectTrigger className="w-36 bg-card border-border/60"><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Languages</SelectItem>
              {["javascript", "typescript", "html", "css", "python", "other"].map((l) => (
                <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* XP Banner */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl">
        <Star className="w-5 h-5 text-yellow-400 shrink-0" />
        <p className="text-xs text-foreground">
          <span className="font-bold text-purple-400">+30 XP</span> for every inline comment you leave on someone else's code!
        </p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border/30 rounded-2xl p-5 h-28 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-muted/50 rounded-full mb-4"><Code2 className="w-8 h-8 text-muted-foreground/50" /></div>
          <p className="text-muted-foreground font-medium">No peer reviews found.</p>
          {user && (
            <Button onClick={() => setShowSubmit(true)} variant="outline" className="mt-4 cursor-pointer">
              <Plus className="w-4 h-4 mr-1" /> Submit First Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onClick={() => navigate(`/peer-reviews/${review._id}`)}
            />
          ))}
        </div>
      )}

      {showSubmit && <SubmitReviewModal onClose={() => setShowSubmit(false)} />}
    </div>
  );
};

export default PeerReviews;
