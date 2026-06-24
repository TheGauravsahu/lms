import { useState } from "react";
import { aiApi } from "@/api/aiApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Map,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle2,
  Circle,
  Route,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const AiRoadmap = () => {
  const [goalInput, setGoalInput] = useState("");
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  
  // Track checked topics locally to simulate interactive progress checkboxes
  const [completedTopics, setCompletedTopics] = useState(new Set());

  const { data: roadmaps = [], isPending: isRoadmapsPending } = aiApi.useGetRoadmaps();
  const createMutation = aiApi.useCreateRoadmap();
  const deleteMutation = aiApi.useDeleteRoadmap();

  const handleGenerate = (e, customGoal = null) => {
    if (e) e.preventDefault();
    const finalGoal = customGoal || goalInput;
    if (!finalGoal.trim() || createMutation.isPending) return;

    createMutation.mutate(
      { goal: finalGoal },
      {
        onSuccess: (res) => {
          setGoalInput("");
          const savedRoadmap = res.data?.data;
          if (savedRoadmap?._id) {
            setActiveRoadmapId(savedRoadmap._id);
          }
        },
      }
    );
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (activeRoadmapId === id) {
          setActiveRoadmapId(null);
        }
      },
    });
  };

  const toggleTopic = (topicName) => {
    const nextSet = new Set(completedTopics);
    if (nextSet.has(topicName)) {
      nextSet.delete(topicName);
    } else {
      nextSet.add(topicName);
    }
    setCompletedTopics(nextSet);
  };

  const activeRoadmap = roadmaps.find((r) => r._id === activeRoadmapId);
  const activeRoadmapData = activeRoadmap?.roadmapData;

  const suggestions = [
    { title: "Web Development", goal: "Fullstack React, Node, Express, MongoDB development" },
    { title: "Data Science", goal: "Data Science & Machine Learning (Python, Scikit-Learn)" },
    { title: "DevOps", goal: "DevOps Pipeline Engineering (Docker, Kubernetes, AWS)" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Sidebar - Saved Roadmaps */}
      <div className="md:col-span-1 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        <div className="p-4 border-b border-border/40 flex justify-between items-center">
          <span className="font-black text-sm text-foreground flex items-center gap-1.5">
            <Route className="w-4 h-4 text-orange-500" />
            My Roadmaps
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setActiveRoadmapId(null)}
            className="h-8 w-8 text-orange-600 hover:text-orange-700 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-full shrink-0"
            title="Create new roadmap"
          >
            <Plus className="w-4.5 h-4.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {isRoadmapsPending ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground font-medium">
              No saved roadmaps yet. Generate one to begin.
            </div>
          ) : (
            roadmaps.map((roadmap) => (
              <div
                key={roadmap._id}
                onClick={() => setActiveRoadmapId(roadmap._id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  activeRoadmapId === roadmap._id
                    ? "bg-orange-500/10 border-orange-500/35 text-orange-600 font-extrabold"
                    : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Map className={`w-4 h-4 shrink-0 ${activeRoadmapId === roadmap._id ? "text-orange-500" : "text-muted-foreground"}`} />
                  <span className="text-xs truncate block pr-2">{roadmap.title}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(roadmap._id, e)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Roadmap Viewer */}
      <div className="md:col-span-3 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-border/40 bg-muted/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                {activeRoadmapData ? activeRoadmapData.title : "AI Learning Roadmap"}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {activeRoadmapData ? `Goal: ${activeRoadmap?.goal}` : "Generate a custom, structured curriculum"}
              </p>
            </div>
          </div>
          {activeRoadmapId && (
            <Button
              onClick={() => setActiveRoadmapId(null)}
              variant="outline"
              size="sm"
              className="text-xs rounded-xl cursor-pointer hover:bg-muted font-bold"
            >
              Generate New
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
          {!activeRoadmapId ? (
            // Generate form state
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-5 py-2">
              {createMutation.isPending ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                  <div className="space-y-1.5">
                    <h3 className="font-black text-lg text-foreground">Generating Curriculum</h3>
                    <p className="text-xs text-muted-foreground animate-pulse font-semibold">
                      Gemini is mapping concepts, organizing milestones, and structuring topics...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-orange-500/10 rounded-full text-orange-500 animate-bounce">
                    <Sparkles className="w-8 h-8 fill-orange-500/10" />
                  </div>
                  
                  <div className="space-y-1.5 max-w-md">
                    <h2 className="text-2xl font-black text-foreground">AI Learning Roadmap</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                      Input your professional learning goals. Gemini will construct a structured, step-by-step developer syllabus broken down into phased milestones and topic checklists.
                    </p>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleGenerate} className="w-full flex gap-3 max-w-md">
                    <Input
                      placeholder="e.g. Frontend Specialist with Next.js..."
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      required
                      className="rounded-xl shadow-none focus-visible:ring-orange-500 text-xs sm:text-sm h-10"
                    />
                    <Button
                      type="submit"
                      disabled={!goalInput.trim() || createMutation.isPending}
                      className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer shrink-0 shadow-sm h-10 px-5"
                    >
                      Generate
                    </Button>
                  </form>

                  {/* Suggestions list */}
                  <div className="w-full space-y-2.5 pt-4 text-left border-t border-border/40 mt-2">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase block">
                      Or Choose a Common Goal
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleGenerate(null, item.goal)}
                          className="text-left p-3.5 bg-card border border-border/70 hover:border-orange-500/40 rounded-xl flex flex-col justify-between items-start text-xs font-bold text-muted-foreground hover:text-orange-600 cursor-pointer shadow-2xs hover:shadow-xs transition-all duration-300 group h-28"
                        >
                          <div className="space-y-0.5">
                            <span className="block text-foreground group-hover:text-orange-600 font-extrabold text-xs">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground font-semibold line-clamp-2 mt-0.5 leading-normal">
                              {item.goal}
                            </span>
                          </div>
                          <span className="text-[9px] text-orange-500 font-black flex items-center gap-1 mt-1 shrink-0">
                            Select <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : !activeRoadmapData ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-xs text-muted-foreground mt-2 font-bold animate-pulse">Loading roadmap details...</span>
            </div>
          ) : (
            // Visual Roadmap Flowchart
            <div className="max-w-2xl mx-auto space-y-6 py-2">
              <div className="flex justify-between items-center bg-card border border-border/50 rounded-2xl p-4 shadow-2xs">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  Estimated study plan
                </span>
                <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Gemini Certified 🎓
                </span>
              </div>

              {/* Vertical Node Connector flowchart */}
              <div className="relative border-l-2 border-dashed border-orange-500/30 ml-4 pl-8 space-y-8">
                {activeRoadmapData?.milestones?.map((milestone, idx) => (
                  <div key={idx} className="relative space-y-3">
                    
                    {/* Node Dot */}
                    <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-linear-to-b from-orange-400 to-red-500 text-white flex items-center justify-center shadow-xs border-2 border-card">
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </div>

                    {/* Milestone header card */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-extrabold text-sm text-foreground">
                          {milestone.name}
                        </h4>
                        <span className="bg-muted text-muted-foreground border border-border/50 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          {milestone.duration}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold pr-4">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Topics Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-card border border-border/40 rounded-xl p-4 shadow-2xs mr-2">
                      {milestone.topics?.map((topic, tIdx) => {
                        const isDone = completedTopics.has(topic);
                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleTopic(topic)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                              isDone ? "bg-green-500/2 dark:bg-green-500/1" : "hover:bg-muted/40"
                            }`}
                          >
                            <button className="text-muted-foreground shrink-0 focus:outline-none">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/5" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/60" />
                              )}
                            </button>
                            <span className={`text-xs font-semibold ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {topic}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AiRoadmap;
