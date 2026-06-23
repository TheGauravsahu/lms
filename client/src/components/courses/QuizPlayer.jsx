import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle, Timer, Award, RotateCcw, ChevronRight } from "lucide-react";
import { quizApi } from "@/api/quizApi";

export const QuizPlayer = ({ quizId, title, onComplete }) => {
  const { data: quiz, isPending: loading, error } = quizApi.useGetQuizDetails(quizId);
  const questions = quiz?.questions || [];

  // Quiz States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30s per question
  const [quizFinished, setQuizFinished] = useState(false);

  // Reset state on quizId change
  useEffect(() => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimeLeft(30);
    setQuizFinished(false);
  }, [quizId]);

  // Timer logic
  useEffect(() => {
    if (loading || quizFinished || questions.length === 0 || isSubmitted) return;

    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up! Auto-advance or auto-select empty
          handleNext(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, loading, quizFinished, questions.length, isSubmitted]);

  const handleSelectOption = (option) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: option,
    }));
  };

  const handleNext = (timeOut = false) => {
    // If not submitted yet, we submit the answer first
    if (!isSubmitted && !timeOut) {
      setIsSubmitted(true);
      const currentQuestion = questions[currentIdx];
      const selected = selectedAnswers[currentIdx];
      const correct = currentQuestion.correctAnswer || currentQuestion.correct_answer;
      if (selected === correct) {
        setScore((prev) => prev + 1);
      }
      return;
    }

    // Go to next question or finish
    setIsSubmitted(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setTimeLeft(30);
    setQuizFinished(false);
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
        <p className="text-[10px] text-muted-foreground mt-4">Make sure the quiz is created and valid.</p>
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
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="bg-card border rounded-xl p-8 shadow-md text-center max-w-lg mx-auto animate-in scale-in duration-300">
        <div className="p-4 bg-orange-500/10 dark:bg-orange-500/20 rounded-full w-fit mx-auto mb-4 text-orange-500">
          <Award className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-extrabold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">Assessment Completed!</p>

        {/* Score Ring / Bar */}
        <div className="my-6">
          <span className="text-5xl font-black text-orange-500">{score}</span>
          <span className="text-2xl text-muted-foreground"> / {questions.length}</span>
          <div className="text-xs font-semibold text-muted-foreground mt-1">({percentage}% score)</div>
          
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden max-w-xs mx-auto mt-4">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                passed ? "bg-green-500" : "bg-orange-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {passed ? (
          <div className="bg-green-500/5 border border-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-lg text-xs max-w-xs mx-auto mb-6 flex items-start gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Passed! You've unlocked the completion checkmark for this quiz. Keep it up!</span>
          </div>
        ) : (
          <div className="bg-orange-500/5 border border-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-lg text-xs max-w-xs mx-auto mb-6 flex items-start gap-2 text-left">
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Passing score is 70%. You can retry the quiz to improve your score.</span>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const selectedOpt = selectedAnswers[currentIdx];
  const correctOpt = currentQ.correctAnswer || currentQ.correct_answer;
  const explanation = currentQ.explanation;

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 md:p-6 shadow-md max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <h3 className="font-bold text-foreground text-base md:text-lg mt-0.5">{title}</h3>
        </div>

        {/* Timer countdown */}
        {!isSubmitted && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
            timeLeft <= 5
              ? "bg-red-500/10 text-red-500 animate-pulse"
              : "bg-orange-500/10 text-orange-500"
          }`}>
            <Timer className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Question Text */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-foreground leading-relaxed">
          {currentQ.question}
        </h4>

        {/* Options list */}
        <div className="grid grid-cols-1 gap-3">
          {currentQ.options.map((option) => {
            const isSelected = selectedOpt === option;
            const isCorrect = option === correctOpt;

            let optionStyle = "border-border hover:bg-secondary/40";
            if (isSelected) optionStyle = "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/30";
            
            if (isSubmitted) {
              if (isCorrect) {
                optionStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold";
              } else if (isSelected) {
                optionStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold";
              } else {
                optionStyle = "border-border opacity-60";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                disabled={isSubmitted}
                className={`w-full text-left p-3.5 border rounded-lg text-sm transition-all duration-200 cursor-pointer flex justify-between items-center ${optionStyle}`}
              >
                <span>{option}</span>
                {isSubmitted && isCorrect && <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0" />}
                {isSubmitted && isSelected && !isCorrect && <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback / Explanation Block */}
      {isSubmitted && (
        <div className={`p-4 rounded-lg text-xs leading-relaxed animate-in fade-in duration-300 ${
          selectedOpt === correctOpt
            ? "bg-green-500/5 border border-green-500/15 text-green-600 dark:text-green-400"
            : "bg-red-500/5 border border-red-500/15 text-red-600 dark:text-red-400"
        }`}>
          <div className="font-bold flex items-center gap-1 mb-1">
            {selectedOpt === correctOpt ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Incorrect.</span>
              </>
            )}
          </div>
          {explanation && <p className="mt-1 text-muted-foreground">{explanation}</p>}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end pt-2 border-t">
        <Button
          onClick={() => handleNext()}
          disabled={!isSubmitted && !selectedOpt}
          className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-sm cursor-pointer rounded-md px-4 py-2"
        >
          {isSubmitted
            ? currentIdx < questions.length - 1
              ? "Next Question"
              : "Finish Quiz"
            : "Submit Answer"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default QuizPlayer;
