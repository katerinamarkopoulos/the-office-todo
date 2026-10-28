import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ReactElement } from "react";

import { Route } from "@/routes/index";

// The route module keeps its component unexported so the router can code-split it,
// so the test reaches it through the route's own options.
const Index = Route.options.component as () => ReactElement;

const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
  new Date().getDate(),
).padStart(2, "0")}`;

const yest = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
const yesterday = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(
  yest.getDate(),
).padStart(2, "0")}`;


const seed = () =>
  localStorage.setItem(
    "office-tasks",
    JSON.stringify([
      { id: "a", text: "Presentation med Micheal", day: today, done: false },
      { id: "b", text: "Möte med Jim", day: today, done: true },
    ]),
  );

const editButton = () => screen.getByRole("button", { name: "Edit task: Presentation med Micheal" });

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Editing a task", () => {
  it("keeps the new text after pressing Enter", () => {
    seed();
    render(<Index />);

    fireEvent.click(editButton());
    const field = screen.getByLabelText("Edit task text") as HTMLInputElement;
    expect(field.value).toBe("Presentation med Micheal");

    fireEvent.change(field, { target: { value: "Presentation med Michael" } });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(screen.queryByLabelText("Edit task text")).toBeNull();
    expect(screen.getByText("Presentation med Michael")).toBeInTheDocument();
    expect(screen.queryByText("Presentation med Micheal")).toBeNull();
  });

  it("puts the old text back when Escape is pressed", () => {
    seed();
    render(<Index />);

    fireEvent.click(editButton());
    const field = screen.getByLabelText("Edit task text") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "Glömt" } });
    fireEvent.keyDown(field, { key: "Escape" });

    expect(screen.queryByLabelText("Edit task text")).toBeNull();
    expect(screen.getByText("Presentation med Micheal")).toBeInTheDocument();
  });

  it("keeps the old text when the field is left blank", () => {
    seed();
    render(<Index />);

    fireEvent.click(editButton());
    const field = screen.getByLabelText("Edit task text") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(screen.getByText("Presentation med Micheal")).toBeInTheDocument();
  });

  it("saves on blur and keeps the task on its day", () => {
    seed();
    render(<Index />);

    fireEvent.click(editButton());
    fireEvent.change(screen.getByLabelText("Edit task text"), { target: { value: "Ringa Pam" } });
    fireEvent.blur(screen.getByLabelText("Edit task text"));

    expect(screen.getByText("Ringa Pam")).toBeInTheDocument();
    expect(screen.getByText("2 Tasks Left. Should we tell Michael?")).toBeTruthy();
  });
});
