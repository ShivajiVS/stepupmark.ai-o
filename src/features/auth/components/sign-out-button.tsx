import { LogOutIcon } from "lucide-react";

import { SidebarMenuButton } from "~/components/ui/sidebar";

import { useLogout } from "../mutations";

export function SignOutButton() {
  const logout = useLogout();

  return (
    <SidebarMenuButton
      onClick={() => {
        logout.mutate();
      }}
      disabled={logout.isPending}
      tooltip="Sign out"
      className="h-11 md:h-8"
    >
      <LogOutIcon aria-hidden="true" />
      <span>Sign out</span>
    </SidebarMenuButton>
  );
}
