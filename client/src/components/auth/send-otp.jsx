import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import LoadingButton from "../loading-button";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormError from "../form-error";
import { authApi } from "@/api/authApi";
import { User } from "lucide-react";

const loginSchema = z.object({
  mobile_no: z.string().length(10, "Invalid mobile no"),
  name: z.string().min(1, "Name must be atleast one character long"),
});

const SendOtp = ({ setStep, setSendResult }) => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });
  const { isPending, mutateAsync, data } = authApi.useSendOtp();

  const onSumbit = async (values) => {
    const res = await mutateAsync(values);

    if (res.statusCode === 201) {
      setSendResult({
        ...res.data,
        name: form.watch("name"),
        mobile_no: form.watch("mobile_no"),
      });
      setStep("otp");
    }
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
          Welcome !
        </DialogTitle>
        <DialogDescription>Enter you mobile number</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col md:flex-row justify-between gap-2 items-start">
        <form
          onSubmit={form.handleSubmit(onSumbit)}
          className="w-xs  asbolute bottom-4 left-4 absolute   flex flex-col justify-between h-full pt-46 p-2 "
        >
          <div className="space-y-4 ">
            {/* name */}
            <div>
              <div className="relative">
                <Input
                  {...form.register("name")}
                  placeholder="Enter name"
                  className="pl-12 rounded-sm shadow-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 border-r pr-2 flex items-center gap-1">
                  <User className="w-4 text-muted-foreground" />
                </div>
              </div>

              <FormError field="name" form={form} />
            </div>

            {/* mobile no */}
            <div>
              <div className="relative">
                <Input
                  maxLength={10}
                  {...form.register("mobile_no", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                    },
                  })}
                  placeholder="Enter mobile"
                  className="pl-16 rounded-sm shadow-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 border-r pr-2 flex items-center gap-1">
                  <img
                    src="/flag.png"
                    className="w-4 h-4 rounded-full"
                    alt="Indian_flag"
                  />
                  <span className="text-xs">+91</span>
                </div>
              </div>

              <FormError field="mobile_no" form={form} />
            </div>

            <LoadingButton
              className="w-full"
              loadingText="Continuing"
              isPending={isPending}
            >
              Continue <ArrowRight />
            </LoadingButton>

            {data && (
              <div className="bg-green-200 text-green-600 p-2 rounded-sm flex items-center justify-center">
                <h3>
                  Your OTP :{" "}
                  <span className="font-semibold ml-1">
                    {data.data.otp}
                  </span>{" "}
                </h3>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            By continuing you agree to our Term & Conditions
          </p>
        </form>
      </div>
    </>
  );
};

export default SendOtp;
