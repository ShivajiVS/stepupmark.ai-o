import { useState } from "react";
import { Link } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, LockIcon, ShieldCheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AuthCard,
  forgotPasswordEmailSchema,
  otpSchema,
  resetPasswordSchema,
  useForgotPasswordReset,
  useForgotPasswordStart,
  useForgotPasswordVerify,
  type ForgotPasswordEmailInput,
  type OtpInput,
  type ResetPasswordInput,
} from "~/features/auth";
import { LoadingState } from "~/components/common/loading-state";
import { applyFieldErrors } from "~/lib/apply-field-errors";
import { describeError } from "~/lib/describe-error";

import { ForgotPasswordStepEmail } from "./forgot-password-step-email";
import { ForgotPasswordStepOtp } from "./forgot-password-step-otp";
import { ForgotPasswordStepReset } from "./forgot-password-step-reset";

export function meta() {
  return [{ title: "Reset your password · stepupmark" }];
}

export function clientLoader() {
  return null;
}

export function HydrateFallback() {
  return <LoadingState rows={3} label="Loading" />;
}

const STEP_TITLES = {
  1: "Reset your password",
  2: "Check your email",
  3: "Choose a new password",
} as const;

const STEP_ICONS = {
  1: KeyRoundIcon,
  2: ShieldCheckIcon,
  3: LockIcon,
} as const;

export default function ForgotPasswordRoute() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Three separate payloads to three separate endpoints, not one growing form —
  // keeping a useForm per step also lets an earlier step's validation state reset
  // cleanly when the user goes back.
  const emailForm = useForm<ForgotPasswordEmailInput>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const forgotPasswordStart = useForgotPasswordStart();
  const forgotPasswordVerify = useForgotPasswordVerify();
  const forgotPasswordReset = useForgotPasswordReset();

  async function onEmailSubmit(values: ForgotPasswordEmailInput) {
    try {
      const { challengeId: id } = await forgotPasswordStart.mutateAsync(values);
      setChallengeId(id);
      setEmail(values.email);
      setStep(2);
    } catch (error) {
      if (applyFieldErrors(emailForm, error, ["email"] as const)) return;
      emailForm.setError("root", { message: describeError(error).description });
    }
  }

  async function onOtpSubmit(values: OtpInput) {
    if (challengeId === null) return;
    try {
      const { resetToken: token } = await forgotPasswordVerify.mutateAsync({
        challengeId,
        code: values.code,
      });
      setResetToken(token);
      setStep(3);
    } catch (error) {
      if (applyFieldErrors(otpForm, error, ["code"] as const)) return;
      otpForm.setError("root", { message: describeError(error).description });
    }
  }

  function handleResendCode() {
    if (email === null) return;
    forgotPasswordStart.mutate(
      { email },
      {
        onSuccess: (data) => {
          setChallengeId(data.challengeId);
        },
      },
    );
  }

  function stepDescription() {
    if (step === 1) return "Enter the email on your account";
    if (step === 3) return "Make it at least 8 characters";
    return "Enter the code we sent you";
  }

  function handleBackToEmail() {
    setStep(1);
    setChallengeId(null);
    otpForm.reset();
  }

  async function onResetSubmit(values: ResetPasswordInput) {
    if (resetToken === null) return;
    try {
      await forgotPasswordReset.mutateAsync({ resetToken, password: values.password });
      toast.success("Password reset — sign in with your new password");
    } catch (error) {
      if (applyFieldErrors(resetForm, error, ["password", "confirmPassword"] as const)) return;
      resetForm.setError("root", { message: describeError(error).description });
    }
  }

  return (
    <AuthCard
      icon={STEP_ICONS[step]}
      title={STEP_TITLES[step]}
      description={stepDescription()}
      footer={
        step === 1 ? (
          <>
            Remember your password?
            <Link
              to="/sign-in"
              className="ml-1 font-medium text-auth-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : undefined
      }
    >
      {step === 1 ? (
        <ForgotPasswordStepEmail form={emailForm} onSubmit={onEmailSubmit} />
      ) : step === 2 ? (
        <ForgotPasswordStepOtp
          form={otpForm}
          onSubmit={onOtpSubmit}
          onResend={handleResendCode}
          resendPending={forgotPasswordStart.isPending}
          onBack={handleBackToEmail}
        />
      ) : (
        <ForgotPasswordStepReset form={resetForm} onSubmit={onResetSubmit} />
      )}
    </AuthCard>
  );
}
