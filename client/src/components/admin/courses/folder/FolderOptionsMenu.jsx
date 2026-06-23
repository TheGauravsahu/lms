import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import EditFolderSheet from "./EditFolderSheet";
import DeleteFolderDialog from "./DeleteFolderDialog";
import { useHaptic } from "@/hooks/useHaptic";

const FolderOptionsMenu = ({ courseId, folder }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const haptic = useHaptic();

  if (!folder) return null;

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && haptic.tap()}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0"
            title="Folder Options"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => {
              haptic.tap();
              setOpenEdit(true);
            }}
            className="cursor-pointer flex items-center gap-2 text-sm font-medium"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              haptic.tap();
              setOpenDelete(true);
            }}
            className="cursor-pointer flex items-center gap-2 text-sm font-medium text-destructive focus:text-destructive"
          >
            <Trash className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditFolderSheet
        open={openEdit}
        onOpenChange={setOpenEdit}
        courseId={courseId}
        folder={folder}
      />

      <DeleteFolderDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        courseId={courseId}
        folderId={folder._id}
        folderTitle={folder.title}
      />
    </>
  );
};

export default FolderOptionsMenu;
