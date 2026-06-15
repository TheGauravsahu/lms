import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import EditContent from "./edit-content";
import { useState } from "react";
import { Pencil } from "lucide-react";
import DeleteContent from "./delete-content";
import { Trash } from "lucide-react";

const ContentOptionsMenu = ({ children,prevContent }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setOpenEdit(true)}>
            <span className="flex items-center gap-2 cursor-pointer">
              <Pencil className="w-4" /> Edit
            </span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setOpenDelete(true)}>
            <span className="flex items-center gap-2 cursor-pointer">
              <Trash className="w-4" /> Delete
            </span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <EditContent open={openEdit} onOpenChange={setOpenEdit} prevContent={prevContent} />
      <DeleteContent open={openDelete} onOpenChange={setOpenDelete} folder_id={prevContent.folder_id} />
    </>
  );
};

export default ContentOptionsMenu;
