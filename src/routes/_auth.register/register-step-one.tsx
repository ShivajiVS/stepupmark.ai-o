import type { UseFormReturn } from "react-hook-form";

import { AuthSubmitButton, EmailField, GoogleButton, type RegisterInput } from "~/features/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

type RegisterStepOneProps = {
  form: UseFormReturn<RegisterInput>;
  onNext: () => void | Promise<void>;
};

export function RegisterStepOne({ form, onNext }: RegisterStepOneProps) {
  return (
    <>
      <GoogleButton />

      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="name" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <EmailField control={form.control} name="email" />

          <AuthSubmitButton
            type="button"
            onClick={() => {
              void onNext();
            }}
          >
            Continue
          </AuthSubmitButton>
        </div>
      </Form>
    </>
  );
}
