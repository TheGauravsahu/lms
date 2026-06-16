import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { purchaseApi } from "@/api/purchaseApi";
import { ChevronLeft } from "lucide-react";
import LoadingButton from "../loading-button";
import { Lock } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/formatDate";

const PurchaseModel = ({ course }) => {
  const { mutateAsync, isPending } = purchaseApi.usePurchaseCourse();
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          variant="secondary"
          className="w-full mt-2 cursor-pointer text-orange-600 bg-orange-100 hover:bg-orange-100"
        >
          Buy Now <ArrowRight />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl sm:h-[70vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Purchase Course
          </DialogTitle>
          <DialogDescription>
            To purchase course click on the proceed button or if you want to
            exit click on cancel button
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 justify-between">
          <div className="h-full w-full">
            <div className="bg-secondary w-full rounded-sm p-4">
                <h1>Course</h1>
                <div className=" flex gap-4 items-center w-full">
              <img
                src={course.thumbnail.url}
                alt={course.title}
                className="w-24 object-cover"
              />
              <div>
                <h2 className="font-semibold">{course.title}</h2>
                <div className="flex gap-2">
                  <h2 className="font-semibold">₹{course.offer_price}</h2>
                  <h2 className="line-through">{course.original_price}</h2>
                </div>
                <h2 className="text-[11px] text-muted-foreground leading-4">
                  {formatDate(course.createdAt)}
                </h2>
              </div>
              </div>
            </div>
          </div>

          {/* right */}
          <div className="w-[40%] h-full overflow-hidden">
            <img src="/payment.svg" alt="payment" className="w-full h-full" />
          </div>
        </div>

        {/* bottom */}
        <div className="flex items-center gap-2 overflow-hidden">
          <DialogClose asChild>
            <Button variant="secondary" className="cursor-pointer">
              <ChevronLeft />
              Cancel
            </Button>
          </DialogClose>
          <LoadingButton
            className="cursor-pointer w-[60%]"
            isPending={isPending}
            loadingText="Proceeding"
            onClick={async () => {
              const res = await mutateAsync(course._id);
              if (res.successCode === 200) setOpen(false);
            }}
          >
            <>
              Proceed <Lock />
            </>
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModel;
