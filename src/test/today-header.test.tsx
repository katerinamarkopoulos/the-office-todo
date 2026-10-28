import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";

import { Route } from "@/routes/index";

// The route module keeps its component unexported so the router can code-split it,
// so the test reaches it through the route's own options.
const Index = Route.options.component as () => ReactElement;

const dateLabel = () => screen.getByRole("button", { name: "Choose day" });

// Same wording the header shows: "Wednesday, 28 Oct".
const labelFor = (d: Date) =>
  `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Todays Office header", () => {
  it("jumps back to today's date from another day", () => {
    render(<Index />);
    const today = labelFor(new Date());

    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    const otherDay = dateLabel().textContent!.trim();
    expect(otherDay).not.toBe(today);

    fireEvent.click(screen.getByRole("button", { name: "Todays Office – go to today" }));

    expect(dateLabel().textContent!.trim()).toBe(today);
  });
});
