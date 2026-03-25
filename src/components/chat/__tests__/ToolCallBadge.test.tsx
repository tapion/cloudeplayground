import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ToolInvocation } from "ai";
import { getToolLabel, ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel (pure function) ---

test("str_replace_editor create in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, false)).toBe("Creating App.jsx");
});

test("str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, true)).toBe("Created App.jsx");
});

test("str_replace_editor str_replace in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.jsx" }, false)).toBe("Editing Button.jsx");
});

test("str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.jsx" }, true)).toBe("Edited Button.jsx");
});

test("str_replace_editor insert in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }, false)).toBe("Editing App.jsx");
});

test("str_replace_editor insert done", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" }, true)).toBe("Edited App.jsx");
});

test("str_replace_editor view in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, false)).toBe("Reading App.jsx");
});

test("str_replace_editor view done", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" }, true)).toBe("Read App.jsx");
});

test("str_replace_editor undo_edit in-progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, false)).toBe("Undoing edit on App.jsx");
});

test("str_replace_editor undo_edit done", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" }, true)).toBe("Undid edit on App.jsx");
});

test("file_manager rename in-progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, false)).toBe("Renaming old.jsx to new.jsx");
});

test("file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" }, true)).toBe("Renamed old.jsx to new.jsx");
});

test("file_manager delete in-progress", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" }, false)).toBe("Deleting App.jsx");
});

test("file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" }, true)).toBe("Deleted App.jsx");
});

test("falls back to raw toolName for unknown tool", () => {
  expect(getToolLabel("some_other_tool", {}, false)).toBe("some_other_tool");
});

test("extracts basename from nested path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/components/ui/Card.tsx" }, false)).toBe("Creating Card.tsx");
});

test("handles missing path gracefully", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, false)).toBe("Creating ");
});

// --- ToolCallBadge (component) ---

function makeInvocation(overrides: Record<string, any> = {}): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
    ...overrides,
  } as ToolInvocation;
}

test("shows spinner when in-progress", () => {
  const { container } = render(<ToolCallBadge toolInvocation={makeInvocation()} />);
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation({ state: "result", result: "Success" })} />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when result is falsy", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation({ state: "result", result: null })} />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders in-progress label for create", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation()} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("renders done label for create", () => {
  render(
    <ToolCallBadge toolInvocation={makeInvocation({ state: "result", result: "ok" })} />
  );
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

test("renders rename label with 'to'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
      })}
    />
  );
  expect(screen.getByText("Renaming old.jsx to new.jsx")).toBeDefined();
});

test("renders fallback label for unknown tool", () => {
  render(
    <ToolCallBadge toolInvocation={makeInvocation({ toolName: "unknown_tool", args: {} })} />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
