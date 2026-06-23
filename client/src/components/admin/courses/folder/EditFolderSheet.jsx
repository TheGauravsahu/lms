import React, { useEffect } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormError from "@/components/form-error";
import UploadThumbnail from "@/components/admin/courses/upload-thumbnail";
import RecentUploads from "@/components/admin/uploads/recent-uploads";
import { courseApi } from "@/api/courseApi";
import LoadingButton from "@/components/loading-button";
import { Save } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

const editFolderSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  parent_id: z.string().min(1, "parent_id is required"),
  title: z.string().min(1, "title is required"),
  thumbnail: z.string().min(1, "thumbnail is required"),
});

const EditFolderSheet = ({ open, onOpenChange, courseId, folder }) => {
  const { mutateAsync, isPending } = courseApi.useEditFolder();
  const haptic = useHaptic();

  const form = useForm({
    resolver: zodResolver(editFolderSchema),
    defaultValues: {
      course_id: courseId,
      parent_id: folder?._id || "",
      title: folder?.title || "",
      thumbnail: folder?.thumbnail?.url || "",
    },
  });

  // Keep form values in sync when folder prop changes
  useEffect(() => {
    if (folder) {
      form.reset({
        course_id: courseId,
        parent_id: folder._id,
        title: folder.title,
        thumbnail: folder.thumbnail?.url || "",
      });
    }
  }, [folder, courseId, form]);

  const onSubmit = async (values) => {
    haptic.tap();
    try {
      await mutateAsync(values);
      haptic.success();
      onOpenChange(false);
    } catch (err) {
      haptic.error();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { haptic.tap(); onOpenChange(val); }}>
      <SheetContent className="sm:max-w-xl overflow-y-auto px-6 pt-6 gap-6">
        <SheetHeader>
          <SheetTitle>Edit Folder</SheetTitle>
          <SheetDescription>
            Update the title and thumbnail image of this folder.
          </SheetDescription>
        </SheetHeader>

        <form
          className="space-y-6 mt-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div>
            <Label htmlFor="editFolderTitle">Title</Label>
            <Input
              id="editFolderTitle"
              {...form.register("title")}
              placeholder="e.g. Introduction"
              className="mt-2 bg-input rounded-sm"
              required
            />
            <FormError form={form} field="title" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <UploadThumbnail
                value={form.watch("thumbnail")}
                onChange={(url) =>
                  form.setValue("thumbnail", url, {
                    shouldValidate: true,
                  })
                }
              />
              <FormError form={form} field="thumbnail" />
            </div>

            <div className="space-y-2">
              <Label>Quick Library</Label>
              <RecentUploads
                onChange={(url) =>
                  form.setValue("thumbnail", url, {
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <LoadingButton type="submit" isPending={isPending} className="rounded-sm flex items-center gap-1.5">
              <Save className="w-4 h-4" />
              Save Changes
            </LoadingButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default EditFolderSheet;
