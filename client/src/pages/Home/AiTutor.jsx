import { useState, useEffect, useRef } from "react";
import { aiApi } from "@/api/aiApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  User,
  Plus,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  Terminal,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// A simple but effective markdown-like formatter to render tutor responses beautifully
const FormattedMessage = ({ text }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!text) return null;

  // Split by code blocks: ```lang ... ```
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
          // Extract code and language
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

        // Inline formatting: handle **bold** and bullet points
        const lines = part.split("\n");
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lIdx) => {
              // Handle bullet list items
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
  // Simple bold formatting: **bold**
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
    // Handle inline code: `code`
    const codeParts = bPart.split(/(`.*?`)/g);
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

const AiTutor = () => {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const { data: sessions = [], isPending: isSessionsPending } = aiApi.useGetChatSessions();
  const { data: activeSession, isPending: isSessionDetailsPending } =
    aiApi.useGetChatSessionDetails(activeSessionId);

  const sendMutation = aiApi.useSendChatMessage();
  const deleteMutation = aiApi.useDeleteChatSession();

  const handleSendMessage = (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || sendMutation.isPending) return;

    sendMutation.mutate(
      {
        sessionId: activeSessionId,
        message: textToSend,
      },
      {
        onSuccess: (res) => {
          setInputText("");
          const session = res.data?.data?.session;
          if (session && !activeSessionId) {
            setActiveSessionId(session._id);
          }
        },
      }
    );
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (activeSessionId === id) {
          setActiveSessionId(null);
        }
      },
    });
  };

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setInputText("");
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, sendMutation.isPending]);

  const starterPrompts = [
    { title: "Explain recursion simply", prompt: "Explain recursion simply with an example." },
    { title: "Summarize the event loop", prompt: "Explain the JavaScript event loop and how it works." },
    { title: "Generate practice questions", prompt: "Generate 3 coding practice questions on array manipulation." },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Sidebar - Sessions List */}
      <div className="md:col-span-1 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        <div className="p-4 border-b border-border/40 flex justify-between items-center">
          <span className="font-black text-sm text-foreground flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            Chat History
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleStartNewChat}
            className="h-8 w-8 text-orange-600 hover:text-orange-700 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-full"
            title="Start new chat"
          >
            <Plus className="w-4.5 h-4.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {isSessionsPending ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground font-medium">
              No chat history yet. Start explaining topics!
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => setActiveSessionId(session._id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  activeSessionId === session._id
                    ? "bg-orange-500/10 border-orange-500/35 text-orange-600 font-extrabold"
                    : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bot className={`w-4 h-4 shrink-0 ${activeSessionId === session._id ? "text-orange-500" : "text-muted-foreground"}`} />
                  <span className="text-xs truncate block pr-2">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session._id, e)}
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

      {/* Main Panel - Active Chat Screen */}
      <div className="md:col-span-3 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        
        {/* Active Session Header */}
        <div className="p-4 border-b border-border/40 bg-muted/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                {activeSession ? activeSession.title : "New AI Tutor Chat"}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {activeSession ? "Active Conversation" : "Ask questions to begin learning"}
              </p>
            </div>
          </div>
          {activeSessionId && (
            <Button
              onClick={handleStartNewChat}
              variant="outline"
              size="sm"
              className="text-xs rounded-xl cursor-pointer hover:bg-muted font-bold"
            >
              New Chat
            </Button>
          )}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5">
          {!activeSessionId && (!activeSession || activeSession.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="p-4 bg-orange-500/10 rounded-full text-orange-500 animate-bounce">
                <Sparkles className="w-10 h-10 fill-orange-500/10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">AI Tutor Assistant</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  I am your dedicated 24/7 computer science and coding tutor. Ask me to explain concepts, review code, or write interactive quizzes!
                </p>
              </div>

              {/* Starter Prompts */}
              <div className="w-full space-y-3 pt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block text-left">
                  Try standard queries
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {starterPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(null, item.prompt)}
                      className="w-full text-left p-3.5 bg-card border border-border/60 hover:border-orange-500/40 rounded-xl flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-orange-600 cursor-pointer shadow-2xs hover:shadow-xs transition-all duration-300 group"
                    >
                      <span>"{item.title}"</span>
                      <ArrowRight className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isSessionDetailsPending ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-xs text-muted-foreground mt-2 font-bold">Loading conversation...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSession.messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] ${
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                        isUser
                          ? "bg-linear-to-b from-orange-400 to-red-500 text-white"
                          : "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div
                      className={`rounded-2xl p-4 shadow-2xs border ${
                        isUser
                          ? "bg-linear-to-b from-orange-500/10 to-red-500/5 border-orange-500/20 text-foreground"
                          : "bg-card border-border/80 text-foreground"
                      }`}
                    >
                      <FormattedMessage text={msg.content} />
                    </div>
                  </div>
                );
              })}

              {/* Generating Loading State */}
              {sendMutation.isPending && (
                <div className="flex gap-3 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted text-muted-foreground border border-border/60">
                    <Bot className="w-4 h-4 text-orange-500 animate-bounce" />
                  </div>
                  <div className="bg-card border-border/80 border rounded-2xl p-4 shadow-2xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span className="text-xs text-muted-foreground font-semibold">Tutor is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border/40 bg-muted/5 flex items-center gap-3">
          <Input
            placeholder={
              sendMutation.isPending
                ? "Tutor is writing a response..."
                : "Ask your AI tutor anything..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sendMutation.isPending}
            className="flex-1 rounded-xl shadow-none focus-visible:ring-orange-500"
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || sendMutation.isPending}
            className="rounded-xl px-4 py-2 bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shrink-0 cursor-pointer shadow-sm hover:shadow"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4.5 h-4.5" />
            )}
          </Button>
        </form>
      </div>

    </div>
  );
};

export default AiTutor;
