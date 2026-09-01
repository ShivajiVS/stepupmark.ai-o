import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "~/mocks/server";

// jsdom does not implement ResizeObserver. Radix's Checkbox indicator uses it to
// measure itself, so mounting a Checkbox crashes without this stub.
class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub;

// jsdom does not implement elementFromPoint either. input-otp's internal fake-caret
// timer calls it on every tick, which otherwise throws well after the test that
// triggered it has finished, failing an unrelated later test.
document.elementFromPoint = () => null;

// jsdom does not implement matchMedia. useIsMobile subscribes to it, so anything
// rendering the sidebar shell cannot mount without this. Defaults to no match —
// a desktop viewport. A test that needs the mobile branch reassigns
// window.matchMedia itself and restores it afterwards.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    addListener: () => {},
    removeListener: () => {},
  }) as MediaQueryList;

// "error" rather than "warn": an unhandled request means the test is exercising
// a path the mock contract does not cover, which should fail loudly.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
