import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPE } from "@/lib/constants";
import z from "zod";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import FormError from "@/components/form-error";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateUpload from "../../uploads/create-upload";
import UploadThumbnail from "../upload-thumbnail";
import { Input } from "@/components/ui/input";
import { courseApi } from "@/api/courseApi";
import { quizApi } from "@/api/quizApi";

const editCourseContentSchema = z.object({
  folder_id: z.string().min(1, "course_id is required"),
  title: z.string().min(1, "title is required").optional(),
  thumbnail: z.string().min(1, "thumbnail is required").optional(),
  content: z.string().optional(),
  quiz_id: z.string().optional(),
  content_type: z.enum(CONTENT_TYPE).optional(),
});

const EditContent = ({ open, onOpenChange, prevContent }) => {
  const { isPending, mutateAsync } = courseApi.useEditContent();
  const { data: quizzes = [] } = quizApi.useGetAllQuizzes();

  const form = useForm({
    resolver: zodResolver(editCourseContentSchema),
    defaultValues: {
      folder_id: prevContent.folder_id,
      title: prevContent.title,
      thumbnail: prevContent.thumbnail?._id || "",
      content: prevContent.content?._id || prevContent.content || "",
      content_type: prevContent.content_type,
      quiz_id: prevContent.quiz_id?._id || prevContent.quiz_id || "",
    },
  });

  const contentType = form.watch("content_type");

  const onSubmit = async (values) => {
    await mutateAsync(values);
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-[60vw]">
        <SheetHeader>
          <SheetTitle>Edit Content Details</SheetTitle>
          <SheetDescription>
            Edit following details of content and click on submit to save
            changes.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 scroll-auto overflow-y-auto">
          <form className="w-full space-y-6">
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
                value={form.watch("thumbnail") || prevContent.thumbnail?.url || "/course_banner_bg.png"}
                onChange={(url) =>
                  form.setValue("thumbnail", url, {
                    shouldValidate: true,
                  })
                }
              />
            </div>

            {/* conditional content / quiz selector */}
            {contentType === "QUIZ" ? (
              <div className="w-full">
                <Label>Link Quiz</Label>
                <Select
                  value={form.watch("quiz_id")}
                  onValueChange={(value) =>
                    form.setValue("quiz_id", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="bg-input mt-2 w-full">
                    <SelectValue placeholder="Select Quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz._id} value={quiz._id}>
                          {quiz.title} ({quiz.questions.length} Qs)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormError form={form} field="quiz_id" />
              </div>
            ) : (
              <div className="w-full">
                <Label className="my-2">Content</Label>
                <CreateUpload
                  value={prevContent.content?.url || ""}
                  onChange={(url) =>
                    form.setValue("content", url, {
                      shouldValidate: true,
                    })
                  }
                />
                <FormError form={form} field="content" />
              </div>
            )}

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
          </form>
        </div>
        <SheetFooter>
          <LoadingButton
            isPending={isPending}
            onClick={form.handleSubmit(onSubmit)}
            loadingText="Submitting"
          >
            <Plus /> Submit
          </LoadingButton>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditContent;
