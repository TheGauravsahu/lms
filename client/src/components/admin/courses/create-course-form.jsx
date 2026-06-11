import { COURSE_STATUS } from "@/lib/constants";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { courseApi } from "@/api/courseApi";
import FormError from "@/components/form-error";
import UploadThumbnail from "./upload-thumbnail";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingButton, { GoBackButton } from "@/components/loading-button";

const createCourseSchema = z.object({
  title: z.string().min(3, "title is required"),
  thumbnail: z.string().min(3, "thumbnail is required"),
  validity: z.number().positive(),
  original_price: z.number().min(0, "original_price is required"),
  offer_price: z.number().min(0, "offer_price is required"),
  status: z.enum(COURSE_STATUS),
});

const CreateCourseForm = () => {
  const { mutateAsync, isPending } = courseApi.useCreateCourse();
  const form = useForm({
    resolver: zodResolver(createCourseSchema),
  });

  const onSubmit = async (values) => {
    console.log(values);
    await mutateAsync(values);
  };

  return (
    <form className="mt-10" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex gap-1  justify-between w-full h-full">
        {/* field area */}
        <div className="w-md h-full  space-y-6">
          <div>
            <Label>Title</Label>
            <Input
              {...form.register("title")}
              placeholder="Summer Camp Class 9th"
              className="mt-2 bg-input"
            />
            <FormError form={form} field="title" />
          </div>

          <div>
            <Label>Validity</Label>
            <Input
              type="number"
              {...form.register("validity", {
                valueAsNumber: true,
              })}
              name="validity"
              placeholder="eg. 365"
              className="mt-2 bg-input"
            />
            <FormError form={form} field="validity" />
          </div>

          <div>
            <Label>Original Price</Label>
            <Input
              type="number"
              {...form.register("original_price", {
                valueAsNumber: true,
              })}
              name="original_price"
              placeholder="eg. 3000"
              className="mt-2 bg-input"
            />
            <FormError form={form} field="original_price" />
          </div>

          <div>
            <Label>Offer Price</Label>
            <Input
              type="number"
              {...form.register("offer_price", {
                valueAsNumber: true,
              })}
              name="offer_price"
              placeholder="eg. 2500"
              className="mt-2 bg-input"
            />
            <FormError form={form} field="offer_price" />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) =>
                form.setValue("status", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger className="bg-input mt-2 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormError form={form} field="status" />
          </div>

          <div className="flex items-center gap-2 justify-between mt-2">
            <GoBackButton />
            <LoadingButton type="submit" isPending={isPending}>
              <Plus />
              Create Course
            </LoadingButton>
          </div>
        </div>

        {/* upload area */}
        <div className="w-[45%] h-full mt-4">
          <UploadThumbnail
            value={form.watch("thumbnail")}
            onChange={(url) =>
              form.setValue("thumbnail", url, {
                shouldValidate: true,
              })
            }
          />
        </div>
      </div>
    </form>
  );
};

export default CreateCourseForm;
