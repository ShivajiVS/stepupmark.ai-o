import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { renderRoutes } from "~/test/render-routes";

import { AppShell } from "./app-shell";

function renderShell({ defaultSidebarOpen = true } = {}) {
  return renderRoutes(
    [
      {
        path: "/app",
        Component: () => (
          <AppShell
            defaultSidebarOpen={defaultSidebarOpen}
            footer={<button type="button">Sign out</button>}
          >
            <h1>Overview</h1>
          </AppShell>
        ),
      },
    ],
    "/app",
  );
}

const desktopMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = desktopMatchMedia;
});

describe("app shell", () => {
  it("marks the page you are on as current", () => {
    renderShell();

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  });

  it("puts a skip link ahead of the navigation in the tab order", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.tab();

    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
  });

  it("renders the footer slot", () => {
    renderShell();

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("collapses and expands from the trigger", async () => {
    const user = userEvent.setup();
    const { container } = renderShell();

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toHaveAttribute("data-state", "expanded");

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(sidebar).toHaveAttribute("data-state", "collapsed");

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(sidebar).toHaveAttribute("data-state", "expanded");
  });

  it("honours a stored collapsed preference on first render", () => {
    const { container } = renderShell({ defaultSidebarOpen: false });

    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    );
  });

  it("hides navigation behind a dialog on a narrow viewport", async () => {
    window.matchMedia = (query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        addListener: () => {},
        removeListener: () => {},
      }) as MediaQueryList;

    const user = userEvent.setup();
    renderShell();

    expect(screen.queryByRole("link", { name: "Overview" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));

    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getByRole("link", { name: "Overview" })).toBeInTheDocument();
  });
});
