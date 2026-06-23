import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/api/courseApi";
import LoadingButton from "@/components/loading-button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

const DeleteFolderDialog = ({ open, onOpenChange, courseId, folderId, folderTitle }) => {
  const { mutateAsync, isPending } = courseApi.useDeleteFolder();
  const haptic = useHaptic();

  const handleDelete = async () => {
    haptic.tap();
    try {
      await mutateAsync({
        course_id: courseId,
        parent_id: folderId,
      });
      haptic.success();
      onOpenChange(false);
    } catch (err) {
      console.log(err)
      haptic.error();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { haptic.tap(); onOpenChange(val); }}>
      <DialogContent className="sm:max-w-md p-6 gap-4">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-full text-destructive mb-2">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-lg font-bold">Delete Folder</DialogTitle>
          <DialogDescription className="text-sm mt-1 text-center">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{folderTitle}"</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900 text-center font-medium">
          Warning: This action is permanent. Deleting this folder will recursively delete all nested subfolders and course contents inside it.
        </div>

        <DialogFooter className="flex sm:flex-row gap-2 mt-2 w-full">
          <Button
            variant="outline"
            onClick={() => { haptic.tap(); onOpenChange(false); }}
            className="flex-1 rounded-sm cursor-pointer"
            disabled={isPending}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDelete}
            isPending={isPending}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Folder
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFolderDialog;
