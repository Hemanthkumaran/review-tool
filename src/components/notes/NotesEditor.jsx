import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

function formatRelative(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 60) return "Just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * Props:
 *  - initialHtml?: string
 *  - lastUpdated?: Date | string
 *  - onSave?(html: string): void
 *  - onCancel?(): void
 */
export default function NotesEditor({
  initialHtml = "",
  lastUpdated,
  onSave,
  onCancel,
}) {
  const [dirty, setDirty] = useState(false);
  const [content, setContent] = useState(initialHtml);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3, 4], // we’ll use h4-ish visually
        },
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialHtml,
    autofocus: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setContent(html);
      setDirty(true);
    },
  });

  // keep editor in sync if initialHtml prop changes
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(initialHtml || "", false);
    setContent(initialHtml || "");
    setDirty(false);
  }, [initialHtml, editor]);

  const lastUpdatedLabel = lastUpdated ? formatRelative(lastUpdated) : "—";

  if (!editor) {
    // TipTap editor not mounted yet
    return (
      <div className="bg-[#050506] rounded-2xl border border-[#202124] h-[460px] flex items-center justify-center text-xs text-gray-400">
        Loading editor…
      </div>
    );
  }

  // toolbar actions
  const setHeading = () => {
    // toggle between paragraph and heading
    if (editor.isActive("heading", { level: 3 })) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setHeading({ level: 3 }).run();
    }
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleChecklist = () => {
    editor.chain().focus().toggleTaskList().run();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const handleSave = () => {
    if (onSave) onSave(content);
    setDirty(false);
  };

  const handleCancel = () => {
    // reset editor to last saved content
    if (editor) {
      editor.commands.setContent(initialHtml || "", false);
    }
    setContent(initialHtml || "");
    setDirty(false);
    onCancel?.();
  };

  return (
    <div className="bg-[#050506] rounded-2xl border border-[#202124] flex flex-col h-[460px] text-[13px] text-gray-100">
      {/* header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="font-medium text-[13px]">Internal notes</div>
        <div className="text-[11px] text-gray-400">
          Last updated: {lastUpdatedLabel}
        </div>
      </div>

      {/* editor area */}
      <div className="flex-1 px-4 py-3 overflow-auto">
        <EditorContent
          editor={editor}
          className="notes-editor text-[13px] leading-relaxed"
        />
      </div>

      {/* toolbar footer */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={setHeading}
            className={`px-2 py-1 rounded-full hover:bg-white/5 ${
              editor.isActive("heading", { level: 3 }) ? "bg-white/10" : ""
            }`}
          >
            Aa
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className={`px-2 py-1 rounded-full hover:bg-white/5 italic ${
              editor.isActive("italic") ? "bg-white/10" : ""
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={toggleBold}
            className={`px-2 py-1 rounded-full hover:bg-white/5 font-semibold ${
              editor.isActive("bold") ? "bg-white/10" : ""
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={toggleChecklist}
            className={`px-2 py-1 rounded-full hover:bg-white/5 ${
              editor.isActive("taskList") ? "bg-white/10" : ""
            }`}
          >
            ✓
          </button>
          <button
            type="button"
            onClick={addLink}
            className="px-2 py-1 rounded-full hover:bg-white/5"
          >
            🔗
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-[6px] rounded-full border border-[#2a2b2e] bg-[#111216] text-gray-200 hover:bg-[#18191d]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className="px-4 py-[6px] rounded-full bg-[#FEEA3B] text-black font-medium disabled:opacity-40 disabled:cursor-default"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
