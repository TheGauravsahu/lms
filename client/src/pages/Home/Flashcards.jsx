import { useState } from "react";
import { flashcardApi } from "@/api/flashcardApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Brain,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  RotateCw,
  CheckCircle,
  HelpCircle,
  Folder,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/empty-state";

const Flashcards = () => {
  const [activeSetId, setActiveSetId] = useState(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // Manual create form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCards, setNewCards] = useState([{ question: "", answer: "", difficulty: "MEDIUM" }]);

  // AI generate states
  const [aiTopic, setAiTopic] = useState("");

  // API hooks
  const { data: sets = [], isPending } = flashcardApi.useGetSets();
  const createMutation = flashcardApi.useCreateSet();
  const deleteMutation = flashcardApi.useDeleteSet();
  const generateMutation = flashcardApi.useGenerateAiSet();
  const toggleMasteryMutation = flashcardApi.useToggleMastery();

  const handleAddCardInput = () => {
    setNewCards([...newCards, { question: "", answer: "", difficulty: "MEDIUM" }]);
  };

  const handleRemoveCardInput = (index) => {
    if (newCards.length === 1) return;
    setNewCards(newCards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    const updated = [...newCards];
    updated[index][field] = value;
    setNewCards(updated);
  };

  const handleCreateSet = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast.error("Title is required");
    const validCards = newCards.filter((c) => c.question.trim() && c.answer.trim());
    if (validCards.length === 0) return toast.error("Add at least one valid card");

    createMutation.mutate(
      {
        title: newTitle,
        description: newDesc,
        cards: validCards,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setNewTitle("");
          setNewDesc("");
          setNewCards([{ question: "", answer: "", difficulty: "MEDIUM" }]);
        },
      }
    );
  };

  const handleGenerateAi = (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) return toast.error("Topic is required");

    generateMutation.mutate(
      { topic: aiTopic },
      {
        onSuccess: (res) => {
          setAiDialogOpen(false);
          setAiTopic("");
          const createdSet = res.data?.data;
          if (createdSet?._id) {
            setActiveSetId(createdSet._id);
            setCurrentCardIdx(0);
            setIsFlipped(false);
          }
        },
      }
    );
  };

  const handleDeleteSet = (id, e) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (activeSetId === id) {
          setActiveSetId(null);
        }
      },
    });
  };

  const activeSet = sets.find((s) => s._id === activeSetId);
  const totalCards = activeSet?.cards?.length || 0;
  const currentCard = activeSet?.cards?.[currentCardIdx];
  const masteredCards = activeSet?.cards?.filter((c) => c.isMastered)?.length || 0;

  const handleToggleMastery = () => {
    if (!activeSetId || !currentCard) return;
    toggleMasteryMutation.mutate({ setId: activeSetId, cardId: currentCard._id });
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx((prev) => (prev + 1) % totalCards);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx((prev) => (prev - 1 + totalCards) % totalCards);
    }, 150);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-6rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Sidebar - Decks List */}
      <div className="md:col-span-1 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        <div className="p-4 border-b border-border/40 flex justify-between items-center">
          <span className="font-black text-sm text-foreground flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-orange-500" />
            Study Decks
          </span>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setAiDialogOpen(true)}
              className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full"
              title="Generate with AI"
            >
              <Sparkles className="w-4 h-4 fill-orange-500/10" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCreateDialogOpen(true)}
              className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full"
              title="Create new deck"
            >
              <Plus className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {isPending ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : sets.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground font-medium">
              No flashcards yet. Create one or generate with AI!
            </div>
          ) : (
            sets.map((set) => {
              const masteredCount = set.cards.filter((c) => c.isMastered).length;
              const percent = Math.round((masteredCount / set.cards.length) * 100);

              return (
                <div
                  key={set._id}
                  onClick={() => {
                    setActiveSetId(set._id);
                    setCurrentCardIdx(0);
                    setIsFlipped(false);
                  }}
                  className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                    activeSetId === set._id
                      ? "bg-orange-500/10 border-orange-500/35 text-orange-600 font-extrabold"
                      : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Folder className="w-4 h-4 shrink-0 text-orange-500" />
                      <span className="text-xs truncate block font-bold pr-1">{set.title}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold mt-1 block">
                      {set.cards.length} cards • {percent}% Mastered
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSet(set._id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Study Panel */}
      <div className="md:col-span-3 bg-card border border-border/50 rounded-2xl flex flex-col justify-between overflow-hidden h-full shadow-xs">
        
        {/* Active Session Header */}
        <div className="p-4 border-b border-border/40 bg-muted/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                {activeSet ? activeSet.title : "Study Desk"}
              </h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {activeSet ? activeSet.description || "Active Revision Deck" : "Select or create a deck to start learning"}
              </p>
            </div>
          </div>
          {activeSetId && (
            <div className="text-xs font-bold bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full border border-orange-500/20">
              Mastery: {masteredCards} / {totalCards} ({Math.round((masteredCards / totalCards) * 100)}%)
            </div>
          )}
        </div>

        {/* Study Zone */}
        <div className="flex-1 p-6 bg-muted/5 flex flex-col items-center justify-center overflow-y-auto">
          {!activeSetId ? (
            <div className="max-w-md text-center space-y-6">
              <div className="p-4 bg-orange-500/10 rounded-full text-orange-500 animate-bounce inline-block">
                <Sparkles className="w-10 h-10 fill-orange-500/10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">AI Flashcards Studio</h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  Study core development topics using AI generated or custom created decks. Retain information faster with spaced repetition flipcards!
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Button
                  onClick={() => setAiDialogOpen(true)}
                  className="bg-linear-to-b from-orange-400 to-red-500 text-white rounded-xl font-bold text-xs px-4 py-2"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(true)}
                  className="rounded-xl border-border/80 font-bold text-xs px-4 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Custom
                </Button>
              </div>
            </div>
          ) : totalCards === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
              <span className="text-xs text-muted-foreground font-bold">This deck has no cards. Add some cards to begin.</span>
            </div>
          ) : (
            <div className="w-full max-w-md flex flex-col items-center space-y-6">
              
              {/* Progress bar */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                  <span>Progress</span>
                  <span>{currentCardIdx + 1} of {totalCards} cards</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-orange-400 to-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIdx + 1) / totalCards) * 100}%` }}
                  />
                </div>
              </div>

              {/* The Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-64 cursor-pointer relative"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full rounded-2xl border shadow-xs transition-transform duration-500 relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Card Front */}
                  <div
                    className="absolute inset-0 bg-card rounded-2xl p-6 flex flex-col justify-between items-center text-center border-border/50"
                    style={{
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-full">
                      {currentCard?.difficulty} Question
                    </span>
                    <p className="text-base font-extrabold text-foreground leading-relaxed px-4 my-auto">
                      {currentCard?.question}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 opacity-70 group hover:opacity-100 transition-opacity">
                      <RotateCw className="w-3.5 h-3.5 text-orange-500" />
                      Click card to reveal answer
                    </span>
                  </div>

                  {/* Card Back */}
                  <div
                    className="absolute inset-0 bg-orange-500/5 rounded-2xl p-6 flex flex-col justify-between items-center text-center border-orange-500/30"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-500/10 px-2.5 py-0.5 rounded-full">
                      Explanation / Answer
                    </span>
                    <p className="text-xs font-semibold text-foreground leading-relaxed px-4 my-auto overflow-y-auto max-h-36 py-2">
                      {currentCard?.answer}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMastery();
                      }}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                        currentCard?.isMastered
                          ? "bg-green-500/10 border-green-500/30 text-green-600"
                          : "bg-muted border-border/50 text-muted-foreground hover:border-green-500/30 hover:text-green-600"
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${currentCard?.isMastered ? "text-green-500 fill-green-500/10" : ""}`} />
                      {currentCard?.isMastered ? "Mastered" : "Mark as Mastered"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevCard}
                  className="h-10 w-10 rounded-full border-border/80 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </Button>
                <span className="text-xs text-muted-foreground font-bold">
                  Card {currentCardIdx + 1} of {totalCards}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextCard}
                  className="h-10 w-10 rounded-full border-border/80 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Dialog: AI Generation */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black">
              <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500/10" />
              AI Flashcards Generator
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              Gemini will research the topic and structure a comprehensive study deck of revision cards instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerateAi} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Target Subject / Topic</Label>
              <Input
                placeholder="e.g. JavaScript Arrays, Docker commands, DNS Lookup"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                required
                className="rounded-xl shadow-none focus-visible:ring-orange-500 text-xs sm:text-sm h-10"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setAiDialogOpen(false)}
                className="rounded-xl text-xs font-bold h-10"
                disabled={generateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!aiTopic.trim() || generateMutation.isPending}
                className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold h-10 px-5 text-xs flex items-center justify-center gap-1.5"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Deck
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Manual Custom Creation */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black">
              <Plus className="w-5 h-5 text-orange-500" />
              Create Flashcard Deck
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              Create a custom set of study cards to practice and master.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSet} className="space-y-5 py-2">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Deck Title</Label>
                  <Input
                    placeholder="e.g. HTML Semantic Tags"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="rounded-xl bg-input/50 focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Description</Label>
                  <Input
                    placeholder="e.g. Reviewing basic page structures"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="rounded-xl bg-input/50 focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-black text-foreground uppercase tracking-wider">Card Deck List</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCardInput}
                    className="text-[10px] font-black h-7 rounded-lg border-orange-500/20 text-orange-600 hover:bg-orange-50 cursor-pointer"
                  >
                    + Add Card
                  </Button>
                </div>

                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {newCards.map((card, idx) => (
                    <div key={idx} className="bg-muted/30 border rounded-xl p-4 space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground">Card #{idx + 1}</span>
                        {newCards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCardInput(idx)}
                            className="text-red-500 opacity-60 hover:opacity-100 transition-opacity p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Study question / term"
                          value={card.question}
                          onChange={(e) => handleCardChange(idx, "question", e.target.value)}
                          className="bg-card rounded-lg focus-visible:ring-orange-500 text-xs"
                          required
                        />
                        <Textarea
                          placeholder="Card answer / explanation"
                          value={card.answer}
                          onChange={(e) => handleCardChange(idx, "answer", e.target.value)}
                          className="bg-card rounded-lg focus-visible:ring-orange-500 text-xs min-h-[50px] resize-none"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/40 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreateDialogOpen(false)}
                className="rounded-xl text-xs font-bold"
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold px-5 text-xs"
              >
                Create Deck
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Flashcards;
