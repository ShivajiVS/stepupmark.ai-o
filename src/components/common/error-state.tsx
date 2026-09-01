import type { ReactNode } from "react";

import { AlertCircleIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
  children?: ReactNode;
};

export function ErrorState({ title, description, onRetry, children }: ErrorStateProps) {
  return (
    <Empty role="alert" className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircleIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onRetry === undefined ? null : (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        {children}
      </EmptyContent>
    </Empty>
  );
}
