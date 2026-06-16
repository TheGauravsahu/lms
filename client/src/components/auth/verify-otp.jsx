import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import LoadingButton from "../loading-button";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormError from "../form-error";
import { authApi } from "@/api/authApi";
import { Controller } from "react-hook-form";

const verifyOtpSchema = z.object({
  mobile_no: z.string().length(10, "Invalid mobile no"),
  name: z.string().min(1, "Name must be atleast one character long"),
  otp: z.string().length(6, "Invalid otp"),
});

const VeifyOtp = ({ mobile_no, name, otp_data, onSuccess }) => {
  const { isPending, mutateAsync } = authApi.useVerifyOtp();

  const form = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      mobile_no,
      name,
      otp: "",
    },
  });

  const onSumbit = async (values) => {
    const res = await mutateAsync(values);
    if (res?.statusCode === 200) onSuccess();
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-10 overflow-hidden">
              <img src="/icon.png" alt="lms_icon" className="w-full h-full" />
            </div>
            <h1 className="tracking-tight font-semibold text-xl">
              Gaurav <span className="text-muted-foreground">LMS</span>
            </h1>
          </div>
        </div>
        <DialogTitle className="text-xl font-semibold mt-4">
          Verify Otp
        </DialogTitle>
        <DialogDescription>
          Enter 6-digit otp sent to your mobile no
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={form.handleSubmit(onSumbit)}
        className="w-xs asbolute bottom-4 left-4 absolute   flex flex-col justify-between h-full pt-46 p-2 "
      >
        <div>
          <div>
            <Controller
              name="otp"
              control={form.control}
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value || ""}
                  onChange={field.onChange}
                >
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTP>
              )}
            />

            <FormError field="otp" form={form} />
          </div>

          <div>
            <LoadingButton
              className="w-[75%]"
              loadingText="Continuing"
              isPending={isPending}
            >
              Verify <ArrowRight />
            </LoadingButton>
          </div>

          {otp_data && (
            <div className="bg-green-200 text-green-600 p-2 rounded-sm flex items-center justify-center w-[75%] mt-4">
              <h3>
                Your OTP :{" "}
                <span className="font-semibold ml-1">{otp_data}</span>
              </h3>
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          By continuing you agree to our Term & Conditions
        </p>
      </form>
    </>
  );
};

export default VeifyOtp;
