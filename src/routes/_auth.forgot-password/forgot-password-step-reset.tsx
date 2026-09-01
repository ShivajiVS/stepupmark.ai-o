import type { UseFormReturn } from "react-hook-form";

import { AuthSubmitButton, PasswordField, type ResetPasswordInput } from "~/features/auth";
import { FormErrorAlert } from "~/components/common/form-error-alert";
import { Form } from "~/components/ui/form";

type ForgotPasswordStepResetProps = {
  form: UseFormReturn<ResetPasswordInput>;
  onSubmit: (values: ResetPasswordInput) => void | Promise<void>;
};

export function ForgotPasswordStepReset({ form, onSubmit }: ForgotPasswordStepResetProps) {
  const rootError = form.formState.errors.root?.message;

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
        noValidate
      >
        <div className="space-y-4">
          <FormErrorAlert message={rootError} />

          <PasswordField
            control={form.control}
            name="password"
            label="New password"
            autoComplete="new-password"
          />

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
          />

          <AuthSubmitButton>
            {form.formState.isSubmitting ? "Resetting…" : "Reset password"}
          </AuthSubmitButton>
        </div>
      </form>
    </Form>
  );
}
