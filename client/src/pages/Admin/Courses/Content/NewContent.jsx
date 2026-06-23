import { courseApi } from "@/api/courseApi";
import UploadThumbnail from "@/components/admin/courses/upload-thumbnail";
import CreateUpload from "@/components/admin/uploads/create-upload";
import RecentUploads from "@/components/admin/uploads/recent-uploads";
import FormError from "@/components/form-error";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTENT_TYPE } from "@/lib/constants";

const createCourseContentSchema = z.object({
  folder_id: z.string().min(1, "course_id is required"),
  title: z.string().min(1, "title is required"),
  thumbnail: z.string().min(1, "thumbnail is required").optional(),
  content: z.string().min(1, "thumbnail is required"),
  content_type: z.enum(CONTENT_TYPE),
});

const NewContent = () => {
  const [searchParams] = useSearchParams();
  const folder_id = searchParams.get("folder_id");

  const { mutateAsync, isPending } = courseApi.useCreateContent();

  const form = useForm({
    resolver: zodResolver(createCourseContentSchema),
    defaultValues: {
      folder_id,
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
          <h1 className="font-semibold text-xl mb-2">Add Content</h1>
          <p className="text-sm text-muted-foreground">
            Fill data to add content for the folder
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

            {/* content upload */}
            <div className="w-full">
              <Label className="my-2">Content</Label>
              <CreateUpload
                onChange={(url) =>
                  form.setValue("content", url, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* content_type */}
            <div>
              <Label>Content Type</Label>
              <Select
                value={form.watch("content_type")}
                onValueChange={(value) =>
                  form.setValue("content_type", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="bg-input mt-2 w-full">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="VIDEO">VIDEO</SelectItem>
                    <SelectItem value="QUIZ">QUIZ</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormError form={form} field="content_type" />
            </div>

            <LoadingButton isPending={isPending} loadingText="Creating Content">
              <Plus /> Create Content
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

export default NewContent;
