"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function basename(path?: string): string {
  if (!path) return "";
  return path.split("/").pop() ?? path;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, any>,
  isDone: boolean
): string {
  if (toolName === "str_replace_editor") {
    const file = basename(args.path);
    switch (args.command) {
      case "create":
        return isDone ? `Created ${file}` : `Creating ${file}`;
      case "str_replace":
      case "insert":
        return isDone ? `Edited ${file}` : `Editing ${file}`;
      case "view":
        return isDone ? `Read ${file}` : `Reading ${file}`;
      case "undo_edit":
        return isDone ? `Undid edit on ${file}` : `Undoing edit on ${file}`;
    }
  }

  if (toolName === "file_manager") {
    const file = basename(args.path);
    const newFile = basename(args.new_path);
    switch (args.command) {
      case "rename":
        return isDone
          ? `Renamed ${file} to ${newFile}`
          : `Renaming ${file} to ${newFile}`;
      case "delete":
        return isDone ? `Deleted ${file}` : `Deleting ${file}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation;
}) {
  const { toolName, args, state } = toolInvocation;
  const result = (toolInvocation as any).result;
  const isDone = state === "result" && !!result;
  const label = getToolLabel(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
