import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { isApiError } from "~/services/api/errors";

// Maps a rejected mutation's field-level errors onto the form. Only the field
// names the caller lists can be set — an unrecognised key from the backend must
// never call setError on a field the form doesn't have. Returns false when the
// error carried no usable field errors, so the caller can fall back to a root
// error instead of silently showing nothing.
export function applyFieldErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  fields: readonly FieldPath<TFieldValues>[],
): boolean {
  if (!isApiError(error) || error.fieldErrors === undefined) return false;

  let applied = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0];
    if (message === undefined) continue;

    const knownField = fields.find((candidate) => candidate === field);
    if (knownField === undefined) continue;

    form.setError(knownField, { message });
    applied = true;
  }
  return applied;
}
