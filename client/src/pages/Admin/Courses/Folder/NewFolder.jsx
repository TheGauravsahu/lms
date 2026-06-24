import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useSearchParams } from "react-router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormError from "@/components/form-error";
import UploadThumbnail from "@/components/admin/courses/upload-thumbnail";
import { courseApi } from "@/api/courseApi";
import LoadingButton from "@/components/loading-button";
import { Plus } from "lucide-react";
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
    <div className="w-full h-full">
      <div className="w-full flex items-start">
        <div className="w-full border-r border-dotted pr-10">
          <h1 className="font-semibold text-xl mb-2">Create Folder</h1>
          <p className="text-sm text-muted-foreground">
            Add data to create folder for the course
          </p>

          <form
            className="mt-10 w-full w-full space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* fields */}
            <div>
              <Label>Title</Label>
              <Input
                {...form.register("title")}
                placeholder="English"
                className="mt-2 bg-input"
              />
              <FormError form={form} field="title" />
            </div>

            {/* thumbnail upload */}
            <div className="w-full">
              <Label className="my-2">Thumbnail</Label>
              <UploadThumbnail
                value={form.watch("thumbnail")}
                onChange={(url) =>
                  form.setValue("thumbnail", url, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            <LoadingButton isPending={isPending} type='submit'>
              <Plus /> Create Folder
            </LoadingButton>
          </form>
        </div>

        <div className="w-full pl-8">
          <RecentUploads
            onChange={(url) =>
              form.setValue("thumbnail", url, {
                shouldValidate: true,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default NewFolder;
