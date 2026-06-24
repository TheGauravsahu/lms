import { useState, useEffect, useRef } from "react";
import { careerApi } from "@/api/careerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageSquareCode,
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  CheckCircle,
  HelpCircle,
  Briefcase,
  TrendingUp,
  Award,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

const MockInterview = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [replyInput, setReplyInput] = useState("");
  
  const chatBottomRef = useRef(null);

  // API hooks
  const startMutation = careerApi.useStartInterview();
  const respondMutation = careerApi.useSubmitInterviewResponse();
  
  const { data: activeInterview, isPending: isActivePending } = careerApi.useGetActiveInterview();
  const { data: history = [], isPending: isHistoryPending } = careerApi.useGetInterviewsHistory();

  // Scroll to chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeInterview?.chatLog, respondMutation.isPending]);

  const handleStart = (roleName) => {
    startMutation.mutate({ role: roleName });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyInput.trim() || respondMutation.isPending) return;

    respondMutation.mutate(
      { responseText: replyInput },
      {
        onSuccess: () => {
          setReplyInput("");
        },
      }
    );
  };

  const roles = [
    "Frontend Specialist (React/Vite)",
    "Backend Node.js & Database Engineer",
    "DevOps Pipeline Engineer (AWS/Docker)",
    "Python Data Science & ML Specialist",
  ];

  if (isActivePending) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Sidebar: Role Picker or Past Evaluations */}
      <div className="md:col-span-1 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        <div className="p-4 border-b border-border/40 flex justify-between items-center">
          <span className="font-black text-sm text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            Interview Hub
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Active roles list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Choose Interview Target
            </span>
            <div className="space-y-1.5">
              {roles.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStart(r)}
                  disabled={startMutation.isPending}
                  className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                    activeInterview?.role === r
                      ? "bg-orange-500/10 border-orange-500/35 text-orange-600"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-orange-500/35 cursor-pointer"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Past evaluations list */}
          <div className="space-y-2 pt-4 border-t">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Previous Evaluations
            </span>
            {isHistoryPending ? (
              <div className="h-20 bg-muted animate-pulse rounded-xl" />
            ) : history.length === 0 ? (
              <span className="text-[10px] text-muted-foreground font-semibold block text-center py-4">No completed sessions yet.</span>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {history.map((session) => (
                  <div
                    key={session._id}
                    className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-foreground truncate pr-1">{session.role.split(" ")[0]}</span>
                      <span className="bg-orange-500/15 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        {session.evaluation?.overallGrade} ({session.evaluation?.score}%)
                      </span>
                    </div>
                    <span className="text-[8px] text-muted-foreground font-semibold block">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Terminal Screen */}
      <div className="md:col-span-3 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-border/40 bg-muted/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                {activeInterview ? `${activeInterview.role} Mock Interview` : "AI Mock Interviewer"}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {activeInterview ? "Answer the questions step-by-step. Interview wraps up after 5 rounds." : "Select a role on the left to begin practice"}
              </p>
            </div>
          </div>
        </div>

        {/* Dialogue terminal */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/5 flex flex-col justify-between">
          {!activeInterview ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="p-4 bg-orange-500/10 rounded-full text-orange-500 animate-bounce">
                <Sparkles className="w-10 h-10 fill-orange-500/10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">AI Placement Interview</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  Simulate a real-time, role-specific developer interview. Our AI asks contextual follow-up questions, evaluates your answers, and scores your strengths and weaknesses.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col justify-between h-full">
              {/* Dialogue logs */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[300px] mb-4">
                {activeInterview.chatLog?.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                          isUser
                            ? "bg-linear-to-b from-orange-400 to-red-500 text-white"
                            : "bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-orange-500" />}
                      </div>
                      <div
                        className={`rounded-2xl p-4 shadow-3xs border text-xs leading-relaxed ${
                          isUser
                            ? "bg-linear-to-b from-orange-500/10 to-red-500/5 border-orange-500/20 text-foreground"
                            : "bg-card border-border/80 text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {/* Submitting/evaluating loading states */}
                {respondMutation.isPending && (
                  <div className="flex gap-3 max-w-[80%] mr-auto">
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-muted border border-border/60">
                      <Bot className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                    </div>
                    <div className="bg-card border-border/80 border rounded-2xl p-4 shadow-3xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Interviewer is reviewing response...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input bar */}
              <form onSubmit={handleSend} className="p-3 border-t bg-muted/5 flex items-center gap-3 shrink-0">
                <Input
                  placeholder={
                    respondMutation.isPending
                      ? "Interviewer is assessing your response..."
                      : "Type your technical answer here..."
                  }
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  disabled={respondMutation.isPending}
                  className="flex-1 rounded-xl shadow-none focus-visible:ring-orange-500 text-xs sm:text-sm h-10"
                />
                <Button
                  type="submit"
                  disabled={!replyInput.trim() || respondMutation.isPending}
                  className="rounded-xl px-4 py-2 bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shrink-0 cursor-pointer shadow-sm hover:shadow"
                >
                  {respondMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4.5 h-4.5" />
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MockInterview;
