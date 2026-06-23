import { useState } from "react";
import { quizApi } from "@/api/quizApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash, Brain, AlertCircle, Trash2 } from "lucide-react";
import LoadingButton from "@/components/loading-button";
import EmptyState from "@/components/empty-state";

export const AdminQuizzes = () => {
  const { data: quizzes = [], isPending, isError } = quizApi.useGetAllQuizzes();
  const createMutation = quizApi.useCreateQuiz();
  const updateMutation = quizApi.useUpdateQuiz();
  const deleteMutation = quizApi.useDeleteQuiz();

  // Dialog / Sheet states
  const [openSheet, setOpenSheet] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [deleteQuizId, setDeleteQuizId] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" }
  ]);

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setTitle("");
    setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" }]);
    setOpenSheet(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    // Deep copy questions
    setQuestions(quiz.questions.map((q) => ({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    })));
    setOpenSheet(true);
  };

  const handleDeleteClick = (quizId) => {
    setDeleteQuizId(quizId);
  };

  // Form helpers
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" }
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIndex) {
          const newOpts = [...q.options];
          newOpts[optIndex] = value;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Basic client validation
    for (const q of questions) {
      if (!q.question.trim()) {
        alert("Please fill in all question text fields.");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        alert("Please fill in all option choices.");
        return;
      }
      if (!q.correctAnswer.trim()) {
        alert(`Please specify the correct answer for question: "${q.question}"`);
        return;
      }
      if (!q.options.includes(q.correctAnswer)) {
        alert(`Correct answer must match one of the options for question: "${q.question}"`);
        return;
      }
    }

    const payload = { title, questions };

    if (editingQuiz) {
      updateMutation.mutate(
        { quizId: editingQuiz._id, ...payload },
        {
          onSuccess: () => setOpenSheet(false),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setOpenSheet(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl text-foreground">Manage Quizzes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create and edit interactive assessments for your courses.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="cursor-pointer bg-linear-to-b from-orange-400 to-red-500 text-white text-sm">
          <Plus className="w-4 h-4 mr-1" /> Create Quiz
        </Button>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border h-40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 border rounded-xl text-destructive text-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <h4 className="font-bold">Failed to load quizzes</h4>
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No Quizzes Found"
          description="Build customized multiple choice quizzes to test your students' knowledge."
          icon={Brain}
          actionLabel="Create First Quiz"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-card border rounded-xl p-5 shadow-xs flex flex-col justify-between group hover:border-orange-500/50 transition-colors">
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500 w-fit">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground text-base truncate">{quiz.title}</h3>
                <span className="text-xs text-muted-foreground block">
                  {quiz.questions.length} Question{quiz.questions.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <Button
                  onClick={() => handleOpenEdit(quiz)}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 cursor-pointer text-muted-foreground hover:text-foreground"
                  title="Edit Quiz"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  onClick={() => handleDeleteClick(quiz._id)}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 cursor-pointer text-destructive hover:bg-destructive/5 border-destructive/20 hover:border-destructive"
                  title="Delete Quiz"
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="w-[95vw] max-w-[1200px] bg-card text-foreground p-0 flex flex-col h-full gap-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-orange-500" />
              {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs">
              Fill in the details and add your quiz questions below.
            </SheetDescription>
          </SheetHeader>

          {/* Form scroll container */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit} id="quiz-form" className="space-y-6">
              {/* Title field */}
              <div className="space-y-1.5">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input
                  id="quiz-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="React Hooks Assessment"
                  className="bg-background text-sm"
                  required
                />
              </div>

              {/* Questions builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-sm text-foreground">Questions List</h4>
                  <Button type="button" onClick={handleAddQuestion} size="sm" variant="outline" className="text-xs cursor-pointer">
                    + Add Question
                  </Button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-5 border rounded-xl bg-muted/20 relative space-y-4 mb-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-orange-500">Question #{qIdx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Question text</Label>
                      <Input
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIdx, "question", e.target.value)}
                        placeholder="What is the purpose of useEffect Hook?"
                        className="bg-background text-xs"
                        required
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((option, optIdx) => (
                        <div key={optIdx} className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Option {optIdx + 1}</Label>
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Choice ${optIdx + 1}`}
                            className="bg-background text-xs"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer & Explanation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Correct Answer</Label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(qIdx, "correctAnswer", e.target.value)}
                          className="w-full h-9 px-3 border rounded-md bg-background text-xs text-foreground focus:outline-none"
                          required
                        >
                          <option value="">Select correct option</option>
                          {q.options.map((opt, idx) => (
                            <option key={idx} value={opt} disabled={!opt}>
                              {opt ? `Option ${idx + 1}: ${opt}` : `Option ${idx + 1} (Empty)`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Explanation (Optional)</Label>
                        <Input
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                          placeholder="Ex: useEffect runs side effects after renders."
                          className="bg-background text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>

          <div className="p-4 border-t bg-card flex gap-2 justify-end shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpenSheet(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              form="quiz-form"
              isPending={createMutation.isPending || updateMutation.isPending}
              loadingText="Saving Quiz"
              className="bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-semibold text-xs cursor-pointer rounded-md h-9 py-0 px-4"
            >
              Save Quiz
            </LoadingButton>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteQuizId} onOpenChange={(open) => !open && setDeleteQuizId(null)}>
        <DialogContent className="max-w-md bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Delete Quiz
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs pt-1">
              Are you sure you want to delete this quiz? This action is permanent and cannot be undone. All questions in this quiz will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteQuizId(null)}
              className="text-xs cursor-pointer bg-background text-foreground"
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={() => {
                if (deleteQuizId) {
                  deleteMutation.mutate(deleteQuizId, {
                    onSuccess: () => setDeleteQuizId(null),
                  });
                }
              }}
              isPending={deleteMutation.isPending}
              loadingText="Deleting..."
              variant="destructive"
              className="text-xs bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              Delete Quiz
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuizzes;
