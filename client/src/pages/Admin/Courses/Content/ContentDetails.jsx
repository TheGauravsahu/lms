import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/api/courseApi";
import ErrorOccured from "@/components/error-occured";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  FileText,
  Sparkles,
  Bot,
  Brain,
  Loader2,
  Send,
  User,
  Copy,
  Check,
  Calendar,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { productivityApi } from "@/api/productivityApi";
import { aiApi } from "@/api/aiApi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import ContentOptionsMenu from "@/components/admin/courses/content/content-options-menu";
import CustomVideoPlayer from "@/components/courses/CustomVideoPlayer";
import PdfViewerDialog from "@/components/courses/PdfViewerDialog";
import { progressApi } from "@/api/progressApi";
import { studentApi } from "@/api/studentApi";
import ContentComments from "@/components/courses/ContentComments";
import EmptyState from "@/components/empty-state";
import CertificateModal from "@/components/courses/CertificateModal";
import QuizPlayer from "@/components/courses/QuizPlayer";
import { Input } from "@/components/ui/input";

// A simple markdown-like formatter to render tutor responses beautifully
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
            <div
              key={index}
              className="rounded-xl border border-muted/50 overflow-hidden my-3 shadow-2xs"
            >
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
              if (
                line.trim().startsWith("* ") ||
                line.trim().startsWith("- ")
              ) {
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
          <code
            key={cIdx}
            className="bg-muted text-xs px-1.5 py-0.5 rounded-sm font-mono text-orange-600 dark:text-orange-400 font-semibold"
          >
            {cPart.substring(1, cPart.length - 1)}
          </code>
        );
      }
      return cPart;
    });
  });
};

