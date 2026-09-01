import type { UseFormReturn } from "react-hook-form";

import { AuthSubmitButton, EmailField, type ForgotPasswordEmailInput } from "~/features/auth";
import { FormErrorAlert } from "~/components/common/form-error-alert";
import { Form } from "~/components/ui/form";

type ForgotPasswordStepEmailProps = {
  form: UseFormReturn<ForgotPasswordEmailInput>;
  onSubmit: (values: ForgotPasswordEmailInput) => void | Promise<void>;
};

export function ForgotPasswordStepEmail({ form, onSubmit }: ForgotPasswordStepEmailProps) {
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

          <EmailField control={form.control} name="email" />

          <AuthSubmitButton>
            {form.formState.isSubmitting ? "Sending…" : "Send code"}
          </AuthSubmitButton>
        </div>
      </form>
    </Form>
  );
}
