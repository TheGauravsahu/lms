import z from "zod";

export const loginSchema = z.object({
  mobile_no: z.string().length(10, "Invalid mobile no"),
});

// mobile_no, name, otp
export const verifyOtpSchema = z.object({
  mobile_no: z.string().length(10, "Invalid mobile no"),
  name: z.string().min(1, "Name must be atleast one character long"),
  otp: z.string().length(6, "Invalid otp"),
});
