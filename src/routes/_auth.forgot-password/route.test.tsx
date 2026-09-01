import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { demoOtp } from "~/mocks/data";
import { renderRoutes } from "~/test/render-routes";

import ForgotPasswordRoute from "./route";

function renderForgotPassword() {
  return renderRoutes(
    [
      { path: "/forgot-password", Component: ForgotPasswordRoute },
      { path: "/sign-in", Component: () => <h1>Sign in</h1> },
    ],
    "/forgot-password",
  );
}

async function reachOtpStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email"), "grace@example.com");
  await user.click(screen.getByRole("button", { name: "Send code" }));
  return screen.findByLabelText("Verification code");
}

describe("forgot-password route", () => {
  it("blocks step one until the email is valid", async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.click(screen.getByRole("button", { name: "Send code" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("rejects a wrong code on step two", async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await reachOtpStep(user);
    await user.type(screen.getByLabelText("Verification code"), "000000");
    await user.click(screen.getByRole("button", { name: "Verify code" }));

    expect(await screen.findByText("Incorrect or expired code.")).toBeInTheDocument();
  });

  it("returns to step one on back, clearing the code field", async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await reachOtpStep(user);
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(await screen.findByRole("button", { name: "Send code" })).toBeInTheDocument();
  });

  it("moves through OTP verification to the reset step, and rejects mismatched passwords", async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await reachOtpStep(user);
    await user.type(screen.getByLabelText("Verification code"), demoOtp);
    await user.click(screen.getByRole("button", { name: "Verify code" }));

    await user.type(await screen.findByLabelText("New password"), "a-new-password");
    await user.type(screen.getByLabelText("Confirm new password"), "a-different-password");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("resets the password and sends the user back to sign in", async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await reachOtpStep(user);
    await user.type(screen.getByLabelText("Verification code"), demoOtp);
    await user.click(screen.getByRole("button", { name: "Verify code" }));

    await user.type(await screen.findByLabelText("New password"), "a-new-password");
    await user.type(screen.getByLabelText("Confirm new password"), "a-new-password");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});
