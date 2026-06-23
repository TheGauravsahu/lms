import { useState } from "react";
import { forumApi } from "@/api/forumApi";
import { courseApi } from "@/api/courseApi";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router";
import {
  MessageSquare, ThumbsUp, Eye, Pin, CheckCircle2, Plus, Search,
  Tag, Clock, TrendingUp, HelpCircle, BookOpen, ChevronRight, X, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest", icon: Clock },
  { value: "top", label: "Top Voted", icon: TrendingUp },
  { value: "unanswered", label: "Unanswered", icon: HelpCircle },
];

const TAG_COLORS = [
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-green-500/10 text-green-400 border-green-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
];

const PostCard = ({ post, onClick }) => {
  const upvoteCount = post.upvotes?.length || 0;
  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border/50 rounded-2xl p-5 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-start gap-4">
        {/* Vote count */}
        <div className="flex flex-col items-center gap-1 pt-1 min-w-[44px]">
          <div className={`text-lg font-bold ${upvoteCount > 0 ? "text-orange-400" : "text-muted-foreground"}`}>
            {upvoteCount}
          </div>
          <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {post.isPinned && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.isAnswered ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
              <CheckCircle2 className="w-2.5 h-2.5" />
              {post.isAnswered ? "Answered" : "Open"}
            </span>
          </div>

          <h3 className="font-semibold text-foreground group-hover:text-orange-400 transition-colors text-sm leading-snug mb-2 line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.body}</p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 4).map((tag, i) => (
                <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {post.replyCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {post.views || 0}
              </span>
              {post.courseId && (
                <span className="flex items-center gap-1 text-blue-400">
                  <BookOpen className="w-3 h-3" /> {post.courseId.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[8px] font-bold uppercase">
                {post.authorId?.name?.[0] || "U"}
              </div>
              <span>{post.authorId?.name || "Unknown"}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-orange-400 transition-colors mt-1 shrink-0" />
      </div>
    </div>
  );
};

const CreatePostModal = ({ onClose, courses }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [courseId, setCourseId] = useState("");
  const createMutation = forumApi.useCreateForumPost();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return toast.error("Title and body are required.");
    createMutation.mutate(
      {
        title,
        body,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        courseId: courseId || undefined,
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="font-bold text-foreground">Ask a Question</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Question Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question? Be specific..."
              className="bg-background border-border/60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Details *</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your problem in detail, include code snippets if needed..."
              rows={5}
              className="bg-background border-border/60 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Tags (comma-separated)</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, javascript, css"
                className="bg-background border-border/60"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Related Course</label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="bg-background border-border/60">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No course</SelectItem>
                  {courses?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer"
            >
              {createMutation.isPending ? "Posting..." : "Post Question"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Forums = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = forumApi.useGetForumPosts({ sort });
  const { data: coursesData } = courseApi.useGetAllCourses();

  const posts = data?.posts || [];
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.body.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/40 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Discussion Forums</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ask questions, share knowledge, help the community grow.
            </p>
          </div>
        </div>
        {user && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Ask Question
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, tags..."
            className="pl-9 bg-card border-border/60"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border/60 p-1 rounded-xl">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${sort === value ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <span className="font-semibold text-foreground">{filteredPosts.length}</span> questions
        <span>·</span>
        <span className="font-semibold text-green-400">{filteredPosts.filter((p) => p.isAnswered).length}</span> answered
        <span>·</span>
        <span className="font-semibold text-yellow-400">{filteredPosts.filter((p) => !p.isAnswered).length}</span> unanswered
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border/30 rounded-2xl p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-medium">No questions found.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Be the first to ask one!</p>
          {user && (
            <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-4 cursor-pointer">
              <Plus className="w-4 h-4 mr-1" /> Ask First Question
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onClick={() => navigate(`/forums/${post._id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          courses={coursesData || []}
        />
      )}
    </div>
  );
};

export default Forums;
