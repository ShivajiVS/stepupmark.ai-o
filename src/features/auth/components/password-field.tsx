import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormMessage, useFormField } from "~/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";

type PasswordFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  autoComplete: "current-password" | "new-password";
};

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  autoComplete,
}: PasswordFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <PasswordInputGroup field={field} autoComplete={autoComplete} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type PasswordInputGroupProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  autoComplete: "current-password" | "new-password";
};

function PasswordInputGroup<TFieldValues extends FieldValues>({
  field,
  autoComplete,
}: PasswordInputGroupProps<TFieldValues>) {
  // FormControl is a Radix Slot: it stamps data-slot="form-control" onto its
  // direct child, which would overwrite InputGroupInput's own
  // data-slot="input-group-control" marker — the attribute the wrapping
  // InputGroup's focus-ring and error-state selectors key off. Wiring
  // id/aria-describedby/aria-invalid by hand, the same way FormControl itself
  // does, keeps that marker intact. This is a sibling of FormLabel/FormControl/
  // FormMessage, not a workaround: each of those is its own component precisely
  // so it can call useFormField() as a descendant of FormItem.
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup className="h-11">
      <InputGroupInput
        className="h-11"
        id={formItemId}
        aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
        aria-invalid={!!error}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        {...field}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => {
            setVisible((prev) => !prev);
          }}
        >
          {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
