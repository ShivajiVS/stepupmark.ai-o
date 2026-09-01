import type { ComponentType, ReactNode } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "~/components/ui/card";

type AuthCardProps = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ icon: Icon, title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="shadow-lg lg:rounded-none lg:border-0 lg:bg-transparent lg:py-0 lg:shadow-none">
      <CardHeader className="text-center">
        {Icon === undefined ? null : (
          <div className="mx-auto mb-1 flex size-11 items-center justify-center rounded-full bg-auth-primary/10">
            <Icon className="size-5 text-auth-primary" />
          </div>
        )}
        {/* A real heading, not CardTitle (which renders a div) — e2e tests query for getByRole("heading", ...). */}
        <h1 className="text-2xl leading-none font-semibold tracking-tight">{title}</h1>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
      {footer !== undefined ? (
        <CardFooter className="justify-center border-t text-sm text-muted-foreground lg:border-t-0">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
