import { useState } from "react";
import { aiApi } from "@/api/aiApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  FileText,
  Brain,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

// A simple markdown-like formatter to render generated notes beautifully
const FormattedMessage = ({ text }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-3 leading-relaxed text-sm">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const lines = part.split("\n");
          const firstLine = lines[0];
          const lang = firstLine.replace("```", "").trim() || "code";
          const code = lines.slice(1, -1).join("\n");

          return (
            <div key={index} className="rounded-xl border border-muted/50 overflow-hidden my-3 shadow-2xs">
              <div className="bg-muted px-4 py-1.5 flex justify-between items-center border-b border-muted/40">
                <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-orange-500" />
                  {lang}
                </span>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-sm cursor-pointer"
                  title="Copy code"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <pre className="p-4 bg-muted/30 text-xs overflow-x-auto text-foreground font-mono">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split("\n");
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                const content = line.trim().substring(2);
                return (
                  <ul key={lIdx} className="list-disc pl-5 my-1">
                    <li>{renderInlineStyles(content)}</li>
                  </ul>
                );
              }
              return <p key={lIdx}>{renderInlineStyles(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

const renderInlineStyles = (line) => {
  if (!line) return "";
  const boldParts = line.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, idx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      return (
        <strong key={idx} className="font-extrabold text-foreground">
          {bPart.substring(2, bPart.length - 2)}
        </strong>
      );
    }
    const codeParts = bPart.split(/(\`.*?\`)/g);
    return codeParts.map((cPart, cIdx) => {
      if (cPart.startsWith("`") && cPart.endsWith("`")) {
        return (
          <code key={cIdx} className="bg-muted text-xs px-1.5 py-0.5 rounded-sm font-mono text-orange-600 dark:text-orange-400 font-semibold">
            {cPart.substring(1, cPart.length - 1)}
          </code>
        );
      }
      return cPart;
    });
  });
};

const AiToolCenter = () => {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [activeTab, setActiveTab] = useState("notes"); // 'notes' | 'quiz'

  // Output states
  const [notesContent, setNotesContent] = useState("");
  const [quizContent, setQuizContent] = useState(null);

  // Play quiz states
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);

  // Copy helpers
  const [copied, setCopied] = useState(false);

  const generateNotesMutation = aiApi.useGenerateNotes();
  const generateQuizMutation = aiApi.useGenerateQuiz();

  const handleGenerateNotes = (e) => {
    e.preventDefault();
    if (!topic.trim()) return toast.error("Topic is required.");

    setNotesContent("");
    generateNotesMutation.mutate(
      {
        lessonTitle: topic,
        context: context.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          setNotesContent(res.notes);
          toast.success("AI Revision Notes generated!");
        },
      }
    );
  };

  const handleGenerateQuiz = (e) => {
    e.preventDefault();
    if (!topic.trim()) return toast.error("Topic is required.");

    setQuizContent(null);
    setAnswers({});
    setQuizSubmitted(false);
    setCurrentQuizIdx(0);

    generateQuizMutation.mutate(
      {
        lessonTitle: topic,
        context: context.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          setQuizContent(res);
          toast.success("AI practice quiz generated!");
        },
      }
    );
  };

  const handleCopyNotes = () => {
    if (!notesContent) return;
    navigator.clipboard.writeText(notesContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectOption = (qIdx, opt) => {
    if (quizSubmitted) return;
    setAnswers({ ...answers, [qIdx]: opt });
  };

  const calculateQuizScore = () => {
    if (!quizContent) return 0;
    let score = 0;
    quizContent.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Sparkles className="w-5 h-5 fill-orange-500/10" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground flex items-center gap-2">
              AI Study Assistant
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Input any topic or syllabus context. Gemini will generate structured revision notes or assessment quizzes instantly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form Panel */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Sparkles className="w-4.5 h-4.5 fill-orange-500/10" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">Generator Panel</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">Configure generation prompts</p>
            </div>
          </div>

          <div className="flex bg-muted p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "notes"
                  ? "bg-card text-foreground shadow-3xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Study Notes
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === "quiz"
                  ? "bg-card text-foreground shadow-3xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Practice Quiz
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Topic / Concept Title</Label>
              <Input
                placeholder="e.g. REST APIs, SQL Joins, Redux State"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="mt-2 bg-input/50 focus-visible:ring-orange-500 rounded-xl text-xs h-10 font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground uppercase">Additional Context / Syllabus (Optional)</Label>
              <Textarea
                placeholder="Paste code blocks, specific definitions, or slide notes here to tailor the generated results."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-2 bg-input/50 focus-visible:ring-orange-500 rounded-xl text-xs min-h-[120px]"
              />
            </div>

            {activeTab === "notes" ? (
              <Button
                onClick={handleGenerateNotes}
                disabled={!topic.trim() || generateNotesMutation.isPending}
                className="w-full bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5"
              >
                {generateNotesMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating notes...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Study Notes
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGenerateQuiz}
                disabled={!topic.trim() || generateQuizMutation.isPending}
                className="w-full bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5"
              >
                {generateQuizMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating quiz...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Generate Practice Quiz
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right Output Viewer */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xs h-[500px]">
          
          {/* Header */}
          <div className="p-4 border-b border-border/40 bg-muted/15 flex justify-between items-center shrink-0">
            <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
              {activeTab === "notes" ? <FileText className="w-4.5 h-4.5 text-blue-500" /> : <Brain className="w-4.5 h-4.5 text-purple-500" />}
              {activeTab === "notes" ? "Generated Notes View" : "Generated Quiz View"}
            </span>

            {activeTab === "notes" && notesContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyNotes}
                className="text-xs rounded-xl font-bold h-8 flex items-center gap-1 border-border/80"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Notes"}
              </Button>
            )}
          </div>

          {/* Body Viewer */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
            {activeTab === "notes" ? (
              // Notes display
              generateNotesMutation.isPending ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="text-xs text-muted-foreground font-semibold">Gemini is structuring notes...</span>
                </div>
              ) : notesContent ? (
                <div className="prose max-w-none text-foreground select-text animate-in fade-in duration-300">
                  <FormattedMessage text={notesContent} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground/45" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm">No Notes Generated</h4>
                    <p className="text-[11px] text-muted-foreground font-medium">Input a topic on the left and click generate to populate detailed study cards.</p>
                  </div>
                </div>
              )
            ) : (
              // Quiz display
              generateQuizMutation.isPending ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="text-xs text-muted-foreground font-semibold">Gemini is drafting questions...</span>
                </div>
              ) : quizContent && quizContent.questions ? (
                <div className="max-w-xl mx-auto space-y-6 py-2 animate-in fade-in duration-300">
                  
                  {/* Results review state */}
                  {quizSubmitted ? (
                    <div className="bg-card border border-border/50 rounded-2xl p-5 text-center space-y-3 shadow-2xs">
                      <Award className="w-10 h-10 text-orange-500 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-black text-base">Quiz Completed!</h4>
                        <p className="text-xs text-muted-foreground font-bold">
                          You scored <span className="text-orange-500 font-black">{calculateQuizScore()}</span> out of <span className="font-black">{quizContent.questions.length}</span> correct answers.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setAnswers({});
                          setCurrentQuizIdx(0);
                        }}
                        className="bg-orange-500/10 border border-orange-500/25 text-orange-600 font-extrabold text-[10px] rounded-lg py-1.5 h-8 px-3 mx-auto cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retake Quiz
                      </Button>
                    </div>
                  ) : (
                    // Live quiz questions
                    <div className="space-y-4">
                      {/* progress indicator */}
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                        <span>Question {currentQuizIdx + 1} of {quizContent.questions.length}</span>
                        <span>Answered: {Object.keys(answers).length} / {quizContent.questions.length}</span>
                      </div>

                      <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-2xs space-y-4">
                        <p className="text-sm font-extrabold text-foreground leading-relaxed">
                          {quizContent.questions[currentQuizIdx].questionText}
                        </p>

                        <div className="grid grid-cols-1 gap-2">
                          {quizContent.questions[currentQuizIdx].options.map((opt, oIdx) => {
                            const isSelected = answers[currentQuizIdx] === opt;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => selectOption(currentQuizIdx, opt)}
                                className={`text-left p-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-orange-500/10 border-orange-500/35 text-orange-600"
                                    : "bg-card border-border/70 hover:border-orange-500/30 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          variant="ghost"
                          disabled={currentQuizIdx === 0}
                          onClick={() => setCurrentQuizIdx((prev) => prev - 1)}
                          className="text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Previous
                        </Button>

                        {currentQuizIdx === quizContent.questions.length - 1 ? (
                          <Button
                            onClick={() => setQuizSubmitted(true)}
                            disabled={Object.keys(answers).length < quizContent.questions.length}
                            className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-xl text-xs font-bold px-4"
                          >
                            Submit Assessment
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setCurrentQuizIdx((prev) => prev + 1)}
                            className="text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Next Question
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Complete review log of all questions */}
                  {quizSubmitted && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-extrabold text-sm">Review Questions:</h4>
                      {quizContent.questions.map((q, idx) => {
                        const isCorrect = answers[idx] === q.correctAnswer;
                        return (
                          <div key={idx} className="bg-card border border-border/40 rounded-2xl p-4 space-y-2 shadow-3xs">
                            <div className="flex gap-2 items-start justify-between">
                              <p className="text-xs font-extrabold text-foreground">{idx + 1}. {q.questionText}</p>
                              {isCorrect ? (
                                <span className="text-green-500 flex items-center gap-0.5 font-bold text-[9px] shrink-0 uppercase bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Correct</span>
                              ) : (
                                <span className="text-red-500 flex items-center gap-0.5 font-bold text-[9px] shrink-0 uppercase bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Wrong</span>
                              )}
                            </div>
                            <div className="text-[11px] space-y-1 mt-1 text-muted-foreground font-semibold">
                              <div><span className="font-bold text-foreground">Your answer:</span> {answers[idx] || "Unanswered"}</div>
                              <div><span className="font-bold text-foreground">Correct answer:</span> {q.correctAnswer}</div>
                            </div>
                            {q.explanation && (
                              <p className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-500/5 p-2 rounded-lg border border-orange-500/10 leading-relaxed font-semibold">
                                <span className="font-black">Explanation:</span> {q.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                  <Brain className="w-12 h-12 text-muted-foreground/45" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm">No Quiz Generated</h4>
                    <p className="text-[11px] text-muted-foreground font-medium">Input a topic on the left and click generate to create a multi-choice practice quiz.</p>
                  </div>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AiToolCenter;
