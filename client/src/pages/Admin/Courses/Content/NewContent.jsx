import { courseApi } from "@/api/courseApi";
import UploadThumbnail from "@/components/admin/courses/upload-thumbnail";
import CreateUpload from "@/components/admin/uploads/create-upload";
import RecentUploads from "@/components/admin/uploads/recent-uploads";
import FormError from "@/components/form-error";
import LoadingButton, { GoBackButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, FilePlus, Sparkles, Library, FileText, Video, HelpCircle } from "lucide-react";
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
import { quizApi } from "@/api/quizApi";

const createCourseContentSchema = z.object({
  folder_id: z.string().min(1, "course_id is required"),
  title: z.string().min(1, "title is required"),
  thumbnail: z.string().min(1, "thumbnail is required").optional(),
  content: z.string().optional(),
  quiz_id: z.string().optional(),
  content_type: z.enum(CONTENT_TYPE),
});

const NewContent = () => {
  const [searchParams] = useSearchParams();
  const folder_id = searchParams.get("folder_id");

  const { mutateAsync, isPending } = courseApi.useCreateContent();
  const { data: quizzes = [] } = quizApi.useGetAllQuizzes();

  const form = useForm({
    resolver: zodResolver(createCourseContentSchema),
    defaultValues: {
      folder_id,
      content_type: "VIDEO",
      content: "",
      quiz_id: "",
      title: "",
      thumbnail: "",
    },
  });

  const contentType = form.watch("content_type");

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
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-foreground flex items-center gap-2">
              Add Content
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Publish PDF resources, streamable video lessons, or interactive assessment quizzes
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Sparkles className="w-4.5 h-4.5 fill-orange-500/10" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Content details</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Specify the lessons title, type, and source files</p>
              </div>
            </div>

            <form
              id="new-content-form"
              className="space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lesson Title</Label>
                <Input
                  {...form.register("title")}
                  placeholder="e.g. Chapter 1: Introduction to Calculus"
                  className="mt-2 bg-input/50 focus-visible:ring-orange-500 rounded-xl"
                  required
                />
                <FormError form={form} field="title" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Content Type</Label>
                  <Select
                    value={form.watch("content_type")}
                    onValueChange={(value) => {
                      form.setValue("content_type", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      // Reset conditional values
                      form.setValue("content", "");
                      form.setValue("quiz_id", "");
                    }}
                  >
                    <SelectTrigger className="bg-input/50 focus:ring-orange-500 rounded-xl mt-2 w-full font-bold">
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="VIDEO" className="rounded-lg font-semibold flex items-center gap-2">
                          <span className="flex items-center gap-2"><Video className="w-4 h-4 text-orange-500" /> Video stream</span>
                        </SelectItem>
                        <SelectItem value="PDF" className="rounded-lg font-semibold flex items-center gap-2">
                          <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> PDF document</span>
                        </SelectItem>
                        <SelectItem value="QUIZ" className="rounded-lg font-semibold flex items-center gap-2">
                          <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-purple-500" /> Linked quiz</span>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormError form={form} field="content_type" />
                </div>

                {/* Conditional fields based on type */}
                {contentType === "QUIZ" ? (
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Link Existing Quiz</Label>
                    <Select
                      value={form.watch("quiz_id")}
                      onValueChange={(value) =>
                        form.setValue("quiz_id", value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="bg-input/50 focus:ring-orange-500 rounded-xl mt-2 w-full font-bold">
                        <SelectValue placeholder="Select Quiz" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectGroup>
                          {quizzes.length === 0 ? (
                            <SelectItem value="none" disabled>No quizzes found. Create one first!</SelectItem>
                          ) : (
                            quizzes.map((quiz) => (
                              <SelectItem key={quiz._id} value={quiz._id} className="rounded-lg font-semibold">
                                {quiz.title} ({quiz.questions?.length || 0} Qs)
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormError form={form} field="quiz_id" />
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Content File / Media</Label>
                    <div className="mt-2">
                      <CreateUpload
                        onChange={(url) =>
                          form.setValue("content", url, {
                            shouldValidate: true,
                          })
                        }
                      />
                    </div>
                    <FormError form={form} field="content" />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lesson Cover Preview / Thumbnail</Label>
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

        {/* Right Column: Recent Assets & Buttons */}
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Library className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Quick Library</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Select from recently uploaded thumbnails</p>
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

          {/* Action Row */}
          <div className="flex items-center gap-3">
            <GoBackButton className="flex-1 rounded-xl text-xs py-5 font-bold border-border/80" />
            <LoadingButton
              type="submit"
              form="new-content-form"
              isPending={isPending}
              className="flex-1 rounded-xl py-5 text-xs bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-black cursor-pointer shadow-sm hover:shadow transition-all duration-300 animate-pulse"
              loadingText="Creating Content..."
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewContent;
