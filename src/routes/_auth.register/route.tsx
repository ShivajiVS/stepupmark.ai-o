import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, ShieldCheckIcon, UserPlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AuthCard,
  otpSchema,
  registerSchema,
  useRegisterStart,
  useRegisterVerify,
  type OtpInput,
  type RegisterInput,
} from "~/features/auth";
import { LoadingState } from "~/components/common/loading-state";
import { applyFieldErrors } from "~/lib/apply-field-errors";
import { describeError } from "~/lib/describe-error";

import { RegisterStepOne } from "./register-step-one";
import { RegisterStepThree } from "./register-step-three";
import { RegisterStepTwo } from "./register-step-two";

export function meta() {
  return [{ title: "Create account · stepupmark" }];
}

export function clientLoader() {
  return null;
}

export function HydrateFallback() {
  return <LoadingState rows={3} label="Loading" />;
}

const STEP_ONE_FIELDS = ["name", "email"] as const;
const STEP_TWO_FIELDS = ["name", "email", "password", "confirmPassword"] as const;

const STEP_TITLES = {
  1: "Create an account",
  2: "Set a password",
  3: "Verify your email",
} as const;

const STEP_DESCRIPTIONS = {
  1: "Start building on stepupmark",
  2: "Make it at least 8 characters",
  3: "Enter the code we sent you",
} as const;

const STEP_ICONS = {
  1: UserPlusIcon,
  2: LockIcon,
  3: ShieldCheckIcon,
} as const;

export default function RegisterRoute() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const signInHref =
    redirectTo === undefined ? "/sign-in" : `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<Omit<
    RegisterInput,
    "confirmPassword"
  > | null>(null);

  // One form spans steps 1 and 2 — they're subsets of the same eventual payload,
  // gated by trigger()-ing only the fields each step owns. Step 3 verifies an OTP
  // against an unrelated endpoint, so it gets its own form.
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", acceptTerms: false },
  });
  const otpForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const registerStart = useRegisterStart();
  const registerVerify = useRegisterVerify(redirectTo);

  async function handleStepOneNext() {
    const valid = await form.trigger(STEP_ONE_FIELDS);
    if (valid) setStep(2);
  }

  async function onStepTwoSubmit(values: RegisterInput) {
    const { confirmPassword, ...payload } = values;
    try {
      const { challengeId: newChallengeId } = await registerStart.mutateAsync(payload);
      setChallengeId(newChallengeId);
      setPendingRegistration(payload);
      setStep(3);
    } catch (error) {
      if (applyFieldErrors(form, error, STEP_TWO_FIELDS)) {
        // A duplicate-email rejection targets a field that only step 1 renders —
        // send the user back so the error is actually visible.
        if (form.formState.errors.name !== undefined || form.formState.errors.email !== undefined) {
          setStep(1);
        }
        return;
      }
      form.setError("root", { message: describeError(error).description });
    }
  }

  async function onStepThreeSubmit(values: OtpInput) {
    if (challengeId === null) return;
    try {
      await registerVerify.mutateAsync({ challengeId, code: values.code });
      toast.success("Account created");
    } catch (error) {
      if (applyFieldErrors(otpForm, error, ["code"] as const)) return;
      otpForm.setError("root", { message: describeError(error).description });
    }
  }

  function handleResendCode() {
    if (pendingRegistration === null) return;
    registerStart.mutate(pendingRegistration, {
      onSuccess: (data) => {
        setChallengeId(data.challengeId);
      },
    });
  }

  return (
    <AuthCard
      icon={STEP_ICONS[step]}
      title={STEP_TITLES[step]}
      description={STEP_DESCRIPTIONS[step]}
      footer={
        step === 3 ? undefined : (
          <>
            Already have an account?
            <Link
              to={signInHref}
              className="ml-1 font-medium text-auth-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        )
      }
    >
      {step === 1 ? (
        <RegisterStepOne form={form} onNext={handleStepOneNext} />
      ) : step === 2 ? (
        <RegisterStepTwo
          form={form}
          onSubmit={onStepTwoSubmit}
          onBack={() => {
            setStep(1);
          }}
        />
      ) : (
        <RegisterStepThree
          form={otpForm}
          onSubmit={onStepThreeSubmit}
          onResend={handleResendCode}
          resendPending={registerStart.isPending}
          onBack={() => {
            setStep(2);
          }}
        />
      )}
    </AuthCard>
  );
}
