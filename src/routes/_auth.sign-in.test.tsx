import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { demoCredentials } from "~/mocks/data";
import { renderRoutes } from "~/test/render-routes";

import SignInRoute from "./_auth.sign-in";

function renderSignIn() {
  return renderRoutes(
    [
      { path: "/sign-in", Component: SignInRoute },
      { path: "/app", Component: () => <h1>Overview</h1> },
    ],
    "/sign-in",
  );
}

describe("sign-in route", () => {
  it("blocks submission until the fields are valid", async () => {
    const user = userEvent.setup();
    renderSignIn();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("puts a rejected sign-in on the field rather than in a toast", async () => {
    const user = userEvent.setup();
    renderSignIn();

    await user.type(screen.getByLabelText("Email"), demoCredentials.email);
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Incorrect email or password.")).toBeInTheDocument();
  });

  it("moves to the app once credentials are accepted", async () => {
    const user = userEvent.setup();
    renderSignIn();

    await user.type(screen.getByLabelText("Email"), demoCredentials.email);
    await user.type(screen.getByLabelText("Password"), demoCredentials.password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("sends a signed-in user back to the page they came from", async () => {
    const user = userEvent.setup();
    // /app is the only protected page today, so the second route is a synthetic
    // stand-in. It has to differ from the post-sign-in default for the assertion
    // to prove redirectTo was honoured rather than merely ignored.
    renderRoutes(
      [
        { path: "/sign-in", Component: SignInRoute },
        { path: "/app", Component: () => <h1>Overview</h1> },
        { path: "/app/elsewhere", Component: () => <h1>Elsewhere</h1> },
      ],
      "/sign-in?redirectTo=%2Fapp%2Felsewhere",
    );

    await user.type(screen.getByLabelText("Email"), demoCredentials.email);
    await user.type(screen.getByLabelText("Password"), demoCredentials.password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Elsewhere" })).toBeInTheDocument();
  });

  it("never follows a redirectTo that points off-site", async () => {
    const user = userEvent.setup();
    renderRoutes(
      [
        { path: "/sign-in", Component: SignInRoute },
        { path: "/app", Component: () => <h1>Overview</h1> },
      ],
      "/sign-in?redirectTo=%2F%2Fevil.com",
    );

    await user.type(screen.getByLabelText("Email"), demoCredentials.email);
    await user.type(screen.getByLabelText("Password"), demoCredentials.password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("toggles the password field between masked and revealed", async () => {
    const user = userEvent.setup();
    renderSignIn();

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });
});
