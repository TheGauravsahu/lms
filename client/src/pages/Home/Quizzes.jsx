import { useState } from "react";
import { quizApi } from "@/api/quizApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Brain,  AlertCircle, Play,  } from "lucide-react";
import QuizPlayer from "@/components/courses/QuizPlayer";
import EmptyState from "@/components/empty-state";

export const Quizzes = () => {
  const { data: quizzes = [], isPending, isError } = quizApi.useGetAllQuizzes();
  const [activeQuiz, setActiveQuiz] = useState(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-orange-200 text-sm font-medium mb-2">
            <Brain className="w-4 h-4" />
            Assessments Hub
          </div>
          <h1 className="text-3xl font-extrabold">Test Your Knowledge 🧠</h1>
          <p className="text-orange-100 mt-2 max-w-md">
            Challenge yourself with interactive quizzes and track your performance.
          </p>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Quizzes List Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          Available Quizzes
        </h2>

        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border rounded-xl h-44 animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 border rounded-xl text-destructive text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <h4 className="font-bold">Failed to load quizzes</h4>
            <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page.</p>
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState
            title="No Quizzes Available"
            description="There are currently no quizzes published on the platform. Check back later!"
            icon={Brain}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {quizApi && quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-card border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-500/50 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500 w-fit">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base truncate group-hover:text-orange-500 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Assess your skills and consolidate your understanding.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 mt-5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {quiz.questions?.length || 0} Question{quiz.questions?.length !== 1 ? "s" : ""}
                  </span>

                  <Button
                    onClick={() => setActiveQuiz(quiz)}
                    className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-xs cursor-pointer rounded-md h-8 py-0 px-3 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-white" /> Attempt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Attempt Modal/Dialog */}
      <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="sm:max-w-3xl w-[95vw] bg-card text-foreground p-6 rounded-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange-500" />
              {activeQuiz?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please read each question carefully and select the best answer option.
            </DialogDescription>
          </DialogHeader>

          {activeQuiz && (
            <div className="mt-2">
              <QuizPlayer
                quizId={activeQuiz._id}
                title={activeQuiz.title}
                onComplete={() => {
                  // Optional completion callback
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quizzes;
