import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { demoCredentials } from "~/mocks/data";
import { renderRoutes } from "~/test/render-routes";

import RegisterRoute from "./route";

function renderRegister() {
  return renderRoutes(
    [
      { path: "/register", Component: RegisterRoute },
      { path: "/app", Component: () => <h1>Overview</h1> },
    ],
    "/register",
  );
}

async function fillStepOne(user: ReturnType<typeof userEvent.setup>, email: string) {
  await user.type(screen.getByLabelText("Name"), "Grace Hopper");
  await user.type(screen.getByLabelText("Email"), email);
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

async function fillStepTwo(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText("Password"), "a-fresh-password");
  await user.type(screen.getByLabelText("Confirm password"), "a-fresh-password");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

describe("register route", () => {
  it("blocks step one until the fields are valid", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("blocks step two until the fields are valid", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, "grace@example.com");
    await user.click(await screen.findByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByText("You must accept the terms to continue.")).toBeInTheDocument();
  });

  it("rejects a mismatched confirm password", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, "grace@example.com");
    await user.type(await screen.findByLabelText("Password"), "a-fresh-password");
    await user.type(screen.getByLabelText("Confirm password"), "a-different-password");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("puts a duplicate email on step one's field rather than in a toast, without advancing", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, demoCredentials.email);
    await fillStepTwo(user);

    expect(await screen.findByText("Already registered.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.queryByLabelText("Verification code")).not.toBeInTheDocument();
  });

  it("moves to step three once step two succeeds, and rejects a wrong code", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, "grace@example.com");
    await fillStepTwo(user);

    await user.type(await screen.findByLabelText("Verification code"), "000000");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Incorrect or expired code.")).toBeInTheDocument();
  });

  it("creates the account and signs in once the code is verified", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, "grace@example.com");
    await fillStepTwo(user);

    await user.type(await screen.findByLabelText("Verification code"), "123456");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("returns to step two, with values preserved, on back", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, "grace@example.com");
    await fillStepTwo(user);

    await screen.findByLabelText("Verification code");
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(await screen.findByLabelText("Password")).toHaveValue("a-fresh-password");
  });

  it("returns to step one, with values preserved, from step two", async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillStepOne(user, "grace@example.com");
    await user.click(await screen.findByRole("button", { name: "Back" }));

    expect(await screen.findByLabelText("Email")).toHaveValue("grace@example.com");
  });
});
