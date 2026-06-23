import { studyGroupApi } from "@/api/studyGroupApi";
import { Users, Trash2, Lock, Globe, Crown, BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const AdminStudyGroups = () => {
  const [search, setSearch] = useState("");
  const { data: groupsData, isLoading } = studyGroupApi.useGetStudyGroups({ limit: 200 });
  const deleteMutation = studyGroupApi.useDeleteStudyGroup();

  const groups = (groupsData?.groups || []).filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.createdBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all student study groups.</p>
        </div>
        <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm font-bold">
          {groupsData?.total || 0} groups
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups or creators..." className="pl-9 bg-card border-border/60" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/30 rounded-2xl h-36 animate-pulse" />
          ))
        ) : groups.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">No study groups found.</div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${group.isPrivate ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                    {group.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground line-clamp-1">{group.name}</p>
                    <span className={`text-[10px] font-bold ${group.isPrivate ? "text-purple-400" : "text-blue-400"}`}>
                      {group.isPrivate ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { if (window.confirm(`Delete group "${group.name}"?`)) deleteMutation.mutate(group._id); }}
                  className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {group.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {group.members?.length || 0}/{group.maxMembers}
                </span>
                {group.courseId && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <BookOpen className="w-3.5 h-3.5" /> {group.courseId.title}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-400" /> {group.createdBy?.name}
                </span>
              </div>

              <div className="w-full bg-muted/50 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-1 rounded-full"
                  style={{ width: `${((group.members?.length || 0) / group.maxMembers) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminStudyGroups;
