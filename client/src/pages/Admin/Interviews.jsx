import { useState } from "react";
import { careerApi } from "@/api/careerApi";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Award,
  Calendar,
  Mail,
  Loader2,
  Bookmark,
  TrendingUp,
  Brain,
  History,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminInterviews = () => {
  const { data: interviews, isPending } = careerApi.useAdminGetInterviews();
  const [selectedInterview, setSelectedInterview] = useState(null);

  return (
    <div className="space-y-6 select-text p-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground">Mock Interviews Audit Log</h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Track student mock interviews performance, grading scores, evaluations, and complete chat dialog logs.
            </p>
          </div>
        </div>
      </div>

      {/* List of mock interviews */}
      {isPending ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-xs text-muted-foreground font-semibold">Loading interview logs...</span>
        </div>
      ) : interviews?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center text-xs text-muted-foreground font-semibold">
          No mock interview sessions recorded on the platform yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews?.map((session) => {
            const hasEval = session.evaluation && session.status === "COMPLETED";
            return (
              <div
                key={session._id}
                className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xs transition-shadow space-y-4 relative overflow-hidden"
              >
                {/* Border color by grade */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  hasEval && session.evaluation.score >= 80 ? "bg-green-500" : "bg-orange-500"
                }`} />

                <div className="space-y-3">
                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground leading-tight">
                        {session.role} Interview
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                        Status: <span className={`uppercase font-black ${session.status === "COMPLETED" ? "text-green-600" : "text-amber-600"}`}>{session.status}</span>
                      </p>
                    </div>
                  </div>

                  {hasEval ? (
                    <div className="bg-muted/30 border rounded-xl p-3.5 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Score</span>
                        <div className="text-lg font-black text-foreground">{session.evaluation.score}%</div>
                      </div>
                      <div className="h-10 w-[1px] bg-border/80" />
                      <div className="space-y-0.5 text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Grade</span>
                        <div className="text-lg font-black text-orange-500">{session.evaluation.overallGrade}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic bg-muted/20 border p-3.5 rounded-xl text-center">
                      Interview in progress or incomplete
                    </div>
                  )}
                </div>

                <div className="border-t border-border/40 pt-3 space-y-2 text-[10px] text-muted-foreground font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="truncate">Student: {session.user_id?.email || "Unknown User"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Attempted: {new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setSelectedInterview(session)}
                    className="w-full text-[10px] font-black tracking-wider rounded-xl bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 h-8"
                  >
                    View Details & Transcript
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedInterview} onOpenChange={(open) => !open && setSelectedInterview(null)}>
        <DialogContent className="max-w-3xl rounded-2xl border-border/50 bg-card p-6 overflow-y-auto max-h-[90vh] select-text">
          {selectedInterview && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <DialogTitle className="font-black text-xl text-foreground">
                      Mock Interview details
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      {selectedInterview.role} — Candidate Email: {selectedInterview.user_id?.email || "Unknown"}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Score and stats */}
                {selectedInterview.status === "COMPLETED" && selectedInterview.evaluation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Grade Info */}
                    <div className="bg-muted/30 border border-border/40 p-4 rounded-xl space-y-1">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Performance Grade
                      </h4>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-3xl font-black text-orange-600">
                          {selectedInterview.evaluation.overallGrade}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          ({selectedInterview.evaluation.score}% Score)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium pt-1">
                        {selectedInterview.evaluation.detailedFeedback}
                      </p>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-3">
                      <div className="bg-green-50/50 border border-green-200 p-3 rounded-xl">
                        <h5 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> Strengths
                        </h5>
                        <ul className="text-xs text-green-800 list-disc list-inside space-y-0.5 font-medium">
                          {selectedInterview.evaluation.strengths?.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                          {(!selectedInterview.evaluation.strengths || selectedInterview.evaluation.strengths.length === 0) && (
                            <li className="list-none text-muted-foreground">None identified.</li>
                          )}
                        </ul>
                      </div>
                      <div className="bg-red-50/50 border border-red-200 p-3 rounded-xl">
                        <h5 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Improvement Areas
                        </h5>
                        <ul className="text-xs text-red-800 list-disc list-inside space-y-0.5 font-medium">
                          {selectedInterview.evaluation.weaknesses?.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                          {(!selectedInterview.evaluation.weaknesses || selectedInterview.evaluation.weaknesses.length === 0) && (
                            <li className="list-none text-muted-foreground">None identified.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dialog Log Transcript */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest border-b pb-1 border-slate-200">
                    Interview Transcript ({selectedInterview.chatLog?.length || 0} messages)
                  </h4>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto border border-border/40 p-4 rounded-xl bg-muted/10">
                    {selectedInterview.chatLog?.map((msg, idx) => {
                      const isModel = msg.role === "model";
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col space-y-1 max-w-[85%] ${
                            isModel ? "mr-auto" : "ml-auto text-right"
                          }`}
                        >
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">
                            {isModel ? "Interviewer AI" : "Student"}
                          </span>
                          <div
                            className={`p-3 rounded-xl text-xs font-semibold leading-relaxed ${
                              isModel
                                ? "bg-card border border-border/50 text-foreground"
                                : "bg-orange-500 text-white text-left"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInterviews;
