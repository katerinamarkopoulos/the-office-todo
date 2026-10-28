import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";

import { Route } from "@/routes/index";

// The route module keeps its component unexported so the router can code-split it,
// so the test reaches it through the route's own options.
const Index = Route.options.component as () => ReactElement;

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const yesterday = dayKey(
  new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1),
);

const seed = (unfinished: number) =>
  localStorage.setItem(
    "office-tasks",
    JSON.stringify(
      Array.from({ length: unfinished }, (_, i) => ({
        id: `y${i}`,
        text: `Old thing ${i}`,
        day: yesterday,
        done: false,
      })),
    ),
  );

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Jims Side-Eye count line", () => {
  it("keeps the s with two tasks left", () => {
    seed(2);
    render(<Index />);
    expect(screen.getByText("“2 tasks left from past weeks. Should we tell Michael?”")).toBeTruthy();
  });

  it("drops the s with one task left", () => {
    seed(1);
    render(<Index />);
    expect(screen.getByText("“1 task left from past weeks. Should we tell Michael?”")).toBeTruthy();
  });

  it("says no tasks with none left", () => {
    seed(0);
    render(<Index />);
    expect(screen.getByText("“No tasks left from past weeks. Should we tell Michael?”")).toBeTruthy();
  });
});
