// Mirrors SIDEBAR_COOKIE_NAME in components/ui/sidebar.tsx, which does not export
// it. Read in the route's clientLoader so the shell never renders expanded and
// then snaps shut once the component reads the cookie for itself.
const SIDEBAR_COOKIE_NAME = "sidebar_state";

const WIDE_ENOUGH_TO_EXPAND = "(min-width: 1024px)";

export function readSidebarPreference(): boolean {
  const stored = new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE_NAME}=(true|false)`).exec(document.cookie);
  if (stored !== null) return stored[1] === "true";

  // No stored preference yet. A tablet-width viewport cannot spare 16rem, so it
  // starts on the icon rail; anything wider starts expanded.
  return window.matchMedia(WIDE_ENOUGH_TO_EXPAND).matches;
}
