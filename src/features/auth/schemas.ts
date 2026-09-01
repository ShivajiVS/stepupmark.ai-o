import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// 72 matches bcrypt's byte limit — silently truncating past it would let a user
// set a password longer than what the hash actually verifies against.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

const confirmPasswordRefinement = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100, "That name is too long."),
    email: z.email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    // z.boolean() rather than z.literal(true): the field must start false (an
    // unchecked box) as a valid intermediate form state, and only fail validation
    // on submit — a literal(true) would infer the field's type as `true` itself,
    // making an unchecked default a type error.
    acceptTerms: z.boolean().refine((value) => value, "You must accept the terms to continue."),
  })
  .refine(confirmPasswordRefinement, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code."),
});

export type OtpInput = z.infer<typeof otpSchema>;

export const forgotPasswordEmailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type ForgotPasswordEmailInput = z.infer<typeof forgotPasswordEmailSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine(confirmPasswordRefinement, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const challengeSchema = z.object({ challengeId: z.string().min(1) });

export const resetTokenSchema = z.object({ resetToken: z.string().min(1) });

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

export const sessionSchema = z.object({
  accessToken: z.string().min(1),
  user: userProfileSchema,
});

export type Session = z.infer<typeof sessionSchema>;
