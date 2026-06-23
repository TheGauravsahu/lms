import { useState } from "react";
import { useNavigate } from "react-router";
import { studyGroupApi } from "@/api/studyGroupApi";
import { useAuthStore } from "@/store/auth";
import {
  Users, Plus, Lock, Globe, BookOpen, Crown, ArrowRight, X,
  Search, UserCheck, UserPlus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const GroupCard = ({ group, userId, onJoin, onNavigate }) => {
  const isMember = group.members?.some((m) => (m._id || m) === userId);
  const isFull = group.members?.length >= group.maxMembers;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${group.isPrivate ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
            {group.isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">{group.name}</h3>
            <span className={`text-[10px] font-bold ${group.isPrivate ? "text-purple-400" : "text-blue-400"}`}>
              {group.isPrivate ? "🔒 Private" : "🌐 Public"}
            </span>
          </div>
        </div>
        {isMember && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 shrink-0">
            <UserCheck className="w-2.5 h-2.5" /> Member
          </span>
        )}
      </div>

      {group.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{group.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {group.members?.length || 0}/{group.maxMembers}
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

      {/* Progress bar */}
      <div className="w-full bg-muted/50 rounded-full h-1">
        <div
          className="bg-gradient-to-r from-orange-400 to-red-500 h-1 rounded-full transition-all"
          style={{ width: `${((group.members?.length || 0) / group.maxMembers) * 100}%` }}
        />
      </div>

      <div className="flex gap-2 pt-1">
        {isMember ? (
          <Button
            onClick={() => onNavigate(group._id)}
            className="flex-1 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs cursor-pointer"
          >
            Open Chat <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => onJoin(group)}
            disabled={isFull}
            variant="outline"
            className="flex-1 text-xs cursor-pointer border-border/60 hover:border-orange-500/40"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1" />
            {isFull ? "Full" : "Join Group"}
          </Button>
        )}
      </div>
    </div>
  );
};

const JoinModal = ({ group, onClose }) => {
  const [inviteCode, setInviteCode] = useState("");
  const joinMutation = studyGroupApi.useJoinStudyGroup();

  const handleJoin = () => {
    joinMutation.mutate(
      { groupId: group._id, inviteCode: group.isPrivate ? inviteCode : undefined },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="font-bold">Join "{group.name}"</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {group.isPrivate ? (
            <>
              <p className="text-sm text-muted-foreground">This is a private group. Enter the invite code to join.</p>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Invite code (e.g. A1B2C3D4)"
                className="font-mono tracking-widest bg-background border-border/60"
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Are you sure you want to join this group?</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
            <Button
              onClick={handleJoin}
              disabled={joinMutation.isPending || (group.isPrivate && !inviteCode)}
              className="flex-1 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer"
            >
              {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateGroupModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxMembers, setMaxMembers] = useState(20);
  const createMutation = studyGroupApi.useCreateStudyGroup();

  const handleCreate = () => {
    if (!name.trim()) return toast.error("Group name is required.");
    createMutation.mutate({ name, description, isPrivate, maxMembers }, { onSuccess: (res) => {
      if (res.data?.inviteCode) {
        toast.success(`Group created! Invite code: ${res.data.inviteCode}`, { duration: 8000 });
      }
      onClose();
    }});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="font-bold">Create Study Group</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Group Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. React Study Crew" className="bg-background border-border/60" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will this group study?" rows={3} className="bg-background border-border/60 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Max Members</label>
              <Input type="number" min={2} max={100} value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} className="bg-background border-border/60" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Private Group</label>
              <div className="flex items-center gap-2 mt-1">
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                <span className="text-xs text-muted-foreground">{isPrivate ? "Invite code required" : "Anyone can join"}</span>
              </div>
            </div>
          </div>
          {isPrivate && (
            <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-xs text-purple-400">
              🔒 A unique invite code will be generated. Share it with members you want to invite.
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Group
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyGroups = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // "all" | "my"
  const [showCreate, setShowCreate] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(null);

  const { data: allData, isLoading: allLoading } = studyGroupApi.useGetStudyGroups();
  const { data: myGroups, isLoading: myLoading } = studyGroupApi.useGetMyStudyGroups();

  const allGroups = allData?.groups || [];
  const groups = tab === "my" ? (myGroups || []) : allGroups;
  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = tab === "my" ? myLoading : allLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/40 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Study Groups</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Learn together, grow faster. Join or create a study group.
            </p>
          </div>
        </div>
        {user && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-b from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Group
          </Button>
        )}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-card border border-border/60 p-1 rounded-xl">
          {[{ value: "all", label: "All Groups" }, { value: "my", label: "My Groups" }].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${tab === value ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups..." className="pl-9 bg-card border-border/60" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border/30 rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-muted/50 rounded-full mb-4"><Users className="w-8 h-8 text-muted-foreground/50" /></div>
          <p className="text-muted-foreground font-medium">{tab === "my" ? "You haven't joined any groups yet." : "No study groups found."}</p>
          {user && (
            <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-4 cursor-pointer">
              <Plus className="w-4 h-4 mr-1" /> Create First Group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              userId={user?._id}
              onJoin={setJoiningGroup}
              onNavigate={(id) => navigate(`/study-groups/${id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
      {joiningGroup && <JoinModal group={joiningGroup} onClose={() => setJoiningGroup(null)} />}
    </div>
  );
};

export default StudyGroups;
