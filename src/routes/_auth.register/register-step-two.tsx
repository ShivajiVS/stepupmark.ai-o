import type { UseFormReturn } from "react-hook-form";

import { AuthSubmitButton, PasswordField, type RegisterInput } from "~/features/auth";
import { FormErrorAlert } from "~/components/common/form-error-alert";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

type RegisterStepTwoProps = {
  form: UseFormReturn<RegisterInput>;
  onSubmit: (values: RegisterInput) => void | Promise<void>;
  onBack: () => void;
};

export function RegisterStepTwo({ form, onSubmit, onBack }: RegisterStepTwoProps) {
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
            label="Password"
            autoComplete="new-password"
          />

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal">
                    I agree to the Terms of Service and Privacy Policy
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <AuthSubmitButton>
            {form.formState.isSubmitting ? "Continuing…" : "Continue"}
          </AuthSubmitButton>

          <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
}
