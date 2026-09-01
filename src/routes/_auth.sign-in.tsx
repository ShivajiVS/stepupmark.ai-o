import { Link, useSearchParams } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { env } from "~/app/config/env";
import {
  AuthCard,
  AuthSubmitButton,
  EmailField,
  GoogleButton,
  loginSchema,
  PasswordField,
  useLogin,
  type LoginInput,
} from "~/features/auth";
import { FormErrorAlert } from "~/components/common/form-error-alert";
import { LoadingState } from "~/components/common/loading-state";
import { Form } from "~/components/ui/form";
import { applyFieldErrors } from "~/lib/apply-field-errors";
import { describeError } from "~/lib/describe-error";

export function meta() {
  return [{ title: "Sign in · stepupmark" }];
}

export function clientLoader() {
  return null;
}

export function HydrateFallback() {
  return <LoadingState rows={3} label="Loading" />;
}

const FIELDS = ["email", "password"] as const;

export default function SignInRoute() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const registerHref =
    redirectTo === undefined
      ? "/register"
      : `/register?redirectTo=${encodeURIComponent(redirectTo)}`;
  const forgotPasswordHref =
    redirectTo === undefined
      ? "/forgot-password"
      : `/forgot-password?redirectTo=${encodeURIComponent(redirectTo)}`;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const login = useLogin(redirectTo);

  async function onSubmit(values: LoginInput) {
    try {
      await login.mutateAsync(values);
      toast.success("Signed in");
    } catch (error) {
      if (applyFieldErrors(form, error, FIELDS)) return;
      form.setError("root", { message: describeError(error).description });
    }
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <AuthCard
      icon={LogInIcon}
      title="Sign in"
      description={env.VITE_ENABLE_MSW ? "Use ada@example.com / password123" : "Welcome back"}
      footer={
        <>
          No account?
          <Link
            to={registerHref}
            className="ml-1 font-medium text-auth-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      <GoogleButton />

      <Form {...form}>
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          noValidate
        >
          <div className="space-y-4">
            <FormErrorAlert message={rootError} />

            <EmailField control={form.control} name="email" />

            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                to={forgotPasswordHref}
                className="text-sm font-medium text-auth-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <AuthSubmitButton>
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </AuthSubmitButton>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
}
