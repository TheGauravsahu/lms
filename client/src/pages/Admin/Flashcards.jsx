import { flashcardApi } from "@/api/flashcardApi";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Trash2,
  Calendar,
  Layers,
  Mail,
  Loader2,
} from "lucide-react";

const AdminFlashcards = () => {
  const { data: sets, isPending } = flashcardApi.useAdminGetAllSets();
  const deleteSetMutation = flashcardApi.useAdminDeleteSet();

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this flashcard set?")) {
      deleteSetMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 select-text p-6 max-w-7xl mx-auto">
      {/* Header controls */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground">Manage Flashcard Decks</h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Monitor, review, and delete system or student-generated flashcard decks across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* List of flashcard sets */}
      {isPending ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-xs text-muted-foreground font-semibold">Loading flashcard sets...</span>
        </div>
      ) : sets?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center text-xs text-muted-foreground font-semibold">
          No flashcard decks found on the server.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets?.map((set) => (
            <div
              key={set._id}
              className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xs transition-shadow space-y-4 relative overflow-hidden"
            >
              {/* Subtle top indicator for AI decks */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-orange-400 to-red-500" />

              <div className="space-y-3">
                <div className="flex justify-between items-start pt-1">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground leading-tight">{set.title}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      {set.cards?.length || 0} card{set.cards?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(set._id)}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg w-8 h-8 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground font-semibold leading-relaxed line-clamp-3">
                  {set.description || "No description provided."}
                </p>
              </div>

              <div className="border-t border-border/40 pt-3 space-y-2 text-[10px] text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">Creator: {set.user_id?.email || "System/Unknown"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>Created: {new Date(set.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFlashcards;
