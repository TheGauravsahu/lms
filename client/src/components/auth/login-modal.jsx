import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SendOtp from "./send-otp";
import VerifyOtp from "./verify-otp";
import { useState } from "react";

const LoginModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("mobile"); // "mobile"/"otp"
  const [sendResult, setSendResult] = useState(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl sm:h-[65vh] h-[80vh]">
        {step === "mobile" ? (
          <SendOtp setStep={setStep} setSendResult={setSendResult} />
        ) : (
          <VerifyOtp
            name={sendResult?.name}
            otp_data={sendResult?.otp}
            mobile_no={sendResult?.mobile_no}
              onSuccess={() => setOpen(false)}
          />
        )}

        <div className="w-[40%] h-full  top-12  sm:top-2 sm:right-4 absolute">
          <img src="/login.svg" alt="secure_login" className="w-full h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
