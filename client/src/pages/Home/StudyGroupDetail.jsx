import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { studyGroupApi } from "@/api/studyGroupApi";
import { useAuthStore } from "@/store/auth";
import {
  ArrowLeft, Users, Crown, Lock, Globe, Send, Copy, Check,
  LogOut, Trash2, BookOpen, MessageSquare, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TimeAgo = ({ date }) => {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return <span>{hrs}h ago</span>;
  if (mins > 0) return <span>{mins}m ago</span>;
  return <span>just now</span>;
};

const StudyGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [msgText, setMsgText] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: group, isLoading: groupLoading } = studyGroupApi.useGetStudyGroup(groupId);
  const isMember = group?.members?.some((m) => (m._id || m) === user?._id);
  const { data: messages = [], isLoading: msgsLoading } = studyGroupApi.useGetGroupMessages(groupId, isMember);
  const sendMsgMutation = studyGroupApi.usePostGroupMessage(groupId);
  const leaveMutation = studyGroupApi.useLeaveStudyGroup();
  const deleteMutation = studyGroupApi.useDeleteStudyGroup();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!msgText.trim()) return;
    sendMsgMutation.mutate({ groupId, message: msgText });
    setMsgText("");
  };

  const handleCopyCode = () => {
    if (!group?.inviteCode) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (!window.confirm("Leave this group?")) return;
    leaveMutation.mutate(groupId, { onSuccess: () => navigate("/study-groups") });
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this group and all messages?")) return;
    deleteMutation.mutate(groupId, { onSuccess: () => navigate("/study-groups") });
  };

  if (groupLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-muted rounded-xl" />
        <div className="bg-card border border-border/30 rounded-2xl h-[500px]" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">Group not found.</p>
        <Button variant="outline" onClick={() => navigate("/study-groups")} className="mt-4 cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Groups
        </Button>
      </div>
    );
  }

  const isCreator = user && group.createdBy?._id === user._id;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Chat Panel */}
      <div className="flex-1 bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="bg-muted/40 p-4 border-b border-border/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/study-groups")} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className={`p-2 rounded-xl ${group.isPrivate ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
              {group.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm">{group.name}</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> {group.members?.length} members · {group.isPrivate ? "Private" : "Public"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isMember && (
              <button onClick={handleLeave} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10" title="Leave group">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {(isCreator || isAdmin) && (
              <button onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10" title="Delete group">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {!isMember ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Lock className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Join this group to view and send messages.</p>
          </div>
        ) : msgsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isOwn = msg.authorId?._id === user?._id;
              return (
                <div key={msg._id || i} className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[9px] font-bold uppercase shrink-0">
                    {msg.authorId?.name?.[0] || "U"}
                  </div>
                  <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    {!isOwn && <p className="text-[10px] text-muted-foreground pl-1">{msg.authorId?.name}</p>}
                    <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isOwn ? "bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-tr-sm" : "bg-muted/60 text-foreground rounded-tl-sm"}`}>
                      {msg.message}
                    </div>
                    <p className={`text-[9px] text-muted-foreground/60 ${isOwn ? "pr-1 text-right" : "pl-1"}`}>
                      <TimeAgo date={msg.createdAt} />
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Message Input */}
        {isMember && (
          <div className="p-3 border-t border-border/50 flex items-center gap-2 shrink-0">
            <Input
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message... (Enter to send)"
              className="bg-background border-border/60 flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={sendMsgMutation.isPending || !msgText.trim()}
              size="icon"
              className="bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar: Members + Info */}
      <div className="w-full lg:w-72 space-y-4 shrink-0">
        {/* Group Info */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">About Group</h3>
          {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
          {group.courseId && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <BookOpen className="w-3.5 h-3.5" /> {group.courseId.title}
            </div>
          )}
          {group.isPrivate && group.inviteCode && (isCreator || isAdmin) && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Invite Code</p>
              <div className="flex items-center gap-2 bg-background border border-border/60 rounded-xl px-3 py-2">
                <span className="font-mono font-bold text-orange-400 text-sm tracking-widest flex-1">{group.inviteCode}</span>
                <button onClick={handleCopyCode} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Members */}
        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
            Members ({group.members?.length})
          </h3>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {group.members?.map((member) => {
              const isGroupCreator = (member._id || member) === group.createdBy?._id;
              return (
                <div key={member._id || member} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[9px] font-bold uppercase">
                    {member.name?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{member.name || "Unknown"}</p>
                  </div>
                  {isGroupCreator && (
                    <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDetail;
