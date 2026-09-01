import type { ComponentType, ReactNode } from "react";
import { Link, useMatch } from "react-router";

import { LayoutDashboardIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

type AppLink = {
  to: string;
  label: string;
  end: boolean;
  icon: ComponentType<{ className?: string }>;
};

const APP_LINKS: AppLink[] = [
  { to: "/app", label: "Overview", end: true, icon: LayoutDashboardIcon },
];

type AppShellProps = {
  children: ReactNode;
  // The sign-out control lives in a feature, which components/ may not import.
  footer?: ReactNode;
  defaultSidebarOpen?: boolean;
};

export function AppShell({ children, footer, defaultSidebarOpen = true }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link to="/app" className="flex h-8 items-center overflow-hidden px-1">
            <span className="sr-only">stepupmark</span>
            {/* The wordmark is ~5.7:1, far too wide for the 3rem rail, so the
                collapsed state falls back to the square mark. */}
            <img
              src="/stepupmark-logo.png"
              alt=""
              className="h-7 w-auto group-data-[collapsible=icon]:hidden"
            />
            <img
              src="/favicon.png"
              alt=""
              className="hidden size-7 shrink-0 group-data-[collapsible=icon]:block"
            />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {APP_LINKS.map((link) => (
                  <AppNavItem key={link.to} link={link} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {footer === undefined ? null : (
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>{footer}</SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="size-11 md:size-7" />
        </header>

        <div
          id="app-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 3xl:max-w-7xl 4xl:max-w-8xl"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppNavItem({ link }: { link: AppLink }) {
  // The boolean is needed in JS for data-active, not just in CSS, so this is
  // useMatch + Link rather than NavLink — one source of truth for both states.
  const isActive = useMatch({ path: link.to, end: link.end }) !== null;
  const Icon = link.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={link.label} className="h-11 md:h-8">
        <Link to={link.to} aria-current={isActive ? "page" : undefined}>
          <Icon aria-hidden="true" />
          <span>{link.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
