import { COURSE_STATUS } from "@/lib/constants";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, BookOpen, Tag, Image, Eye, Calendar, Sparkles, AlertCircle } from "lucide-react";
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
  title: z.string().min(3, "Title must be at least 3 characters"),
  thumbnail: z.string().min(3, "Thumbnail is required"),
  validity: z.number().positive("Validity must be a positive number"),
  original_price: z.number().min(0, "Original price must be 0 or more"),
  offer_price: z.number().min(0, "Offer price must be 0 or more"),
  status: z.enum(COURSE_STATUS),
});

const CreateCourseForm = () => {
  const { mutateAsync, isPending } = courseApi.useCreateCourse();
  const form = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      thumbnail: "",
      validity: 365,
      original_price: 0,
      offer_price: 0,
      status: "DRAFT",
    },
  });

  const onSubmit = async (values) => {
    await mutateAsync(values);
  };

  const originalPrice = form.watch("original_price");
  const offerPrice = form.watch("offer_price");

  const discountPercentage =
    originalPrice && offerPrice && originalPrice > offerPrice
      ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      : null;

  return (
    <form className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Main details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Course Information */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Course Details</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Enter the core course details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Title</Label>
                <Input
                  {...form.register("title")}
                  placeholder="e.g. Master Class in Web Development"
                  className="mt-2 bg-input/50 focus-visible:ring-orange-500 rounded-xl"
                />
                <FormError form={form} field="title" />
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Validity (in Days)</Label>
                <div className="relative mt-2">
                  <Input
                    type="number"
                    {...form.register("validity", {
                      valueAsNumber: true,
                    })}
                    name="validity"
                    placeholder="e.g. 365"
                    className="bg-input/50 focus-visible:ring-orange-500 rounded-xl pr-14"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-md">
                    <Calendar className="w-3 h-3 text-orange-500" />
                    days
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium leading-normal">
                  The duration during which students will have full access to study materials.
                </p>
                <FormError form={form} field="validity" />
              </div>
            </div>
          </div>

          {/* Card 2: Pricing Details */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Tag className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">Pricing & Discount</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Set prices and discount incentives</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Price</Label>
                <div className="relative mt-2">
                  <Input
                    type="number"
                    {...form.register("original_price", {
                      valueAsNumber: true,
                    })}
                    name="original_price"
                    placeholder="e.g. 3000"
                    className="bg-input/50 focus-visible:ring-orange-500 rounded-xl"
                  />
                </div>
                <FormError form={form} field="original_price" />
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Offer Price</Label>
                <div className="relative mt-2">
                  <Input
                    type="number"
                    {...form.register("offer_price", {
                      valueAsNumber: true,
                    })}
                    name="offer_price"
                    placeholder="e.g. 2500"
                    className="bg-input/50 focus-visible:ring-orange-500 rounded-xl"
                  />
                </div>
                <FormError form={form} field="offer_price" />
              </div>
            </div>

            {discountPercentage !== null && discountPercentage > 0 && (
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3.5 flex items-center gap-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Sparkles className="w-4 h-4 fill-orange-500/10" />
                </div>
                <span className="text-xs text-foreground font-bold leading-normal">
                  Amazing Deal! This constitutes a <span className="text-orange-500 font-extrabold">{discountPercentage}% discount</span> off the original retail price.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Thumbnail upload and Status */}
        <div className="space-y-6">
          
          {/* Card 3: Thumbnail & Status */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Image className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Thumbnail</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Course catalog cover preview</p>
                </div>
              </div>
              
              <div className="pt-1">
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
            </div>

            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex items-center gap-2 pb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Publish Visibility</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Decide when it goes live</p>
                </div>
              </div>

              <div>
                <Select
                  value={form.watch("status") || "DRAFT"}
                  onValueChange={(value) =>
                    form.setValue("status", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="bg-input/50 focus:ring-orange-500 rounded-xl mt-1 w-full font-bold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectGroup>
                      <SelectItem value="DRAFT" className="rounded-lg font-semibold">DRAFT (Hidden)</SelectItem>
                      <SelectItem value="PUBLISHED" className="rounded-lg font-semibold">PUBLISHED (Live)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2 items-start mt-3 text-[10px] text-muted-foreground leading-normal font-medium bg-muted/30 p-2.5 rounded-xl border border-border/30">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>
                    {form.watch("status") === "PUBLISHED" 
                      ? "Published courses are immediately accessible to active subscribers." 
                      : "Draft courses remain under construction and are hidden from student listings."
                    }
                  </span>
                </div>
                <FormError form={form} field="status" />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            <GoBackButton className="flex-1 rounded-xl text-xs py-5 font-bold border-border/80" />
            <LoadingButton 
              type="submit" 
              isPending={isPending} 
              className="flex-1 rounded-xl py-5 text-xs bg-linear-to-b from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-black cursor-pointer shadow-sm hover:shadow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </LoadingButton>
          </div>
        </div>

      </div>
    </form>
  );
};

export default CreateCourseForm;
