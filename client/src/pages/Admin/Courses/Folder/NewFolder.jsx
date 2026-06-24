import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useSearchParams } from "react-router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormError from "@/components/form-error";
import UploadThumbnail from "@/components/admin/courses/upload-thumbnail";
import { courseApi } from "@/api/courseApi";
import LoadingButton, { GoBackButton } from "@/components/loading-button";
import { Plus, FolderPlus, Sparkles, Image, Library } from "lucide-react";
import RecentUploads from "@/components/admin/uploads/recent-uploads";

const createCourseFolderSchema = z.object({
  course_id: z.string().min(1, "course_id is required"),
  parent_id: z.string().nullable().optional(),
  title: z.string().min(1, "title is required"),
  thumbnail: z.string().min(1, "thumbnail is required"),
});

const NewFolder = () => {
  const [searchParams] = useSearchParams();
  const parent_id = searchParams.get("parent_id");
  const { course_id } = useParams();

  const { mutateAsync, isPending } = courseApi.useCreateFolder();

  const form = useForm({
    resolver: zodResolver(createCourseFolderSchema),
    defaultValues: {
      course_id,
      parent_id: parent_id || undefined,
      title: "",
      thumbnail: "",
    },
  });

  async function onSubmit(values) {
    console.log(values);
    await mutateAsync(values);
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground flex items-center gap-2">
              Create Folder
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Organize your curriculum by adding a subfolder or learning module
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Sparkles className="w-4.5 h-4.5 fill-orange-500/10" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Folder Details</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Configure basic folder metadata</p>
              </div>
            </div>

            <form
              id="new-folder-form"
              className="space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Folder Title</Label>
                <Input
                  {...form.register("title")}
                  placeholder="e.g. Introduction to Variables"
                  className="mt-2 bg-input/50 focus-visible:ring-orange-500 rounded-xl"
                  required
                />
                <FormError form={form} field="title" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cover Image / Thumbnail</Label>
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
            </form>
          </div>
        </div>

        {/* Right Column: Library & Quick Select */}
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Library className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Quick Library</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Select from recently uploaded assets</p>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-56 pr-1">
              <RecentUploads
                onChange={(url) =>
                  form.setValue("thumbnail", url, {
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-3">
            <GoBackButton className="flex-1 rounded-xl text-xs py-5 font-bold border-border/80" />
            <LoadingButton
              type="submit"
              form="new-folder-form"
              isPending={isPending}
              className="flex-1 rounded-xl py-5 text-xs bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-black cursor-pointer shadow-sm hover:shadow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewFolder;
