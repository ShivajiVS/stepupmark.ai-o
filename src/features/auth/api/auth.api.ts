import { apiClient } from "~/services/api/client";

import {
  challengeSchema,
  resetTokenSchema,
  sessionSchema,
  userProfileSchema,
  type ForgotPasswordEmailInput,
  type LoginInput,
  type OtpInput,
  type RegisterInput,
} from "../schemas";

export async function login(input: LoginInput) {
  const response = await apiClient.post("/auth/login", input);
  return sessionSchema.parse(response.data);
}

export async function registerStart(input: Omit<RegisterInput, "confirmPassword">) {
  const response = await apiClient.post("/auth/register/start", input);
  return challengeSchema.parse(response.data);
}

export async function registerVerify(input: OtpInput & { challengeId: string }) {
  const response = await apiClient.post("/auth/register/verify", input);
  return sessionSchema.parse(response.data);
}

export async function forgotPasswordStart(input: ForgotPasswordEmailInput) {
  const response = await apiClient.post("/auth/forgot-password/start", input);
  return challengeSchema.parse(response.data);
}

export async function forgotPasswordVerify(input: OtpInput & { challengeId: string }) {
  const response = await apiClient.post("/auth/forgot-password/verify", input);
  return resetTokenSchema.parse(response.data);
}

export async function resetPassword(input: { resetToken: string; password: string }) {
  await apiClient.post("/auth/forgot-password/reset", input);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function fetchCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return userProfileSchema.parse(response.data);
}
