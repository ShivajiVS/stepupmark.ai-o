import type { UseFormReturn } from "react-hook-form";

import { AuthSubmitButton, OtpField, type OtpInput } from "~/features/auth";
import { FormErrorAlert } from "~/components/common/form-error-alert";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";

type ForgotPasswordStepOtpProps = {
  form: UseFormReturn<OtpInput>;
  onSubmit: (values: OtpInput) => void | Promise<void>;
  onResend: () => void;
  resendPending: boolean;
  onBack: () => void;
};

export function ForgotPasswordStepOtp({
  form,
  onSubmit,
  onResend,
  resendPending,
  onBack,
}: ForgotPasswordStepOtpProps) {
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

          <OtpField
            control={form.control}
            name="code"
            onResend={onResend}
            resendPending={resendPending}
          />

          <AuthSubmitButton>
            {form.formState.isSubmitting ? "Verifying…" : "Verify code"}
          </AuthSubmitButton>

          <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
}