const ContentDetails = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parent = searchParams.get("parent");
  const folder_id = searchParams.get("folder_id");
  const play = searchParams.get("play");

  const [activeVideo, setActiveVideo] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // AI Helper States
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorSessionId, setTutorSessionId] = useState(null);
  const [tutorInput, setTutorInput] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const [practiceQuizAnswers, setPracticeQuizAnswers] = useState({});
  const [practiceQuizSubmitted, setPracticeQuizSubmitted] = useState(false);
  const [practiceQuizIdx, setPracticeQuizIdx] = useState(0);

  const tutorMessagesEndRef = useRef(null);

  const { data: tutorSessionDetails } =
    aiApi.useGetChatSessionDetails(tutorSessionId);
  const sendTutorMessageMutation = aiApi.useSendChatMessage();
  const generateNotesMutation = aiApi.useGenerateNotes();
  const generateQuizMutation = aiApi.useGenerateQuiz();

  // Fetch tutor sessions list to sync active tutor session for this lesson
  const { data: sessions } = aiApi.useGetChatSessions();

  useEffect(() => {
    if (sessions && activeVideo) {
      const matching = sessions.find((s) => s.lessonId === activeVideo.id);
      if (matching) {
        setTutorSessionId(matching._id);
      } else {
        setTutorSessionId(null);
      }
    }
  }, [sessions, activeVideo]);

  useEffect(() => {
    tutorMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tutorSessionDetails?.messages, sendTutorMessageMutation.isPending]);

  const handleSendTutorMessage = (e, customMessage = null) => {
    if (e) e.preventDefault();
    const text = customMessage || tutorInput;
    if (!text.trim() || sendTutorMessageMutation.isPending) return;

    sendTutorMessageMutation.mutate(
      {
        sessionId: tutorSessionId,
        message: text,
        lessonId: activeVideo.id,
        lessonTitle: activeVideo.title,
      },
      {
        onSuccess: (res) => {
          setTutorInput("");
          const session = res.data?.data?.session;
          if (session && !tutorSessionId) {
            setTutorSessionId(session._id);
          }
        },
      },
    );
  };

  const handleGenerateNotes = () => {
    generateNotesMutation.mutate(
      {
        lessonTitle: activeVideo.title,
      },
      {
        onSuccess: (data) => {
          setNotesText(data.notes);
          setNotesOpen(true);
        },
      },
    );
  };

  const handleGeneratePracticeQuiz = () => {
    generateQuizMutation.mutate(
      {
        lessonTitle: activeVideo.title,
      },
      {
        onSuccess: (data) => {
          setGeneratedQuiz(data);
          setPracticeQuizAnswers({});
          setPracticeQuizSubmitted(false);
          setPracticeQuizIdx(0);
          setQuizOpen(true);
        },
      },
    );
  };

  const [notesCopied, setNotesCopied] = useState(false);
  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notesText);
    setNotesCopied(true);
    setTimeout(() => setNotesCopied(false), 2000);
  };

  const { course_id } = useParams();
  const earnMutation = studentApi.useEarnRewards();

  // Progress Query & Mutation
  const { data: progressData } = progressApi.useGetProgress(
    !isAdmin ? course_id : null,
  );
  const { data: courseDetails } = courseApi.useGetCourseDetails(course_id);
  const courseTitle = courseDetails?.overview?.title || "This Course";
  const toggleProgressMutation = progressApi.useToggleProgress();

  const { data: videoProgress } = productivityApi.useGetVideoProgress();

  const { data, isPending, isError } =
    courseApi.useGetAllCourseContents(folder_id);

  // Auto-play video if "play" query param is present
  useEffect(() => {
    if (play && data && !activeVideo) {
      const match = data.find((c) => c._id === play);
      if (match && match.content_type === "VIDEO") {
        const savedItem = videoProgress?.find(
          (vp) => vp.contentId?._id === play,
        );
        const initialTime = savedItem ? savedItem.playbackTime : 0;

        setActiveQuiz(null);
        setActiveVideo({
          url: match.content?.url || match.content,
          title: match.title,
          id: match._id,
          initialTime,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [play, data, activeVideo, videoProgress]);

  if (isError) return <ErrorOccured />;
  if (isPending)
    return (
      <div>
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
          {[1, 2, 3, 4].map((c) => (
            <div
              key={c}
              className="bg-card dark:bg-muted/40 h-18 border rounded-lg p-3 animate-pulse"
            />
          ))}
        </section>
      </div>
    );

  const completedSet = new Set(progressData?.completed_contents || []);

  const handleToggleComplete = (contentId) => {
    if (toggleProgressMutation.isPending) return;
    const wasCompleted = completedSet.has(contentId);

    toggleProgressMutation.mutate(
      {
        course_id,
        content_id: contentId,
      },
      {
        onSuccess: () => {
          if (!wasCompleted) {
            earnMutation.mutate({ xp: 20, badge: "Knowledge Seeker" });
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar for Students */}
      {!isAdmin && progressData && (
        <div className="bg-card border rounded-xl p-4 shadow-sm space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground">Course Completion Progress</span>
            <span className="text-orange-500">
              {progressData.progress_percentage}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${progressData.progress_percentage}%` }}
            />
          </div>
          {progressData.progress_percentage === 100 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-muted/50 mt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Congratulations! You have completed the course!</span>
              </div>
              <Button
                onClick={() => setIsCertificateOpen(true)}
                className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-sm cursor-pointer rounded-md h-8 py-0 px-3"
              >
                Claim Certificate
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Video Player Section */}
      {activeVideo && (
        <div className="bg-card border rounded-xl p-4 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base md:text-lg text-foreground truncate max-w-[80%]">
              Now Playing: {activeVideo.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveVideo(null)}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CustomVideoPlayer
            url={activeVideo.url}
            title={activeVideo.title}
            contentId={activeVideo.id}
            courseId={course_id}
            isAdmin={isAdmin}
            initialTime={activeVideo.initialTime || 0}
          />

          {/* AI Helper Tools Row for Students */}
          {!isAdmin && (
            <div className="flex gap-2 flex-wrap items-center bg-muted/20 border p-3 rounded-xl animate-in fade-in duration-300">
              <span className="text-xs font-bold text-muted-foreground mr-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500/10" />
                Lesson AI Helper:
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 cursor-pointer rounded-lg hover:bg-muted font-bold"
                onClick={() => setTutorOpen(true)}
              >
                <Bot className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Explain
                Topic
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 cursor-pointer rounded-lg hover:bg-muted font-bold"
                onClick={handleGenerateNotes}
                disabled={generateNotesMutation.isPending}
              >
                {generateNotesMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                )}
                Generate Notes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 cursor-pointer rounded-lg hover:bg-muted font-bold"
                onClick={handleGeneratePracticeQuiz}
                disabled={generateQuizMutation.isPending}
              >
                {generateQuizMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Brain className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                )}
                Generate Practice Quiz
              </Button>
            </div>
          )}

          {/* Discussion comments underneath video player */}
          <ContentComments contentId={activeVideo.id} />
        </div>
      )}

      {/* Active Quiz Section */}
      {activeQuiz && (
        <div className="bg-card border rounded-xl p-4 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-base md:text-lg text-foreground truncate max-w-[80%]">
              Assessment: {activeQuiz.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveQuiz(null)}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <QuizPlayer
            quizId={activeQuiz.quizId}
            title={activeQuiz.title}
            onComplete={() => {
              if (!completedSet.has(activeQuiz.id)) {
                handleToggleComplete(activeQuiz.id);
              }
            }}
          />

          {/* Discussion comments underneath quiz */}
          <ContentComments contentId={activeQuiz.id} />
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl text-foreground">{parent}</h2>
          <div className="border-b-primary border-b-2 pb-1 font-[550] mt-6 w-32">
            <span className="flex items-center text-foreground">
              {parent}
              <div className="flex items-center justify-center ml-1 bg-secondary rounded-full text-xs p-1 h-5 w-5">
                {data.length}
              </div>
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                navigate(
                  `/admin/courses/${course_id}/folders/new-folder?parent_id=${folder_id}`,
                )
              }
            >
              <Plus /> New Folder
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() =>
                navigate(
                  `/admin/courses/${course_id}/contents/new-content?folder_id=${folder_id}`,
                )
              }
            >
              <Plus /> New {parent}
            </Button>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState
          title={`No ${parent || "Content"} Available`}
          description={
            isAdmin
              ? "Create subfolders or upload files to populate this section."
              : "No learning materials have been posted in this section yet."
          }
          icon={FileText}
          actionLabel={isAdmin ? `Add New ${parent || "Content"}` : null}
          onAction={
            isAdmin
              ? () =>
                  navigate(
                    `/admin/courses/${course_id}/contents/new-content?folder_id=${folder_id}`,
                  )
              : null
          }
        />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
          {data.map((c) => {
            const isVideo = c.content_type === "VIDEO";
            const isPdf = c.content_type === "PDF";
            const isQuiz = c.content_type === "QUIZ";
            const isCompleted = completedSet.has(c._id);

            const cardContent = (
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-3 items-center min-w-0 flex-1">
                  {/* Complete checkbox trigger for students */}
                  {!isAdmin && (
                    <button
                      onClick={() => handleToggleComplete(c._id)}
                      className="cursor-pointer text-muted-foreground hover:text-green-500 transition-colors shrink-0"
                      title={
                        isCompleted ? "Mark as Incomplete" : "Mark as Completed"
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50/10" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  <div className="w-16 h-10 overflow-hidden rounded-md shrink-0 border bg-muted">
                    <img
                      src={
                        c.thumbnail ? c.thumbnail.url : "/course_banner_bg.png"
                      }
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`font-semibold text-sm truncate block text-foreground ${isCompleted && !isAdmin ? "line-through text-muted-foreground" : ""}`}
                    >
                      {c.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
                      {c.content_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && <ContentOptionsMenu prevContent={c} />}
                  {isPdf ? (
                    <PdfViewerDialog pdfUrl={c.content.url} title={c.title}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer rounded-full h-8 w-8 hover:bg-secondary"
                      >
                        <ChevronRight className="w-4 h-4 text-orange-500" />
                      </Button>
                    </PdfViewerDialog>
                  ) : isVideo ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`cursor-pointer rounded-full h-8 w-8 hover:bg-secondary ${
                        activeVideo?.id === c._id
                          ? "text-orange-500 bg-secondary"
                          : ""
                      }`}
                      onClick={() => {
                        setActiveQuiz(null); // Close quiz if video opened
                        const savedItem = videoProgress?.find(
                          (vp) => vp.contentId?._id === c._id,
                        );
                        const initialTime = savedItem
                          ? savedItem.playbackTime
                          : 0;
                        setActiveVideo({
                          url: c.content?.url || c.content,
                          title: c.title,
                          id: c._id,
                          initialTime,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    </Button>
                  ) : isQuiz ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`cursor-pointer rounded-full h-8 w-8 hover:bg-secondary ${
                        activeQuiz?.quizId === (c.quiz_id?._id || c.quiz_id)
                          ? "text-orange-500 bg-secondary"
                          : ""
                      }`}
                      onClick={() => {
                        setActiveVideo(null); // Close video if quiz opened
                        setActiveQuiz({
                          quizId: c.quiz_id?._id || c.quiz_id,
                          title: c.title,
                          id: c._id,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer rounded-full h-8 w-8 hover:bg-secondary"
                      asChild
                    >
                      <a
                        href={c.content?.url || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={c._id}
                className={`bg-card dark:bg-muted/40 border rounded-lg p-3 shadow-2xs hover:shadow-xs transition-all ${
                  activeVideo?.id === c._id ||
                  activeQuiz?.quizId === (c.quiz_id?._id || c.quiz_id)
                    ? "border-orange-500 ring-1 ring-orange-500/50"
                    : ""
                } ${isCompleted && !isAdmin ? "opacity-90 border-green-500/30 bg-green-500/2 dark:bg-green-500/1" : ""}`}
              >
                {cardContent}
              </div>
            );
          })}
        </section>
      )}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        courseTitle={courseTitle}
      />

      {/* AI Tutor Chat Sheet */}
      <Sheet open={tutorOpen} onOpenChange={setTutorOpen}>
        <SheetContent className="sm:max-w-md w-full flex flex-col justify-between h-full p-0 overflow-hidden">
          <SheetHeader className="p-4 border-b bg-muted/15 flex flex-row items-center gap-3 space-y-0">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-sm font-extrabold text-foreground">
                AI Topic Tutor
              </SheetTitle>
              <span className="text-[10px] text-muted-foreground font-semibold block">
                Lesson: {activeVideo?.title}
              </span>
            </div>
          </SheetHeader>

          {/* Messages log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
            {!tutorSessionId &&
            (!tutorSessionDetails ||
              tutorSessionDetails.messages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                <Sparkles className="w-8 h-8 text-orange-500 fill-orange-500/10" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-foreground">
                    Ask me anything!
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                    I can explain recursion simply, summarize this video, or
                    generate practice questions based on this lesson.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full pt-2">
                  {[
                    "Explain this topic simply.",
                    "Summarize this lesson.",
                    "Generate a practice question.",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendTutorMessage(null, prompt)}
                      className="text-left p-2.5 bg-card border hover:border-orange-500/30 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-orange-600 cursor-pointer shadow-3xs transition-all"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tutorSessionDetails?.messages?.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2 max-w-[90%] ${
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] ${
                          isUser
                            ? "bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground border"
                        }`}
                      >
                        {isUser ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3 text-orange-500" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl p-3 shadow-3xs border text-xs ${
                          isUser
                            ? "bg-linear-to-b from-orange-500/10 to-red-500/5 border-orange-500/10 text-foreground"
                            : "bg-card border-border/70 text-foreground"
                        }`}
                      >
                        <FormattedMessage text={msg.content} />
                      </div>
                    </div>
                  );
                })}

                {sendTutorMessageMutation.isPending && (
                  <div className="flex gap-2 max-w-[80%] mr-auto">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-muted border">
                      <Bot className="w-3 h-3 text-orange-500 animate-bounce" />
                    </div>
                    <div className="bg-card border border-border/70 rounded-2xl p-3 shadow-3xs flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Tutor is writing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={tutorMessagesEndRef} />
              </div>
            )}
          </div>

          {/* Form input */}
          <form
            onSubmit={handleSendTutorMessage}
            className="p-3 border-t bg-muted/5 flex gap-2"
          >
            <Input
              placeholder={
                sendTutorMessageMutation.isPending
                  ? "Generating response..."
                  : "Ask the AI tutor..."
              }
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              disabled={sendTutorMessageMutation.isPending}
              className="text-xs h-9 rounded-xl shadow-none focus-visible:ring-orange-500"
            />
            <Button
              type="submit"
              disabled={
                !tutorInput.trim() || sendTutorMessageMutation.isPending
              }
              className="h-9 w-9 bg-linear-to-b from-orange-400 to-red-500 text-white rounded-xl cursor-pointer p-0 flex items-center justify-center"
            >
              {sendTutorMessageMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* AI Notes Dialog */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              AI Study Notes: {activeVideo?.title}
            </DialogTitle>
            <DialogDescription>
              Gemini-synthesized concise learning concepts, takeaways, and code
              syntax references.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/15 border border-muted/50 rounded-2xl p-5 mt-2">
            {notesText ? (
              <FormattedMessage text={notesText} />
            ) : (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex sm:justify-between items-center w-full gap-2">
            <Button
              variant="outline"
              onClick={handleCopyNotes}
              className="text-xs rounded-xl cursor-pointer font-bold border-border/80"
            >
              {notesCopied ? (
                <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 mr-1.5" />
              )}
              {notesCopied ? "Copied!" : "Copy Notes"}
            </Button>
            <Button
              onClick={() => setNotesOpen(false)}
              className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-xl cursor-pointer text-xs font-bold"
            >
              Close Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Practice Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Practice Quiz: {activeVideo?.title}
            </DialogTitle>
            <DialogDescription>
              Test your understanding of the concepts explained in this video
              lesson.
            </DialogDescription>
          </DialogHeader>

          {generateQuizMutation.isPending ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <span className="text-xs text-muted-foreground font-semibold">
                Gemini is writing quiz questions...
              </span>
            </div>
          ) : !generatedQuiz || !generatedQuiz.questions ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Failed to generate quiz. Please try again.
            </div>
          ) : !practiceQuizSubmitted ? (
            // Active quiz view
            <div className="space-y-6 py-2">
              {/* Question display */}
              <div className="space-y-3">
                <span className="text-xs bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full">
                  Question {practiceQuizIdx + 1} of{" "}
                  {generatedQuiz.questions.length}
                </span>
                <h4 className="font-extrabold text-sm text-foreground">
                  {generatedQuiz.questions[practiceQuizIdx].question}
                </h4>
              </div>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-2.5">
                {generatedQuiz.questions[practiceQuizIdx].options?.map(
                  (option, idx) => {
                    const isSelected =
                      practiceQuizAnswers[practiceQuizIdx] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          setPracticeQuizAnswers((prev) => ({
                            ...prev,
                            [practiceQuizIdx]: option,
                          }))
                        }
                        className={`w-full text-left p-3.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-500/10 border-orange-500 text-orange-600 shadow-2xs"
                            : "bg-card border-border/70 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  },
                )}
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-4 border-t border-muted/50">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={practiceQuizIdx === 0}
                  onClick={() => setPracticeQuizIdx((prev) => prev - 1)}
                  className="rounded-xl cursor-pointer"
                >
                  Back
                </Button>
                {practiceQuizIdx < generatedQuiz.questions.length - 1 ? (
                  <Button
                    size="sm"
                    disabled={!practiceQuizAnswers[practiceQuizIdx]}
                    onClick={() => setPracticeQuizIdx((prev) => prev + 1)}
                    className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-xl cursor-pointer"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={!practiceQuizAnswers[practiceQuizIdx]}
                    onClick={() => setPracticeQuizSubmitted(true)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl cursor-pointer"
                  >
                    Submit Practice Session
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Score and review screen
            <div className="space-y-6 py-2">
              {/* Score card */}
              {(() => {
                let score = 0;
                generatedQuiz.questions.forEach((q, idx) => {
                  if (practiceQuizAnswers[idx] === q.answer) score++;
                });
                return (
                  <div className="bg-muted/30 border border-muted/50 rounded-2xl p-5 text-center space-y-2">
                    <h4 className="text-2xl font-black text-foreground">
                      Your Score: {score} / {generatedQuiz.questions.length}
                    </h4>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {score === generatedQuiz.questions.length
                        ? "Perfect score! You fully mastered this concept. 🌟"
                        : "Good try! Review the explanations below to improve."}
                    </p>
                  </div>
                );
              })()}

              {/* Detailed review list */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {generatedQuiz.questions.map((q, idx) => {
                  const selected = practiceQuizAnswers[idx];
                  const isCorrect = selected === q.answer;
                  return (
                    <div
                      key={idx}
                      className="bg-card border border-border/80 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex gap-2 items-center">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                            isCorrect ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <h5 className="font-extrabold text-xs text-foreground line-clamp-2">
                          {q.question}
                        </h5>
                      </div>

                      <div className="text-[11px] font-semibold space-y-1 pl-7">
                        <p
                          className={
                            isCorrect ? "text-green-600" : "text-red-500"
                          }
                        >
                          Your choice:{" "}
                          <span className="font-bold">
                            {selected || "Not Answered"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-green-600">
                            Correct choice:{" "}
                            <span className="font-bold">{q.answer}</span>
                          </p>
                        )}
                      </div>

                      {/* Explanation box */}
                      <div className="pl-7 pt-2 border-t border-dashed">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                          Tutor Explanation
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => setQuizOpen(false)}
                  className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-xl cursor-pointer"
                >
                  Close Practice Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentDetails;
