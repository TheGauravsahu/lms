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
import { Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const PurchaseModel = ({ course }) => {
  const { mutateAsync, isPending } = purchaseApi.usePurchaseCourse(course._id);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("payment"); // 'payment' / 'success'
  const queryClient = useQueryClient();

  // calculate GST
  const base_price = course.offer_price;
  const gst_percentage = 18;
  const gst_amount = Number((base_price * gst_percentage) / 100);
  const total_price = Number(base_price + gst_amount).toFixed();

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
      <DialogContent className="sm:max-w-2xl sm:h-[65vh]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === "payment" ? (
              <>Purchase Course</>
            ) : (
              <>Completeing Payment</>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "payment" ? (
              <>To purchase course click on the proceed button.</>
            ) : (
              <>Do not refresh the page</>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === "payment" && (
          <>
            {/* left */}
            <div className="h-full w-1/2  absolute left-0 top-0 pt-26 pl-6">
              <div className="h-[85%] w-full">
                <img
                  src={course.thumbnail.url}
                  alt={course.title}
                  className="w-full object-cover rounded-sm"
                />
                <div className="mt-3">
                  <h2 className="font-semibold border rounded-sm p-2">
                    {course.title}
                  </h2>
                  <div className="flex gap-2 border rounded-sm p-2 mt-2">
                    <h2 className="font-semibold">₹{course.offer_price}</h2>
                    <h2 className="line-through">{course.original_price}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* right */}
            <div className="w-[48%] h-full overflow-hidden absolute right-0 top-0 *:font-semibold p-4 pt-26">
              <div className="h-[56%] w-full p-4 rounded-sm bg-secondary mb-4">
                <h3 className="text-muted-foreground rounded-sm p-2 border bg-white">
                  GST: {gst_percentage}%
                </h3>
                <h3 className="text-muted-foreground rounded-sm p-2 border my-2 bg-white">
                  GST Amount: ₹{gst_amount}
                </h3>
                <h3 className="text-lg ml-2 mt-4">Total: ₹{total_price}</h3>
              </div>

              <p className="text-muted-foreground text-xs mb-6">
                By proceeding you get access to the batch once completing
                payment.
              </p>

              <div className="flex items-center gap-2 overflow-hidden ">
                <DialogClose asChild>
                  <Button variant="secondary" className="cursor-pointer">
                    <ChevronLeft />
                    Cancel
                  </Button>
                </DialogClose>
                <LoadingButton
                  type="button"
                  className="cursor-pointer w-[60%]"
                  isPending={isPending}
                  loadingText="Proceeding"
                  onClick={async () => {
                    await mutateAsync();
                    setStep("success");
                    await new Promise((resolve) => setTimeout(resolve, 2000));

                    // Now refresh the purchase status
                    await queryClient.invalidateQueries({
                      queryKey: ["check-purchases", course._id],
                    });
                  }}
                >
                  <>
                    Proceed <Lock />
                  </>
                </LoadingButton>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="absolute left-0 top-0 pt-26 p-8 w-full h-full ">
            <div className="b w-[80%] mx-auto h-full flex flex-col items-center gap-3 justify-center rounded-sm animate-in fade-in zoom-in duration-500">
              <div className="bg-green-100 h-28 w-28 rounded-full flex items-center justify-center">
                <Check className="text-green-400 h-12 w-12" />
              </div>

              <h1 className="text-xl">Payment Successful</h1>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModel;
