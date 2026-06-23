import { peerReviewApi } from "@/api/peerReviewApi";
import { Code2, Trash2, MessageSquare, Star, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANG_COLORS = {
  javascript: "bg-yellow-500/10 text-yellow-400",
  html: "bg-orange-500/10 text-orange-400",
  css: "bg-blue-500/10 text-blue-400",
  python: "bg-green-500/10 text-green-400",
  typescript: "bg-indigo-500/10 text-indigo-400",
  other: "bg-muted text-muted-foreground",
};

const AdminPeerReviews = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = peerReviewApi.useGetPeerReviews({ status: statusFilter || undefined, limit: 200 });
  const deleteMutation = peerReviewApi.useDeletePeerReview();

  const reviews = (data?.reviews || []).filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.submitterId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Peer Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate code review submissions.</p>
        </div>
        <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-sm font-bold">
          {data?.total || 0} submissions
        </span>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search submissions or authors..." className="pl-9 bg-card border-border/60" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 bg-card border-border/60"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Title</th>
                <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Language</th>
                <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Author</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Comments</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Rating</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Date</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-xs line-clamp-1 max-w-[180px]">{review.title}</p>
                      {review.description && <p className="text-[10px] text-muted-foreground line-clamp-1">{review.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${LANG_COLORS[review.language] || LANG_COLORS.other}`}>
                        {review.language}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{review.submitterId?.name || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="flex items-center gap-1 justify-center text-xs font-bold text-foreground">
                        <MessageSquare className="w-3 h-3 text-purple-400" /> {review.comments?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {review.rating ? (
                        <span className="flex items-center gap-0.5 justify-center text-xs text-yellow-400 font-bold">
                          <Star className="w-3 h-3 fill-yellow-400" /> {review.rating}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${review.status === "open" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-muted text-muted-foreground border-border/50"}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => { if (window.confirm("Delete this review?")) deleteMutation.mutate(review._id); }}
                          className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPeerReviews;
