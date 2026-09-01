import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription } from "~/components/ui/alert";

export function FormErrorAlert({ message }: { message: string | undefined }) {
  if (message === undefined) return null;

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
