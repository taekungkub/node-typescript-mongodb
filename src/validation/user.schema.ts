import { ERRORS } from "@/helper/Errors";
import { z } from "zod";

const regexStrongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$");

export const loginSchema = z.object({
  body: z.object({
    user_email: z
      .string({
        required_error: ERRORS.REQUIRED_EMAIL,
      })
      .email({ message: ERRORS.EMAIL_INVALID }),
    user_password: z.string({
      required_error: ERRORS.REQUIRED_PASSWORD,
    }),
  }),
});

export type LoginSchemaBody = z.infer<typeof loginSchema>["body"];

export const registerSchema = z.object({
  body: z
    .object({
      user_email: z.string().email(),
      user_password: z.string().refine((value) => regexStrongPassword.test(value), ERRORS.PASSWORD_NOT_STRONG),
      user_confirm_password: z.string(),
    })
    .refine((data) => data.user_password === data.user_confirm_password, {
      message: ERRORS.PASSWORD_NOT_MATCH,
      path: ["user_confirm_password"],
    }),
});

export type RegisterSchemaBody = z.infer<typeof registerSchema>["body"];

export const changepasswordSchema = z.object({
  body: z
    .object({
      user_password: z.string().refine((value) => regexStrongPassword.test(value), ERRORS.PASSWORD_NOT_STRONG),
      user_confirm_password: z.string(),
      current_password: z.string(),
    })
    .refine((data) => data.user_password === data.user_confirm_password, {
      message: ERRORS.PASSWORD_NOT_MATCH,
      path: ["user_confirm_password"],
    }),
});

export type ChangepasswordSchemaBody = z.infer<typeof changepasswordSchema>["body"];

export const changepasswordWithCodeSchema = z.object({
  body: z
    .object({
      user_password: z.string().refine((value) => regexStrongPassword.test(value), ERRORS.PASSWORD_NOT_STRONG),
      user_confirm_password: z.string(),
    })
    .refine((data) => data.user_password === data.user_confirm_password, {
      message: ERRORS.PASSWORD_NOT_MATCH,
      path: ["user_confirm_password"],
    }),
  params: z.object({
    code: z.string({ required_error: `Code is required` }),
  }),
});

export type ChangepasswordWithCodeSchemaBody = z.infer<typeof changepasswordWithCodeSchema>["body"];

export const resetPasswordBody = z.object({
  body: z.object({
    user_email: z
      .string({
        required_error: ERRORS.REQUIRED_EMAIL,
      })
      .email({ message: ERRORS.EMAIL_INVALID }),
  }),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBody>["body"];

export const resendVerifyBody = z.object({
  body: z.object({
    user_email: z
      .string({
        required_error: ERRORS.REQUIRED_EMAIL,
      })
      .email({ message: ERRORS.EMAIL_INVALID }),
  }),
});
export type ResendVerifyBody = z.infer<typeof resendVerifyBody>["body"];
