import { useNavigate } from "react-router";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { clearAccessToken, setAccessToken } from "~/services/api/session";

import {
  forgotPasswordStart,
  forgotPasswordVerify,
  login,
  logout,
  registerStart,
  registerVerify,
  resetPassword,
} from "./api/auth.api";
import { authKeys } from "./queries";
import { safeRedirectTo } from "./redirect";
import type { Session } from "./schemas";

function startSession(queryClient: QueryClient, session: Session) {
  setAccessToken(session.accessToken);
  queryClient.setQueryData(authKeys.currentUser(), session.user);
}

export function useLogin(redirectTo?: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    async onSuccess(session) {
      startSession(queryClient, session);
      await navigate(safeRedirectTo(redirectTo));
    },
  });
}

export function useRegisterStart() {
  return useMutation({ mutationFn: registerStart });
}

export function useRegisterVerify(redirectTo?: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerVerify,
    async onSuccess(session) {
      startSession(queryClient, session);
      await navigate(safeRedirectTo(redirectTo));
    },
  });
}

export function useForgotPasswordStart() {
  return useMutation({ mutationFn: forgotPasswordStart });
}

export function useForgotPasswordVerify() {
  return useMutation({ mutationFn: forgotPasswordVerify });
}

export function useForgotPasswordReset() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resetPassword,
    async onSuccess() {
      await navigate("/sign-in");
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    async onSettled() {
      // Runs on failure too: a client holding stale cache is worse than a failed
      // network call, and the refresh cookie is already invalid server-side.
      clearAccessToken();
      queryClient.clear();
      await navigate("/sign-in");
    },
  });
}
