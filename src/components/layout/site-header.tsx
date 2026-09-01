import { Link, NavLink } from "react-router";

import { Button, buttonVariants } from "~/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About", end: false },
];

export function SiteHeader() {
  return (
    <header className="border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4"
      >
        <Link to="/">
          <img src="/stepupmark-logo.png" alt="stepupmark" className="h-8 w-auto" />
        </Link>

        <ul className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" })
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sign-in">Sign in</Link>
            </Button>
          </li>
          <li>
            <Button size="sm" asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
