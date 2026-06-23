import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Award,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { quizApi } from "@/api/quizApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Brain } from "lucide-react";

export const QuizPlayer = ({ quizId, title, onComplete }) => {
  const { data: quiz, isPending: loading, error } = quizApi.useGetQuizDetails(quizId);
  const questions = quiz?.questions || [];

  // Quiz States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Initialize/Reset state on quizId or questions change
  useEffect(() => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setConfirmSubmitOpen(false);
    if (questions.length > 0) {
      setTimeLeft(questions.length * 60); // 60 seconds per question
    }
  }, [quizId, questions.length]);

  // Timer logic
  useEffect(() => {
    if (loading || quizFinished || questions.length === 0 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quizFinished, questions.length, timeLeft]);

  const handleSelectOption = (option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: option,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let calculated = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correct = q.correctAnswer || q.correct_answer;
      if (selected === correct) {
        calculated += 1;
      }
    });
    return calculated;
  };

  const handleForceSubmit = () => {
    setQuizFinished(true);
    setConfirmSubmitOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSubmitQuiz = () => {
    setConfirmSubmitOpen(true);
  };

  const confirmSubmit = () => {
    setQuizFinished(true);
    setConfirmSubmitOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setConfirmSubmitOpen(false);
    if (questions.length > 0) {
      setTimeLeft(questions.length * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
        <span className="text-sm text-muted-foreground">Loading Quiz Questions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-xl text-destructive text-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <h4 className="font-bold text-sm">Failed to load Quiz</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error?.message || "Failed to load quiz"}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 bg-card border rounded-xl text-muted-foreground text-sm">
        This quiz is currently empty.
      </div>
    );
  }

  if (quizFinished) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
        {/* Results Summary Card */}
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-orange-500">
              <Award className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider text-xs">Quiz Completed</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Review your answers below to verify explanations and reinforce your knowledge.
            </p>

            <div className="pt-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-border hover:bg-secondary cursor-pointer gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Assessment
              </Button>
            </div>
          </div>

          {/* Circle score chart */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className={`transition-all duration-1000 ${
                    passed ? "stroke-green-500" : "stroke-orange-500"
                  }`}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-foreground">{score}/{questions.length}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{percentage}% Score</span>
              </div>
            </div>
            <span
              className={`mt-4 px-3 py-1 rounded-full text-xs font-bold ${
                passed
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                  : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
              }`}
            >
              {passed ? "PASSED (>= 70%)" : "FAILED (< 70%)"}
            </span>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-6">
          <h4 className="font-bold text-lg text-foreground border-b pb-2 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Review Your Answers
          </h4>

          {questions.map((q, idx) => {
            const selected = selectedAnswers[idx];
            const correct = q.correctAnswer || q.correct_answer;
            const isCorrect = selected === correct;

            return (
              <div
                key={idx}
                className={`p-5 border rounded-xl bg-card space-y-4 transition-all ${
                  isCorrect
                    ? "border-green-500/30 dark:border-green-500/20 hover:border-green-500/50"
                    : "border-red-500/30 dark:border-red-500/20 hover:border-red-500/50"
                }`}
              >
                {/* Question Info Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Question {idx + 1}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                      isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4.5 h-4.5" />
                        Incorrect
                      </>
                    )}
                  </span>
                </div>

                {/* Question Text */}
                <h5 className="font-bold text-foreground text-sm leading-relaxed">
                  {q.question}
                </h5>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt) => {
                    const isSelected = selected === opt;
                    const isCorrectOption = correct === opt;

                    let optStyle = "border-border/60 opacity-60";
                    if (isCorrectOption) {
                      optStyle = "border-green-500 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold ring-1 ring-green-500/25";
                    } else if (isSelected) {
                      optStyle = "border-red-500 bg-red-500/5 text-red-600 dark:text-red-400 font-semibold ring-1 ring-red-500/25";
                    }

                    return (
                      <div
                        key={opt}
                        className={`p-3 border rounded-lg text-xs flex justify-between items-center transition-all ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isCorrectOption && <Check className="w-4 h-4 text-green-500 shrink-0" />}
                        {isSelected && !isCorrectOption && <X className="w-4 h-4 text-red-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 bg-muted/30 border border-border/40 rounded-lg text-xs leading-relaxed text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-orange-500/70 shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const selectedOpt = selectedAnswers[currentIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-5xl mx-auto animate-in fade-in duration-300 items-start">
      {/* Main Question Panel */}
      <div className="lg:col-span-3 bg-card border rounded-2xl p-5 md:p-6 shadow-sm space-y-6 flex flex-col min-h-[400px] justify-between">
        <div className="space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b pb-3.5">
            <div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <h3 className="font-extrabold text-foreground text-base md:text-lg mt-0.5 truncate max-w-xs md:max-w-md">
                {title}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border shrink-0">
              {Object.keys(selectedAnswers).length} / {questions.length} Answered
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options.map((option) => {
                const isSelected = selectedOpt === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-3.5 border rounded-xl text-xs transition-all duration-200 cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/30 font-semibold"
                        : "border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{option}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-orange-500 bg-orange-500" : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Buttons footer */}
        <div className="flex justify-between pt-4 border-t mt-8">
          <Button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary text-xs h-9 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold text-xs cursor-pointer rounded-md h-9 px-4"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-xs cursor-pointer rounded-md h-9 px-4"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Info/Nav Grid Panel */}
      <div className="lg:col-span-1 space-y-5">
        {/* Timer Card */}
        {timeLeft > 0 && (
          <div className="bg-card border rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Time Remaining
              </span>
              <div className="text-2xl font-black text-foreground font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                timeLeft <= 30
                  ? "bg-red-500/10 text-red-500 animate-pulse border border-red-500/20"
                  : "bg-orange-500/10 text-orange-500 border border-orange-500/10"
              }`}
            >
              <Timer className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Questions Navigate Matrix Card */}
        <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-foreground">Assessment Progress</h5>
            <p className="text-[10px] text-muted-foreground">Select a number to jump to question</p>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {questions.map((_, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = selectedAnswers[idx] !== undefined;

              let btnStyle = "border-border text-muted-foreground hover:bg-secondary/40";
              if (isCurrent) {
                btnStyle = "border-orange-500 bg-orange-500/5 text-orange-500 font-bold ring-1 ring-orange-500/25";
              } else if (isAnswered) {
                btnStyle = "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 border rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="border-t border-border/50 pt-3 flex flex-col gap-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-md border border-orange-500 bg-orange-500/5 shrink-0" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-md border border-green-500/20 bg-green-500/5 shrink-0" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-md border border-border bg-background shrink-0" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Dialog */}
      <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <DialogContent className="max-w-sm bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange-500" />
              Submit Assessment?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              You have answered {Object.keys(selectedAnswers).length} of {questions.length} questions.
              Are you sure you want to finish and submit the quiz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmSubmitOpen(false)}
              className="text-xs cursor-pointer bg-background text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              className="text-xs bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold cursor-pointer rounded-md h-9 px-4"
            >
              Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPlayer;
