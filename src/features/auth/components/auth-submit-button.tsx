import type { ComponentProps } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/cn";

export function AuthSubmitButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      type="submit"
      className={cn(
        "w-full bg-auth-primary text-auth-primary-foreground hover:bg-auth-primary/90 focus-visible:border-auth-ring focus-visible:ring-auth-ring/50",
        className,
      )}
      {...props}
    />
  );
}
