import { forumApi } from "@/api/forumApi";
import { Pin, Trash2, CheckCircle2, MessageSquare, Eye, ThumbsUp, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminForums = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const { data, isLoading } = forumApi.useGetForumPosts({ sort, limit: 100 });
  const deleteMutation = forumApi.useDeletePost();
  const pinMutation = forumApi.usePinPost();

  const posts = (data?.posts || []).filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Forum Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all discussion posts across courses.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full font-bold">
            {data?.total || 0} posts
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts or authors..." className="pl-9 bg-card border-border/60" />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border/60 p-1 rounded-xl">
          {["latest", "top", "unanswered"].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all capitalize ${sort === s ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Post</th>
                <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Author</th>
                <th className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Course</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Votes</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Replies</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Views</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Status</th>
                <th className="text-center text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-3/4" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-1/2" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-1/2" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-16 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-muted rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">No posts found.</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.isPinned && <Pin className="w-3 h-3 text-orange-400 shrink-0" />}
                        <p className="font-medium text-foreground text-xs line-clamp-1 max-w-[200px]">{post.title}</p>
                      </div>
                      {post.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] font-bold text-orange-400 bg-orange-500/10 rounded-full px-1.5 py-0.5 mr-1">#{t}</span>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{post.authorId?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{post.courseId?.title || "General"}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1 justify-center">
                        <ThumbsUp className="w-3 h-3 text-orange-400" /> {post.upvotes?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1 justify-center">
                        <MessageSquare className="w-3 h-3 text-blue-400" /> {post.replyCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 justify-center">
                        <Eye className="w-3 h-3" /> {post.views || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.isAnswered ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                        {post.isAnswered ? "Answered" : "Open"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => pinMutation.mutate(post._id)}
                          title={post.isPinned ? "Unpin" : "Pin"}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${post.isPinned ? "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20" : "text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10"}`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Delete this post?")) deleteMutation.mutate(post._id); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
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

export default AdminForums;
