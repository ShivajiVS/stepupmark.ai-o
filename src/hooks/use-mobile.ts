import { useEffect, useState } from "react";

// Keep in step with the `md:` boundary in sidebar.tsx: below this the sidebar is
// an off-canvas sheet, at or above it an inline rail.
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`);
    const sync = () => {
      setIsMobile(query.matches);
    };

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
    };
  }, []);

  return isMobile;
}
