import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TestOffice as Index } from "./office-fixture";

// The route module keeps its component unexported so the router can code-split it,
// so the test reaches it through the route's own options.


// The Notes grid seeds four post-its and persists to localStorage, so each case
// must start from a clean storage or the previous case's writes leak into it.
const postIts = () => screen.getAllByLabelText("Note text");

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Notes", () => {
  it("adds a blank post-it that is typed into directly", () => {
    render(<Index />);
    expect(postIts()).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "+ Add New" }));
    const fresh = postIts().at(-1) as HTMLTextAreaElement;

    expect(postIts()).toHaveLength(5);
    expect(fresh).toHaveFocus();
    expect(fresh.value).toBe("");

    fireEvent.change(fresh, { target: { value: "Buy more coffee" } });
    expect((postIts().at(-1) as HTMLTextAreaElement).value).toBe("Buy more coffee");
  });

  it("throws away a fresh post-it that was left blank", () => {
    render(<Index />);

    fireEvent.click(screen.getByRole("button", { name: "+ Add New" }));
    expect(postIts()).toHaveLength(5);

    fireEvent.blur(postIts().at(-1) as HTMLTextAreaElement);
    expect(postIts()).toHaveLength(4);
  });

  it("deletes the note whose round remove icon is clicked", () => {
    render(<Index />);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete note: Remember to buy Milk for Coffe" }),
    );

    expect(postIts()).toHaveLength(3);
    expect(screen.queryByDisplayValue("Remember to buy Milk for Coffe")).toBeNull();
    expect(screen.getByDisplayValue("Bake cake for Pam's Birthday party at the office")).toBeInTheDocument();
  });
});
