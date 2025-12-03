// src/components/notes/NotesEditor.jsx
import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

/**
 * Props:
 *  - sections?: [{ id: string; label: string }]
 *  - initialBySection?: Record<sectionId, html>
 *  - lastUpdatedBySection?: Record<sectionId, Date|string>
 *  - onSave?(sectionId: string, html: string): Promise<void> | void
 *  - onCancel?(): void
 *  - savingSectionId?: string
 */
export default function NotesEditor({
  sections = [
    { id: "brief", label: "Brief" },
    { id: "script", label: "Script" },
    { id: "references", label: "References" },
    { id: "raw", label: "Raw file" },
  ],
  initialBySection = {},
  onSave,
  onCancel,
  savingSectionId,
}) {
  const defaultSectionId = sections[0]?.id;
  const [activeSection, setActiveSection] = useState(defaultSectionId);

  // state: content + dirty per section
  const [contents, setContents] = useState(() => {
    const obj = {};
    sections.forEach((s) => {
      obj[s.id] = initialBySection[s.id] || "";
    });
    return obj;
  });
  const [dirtyMap, setDirtyMap] = useState(() => {
    const obj = {};
    sections.forEach((s) => {
      obj[s.id] = false;
    });
    return obj;
  });

  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3, 4],
        },
      }),
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
    ],
    content: contents[activeSection] || "",
    autofocus: false,
    editorProps: {
      attributes: {
        class: "notes-editor font-[Gilroy] text-[13px]",
      },
    },
    onUpdate({ editor }) {
      const current = activeSectionRef.current;
      const html = editor.getHTML();

      setContents((prev) => ({
        ...prev,
        [current]: html,
      }));
      setDirtyMap((prev) => ({
        ...prev,
        [current]: true,
      }));
    },
  });

  // sync with initialBySection (e.g. after fetch)
  useEffect(() => {
    const next = {};
    sections.forEach((s) => {
      next[s.id] = initialBySection[s.id] || "";
    });
    setContents(next);

    const clean = {};
    sections.forEach((s) => {
      clean[s.id] = false;
    });
    setDirtyMap(clean);

    if (editor) {
      editor.commands.setContent(next[activeSection] || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBySection, sections, editor]);

  // ⬇️ FIX 1: no auto-focus on tab switch (prevents weird blinking)
  const handleChangeSection = (id) => {
    setActiveSection(id);
    if (editor) {
      editor.commands.setContent(contents[id] || "", false);
      // no editor.commands.focus() here
    }
  };

  if (!editor) {
    return (
      <div className="bg-[#050506] rounded-2xl border border-[#202124] h-[460px] flex items-center justify-center text-xs text-gray-400">
        Loading editor…
      </div>
    );
  }

  const dirty = !!dirtyMap[activeSection];
  const isSaving = savingSectionId === activeSection;

  // Aa – toggle upper / lower case
  const toggleCase = () => {
    const { state } = editor;
    const { from, to } = state.selection;
    if (from === to) return;
    const selectedText = state.doc.textBetween(from, to, "\n");
    if (!selectedText) return;

    const isAllUpper = selectedText === selectedText.toUpperCase();
    const nextText = isAllUpper
      ? selectedText.toLowerCase()
      : selectedText.toUpperCase();

    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, nextText)
      .run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
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

  const handleSave = async () => {
    if (!onSave) return;
    const html = contents[activeSection] || "";
    await onSave(activeSection, html);

    setDirtyMap((prev) => ({
      ...prev,
      [activeSection]: false,
    }));
  };

  const handleCancel = () => {
    const original = initialBySection[activeSection] || "";
    editor.commands.setContent(original, false);

    setContents((prev) => ({
      ...prev,
      [activeSection]: original,
    }));
    setDirtyMap((prev) => ({
      ...prev,
      [activeSection]: false,
    }));
    onCancel?.();
  };

  return (
    <div className=" rounded-2xl flex flex-col h-[460px] text-[13px] text-gray-100">
      {/* top tabs row */}
        <div className="relative flex items-center justify-between gap-6 text-[14px] px-2">
          {/* base line across all tabs */}
          <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#222222]" />
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              style={{ fontFamily:'Gilroy-Light', cursor:'pointer' }}
              onClick={() => handleChangeSection(s.id)}
              className={`relative pb-1 border-b-[2px] z-[1] ${
                activeSection === s.id
                  ? "border-[#FEEA3B] text-white"
                  : "border-transparent text-gray-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

      {/* editor area – wrapper clickable, but won't interrupt selections */}
      <div
        className="flex-1 px-4 py-3 overflow-auto cursor-text"
        onClick={(e) => {
          if (!editor) return;
          // ⬇️ FIX 2: don't steal clicks/selections that happen inside ProseMirror
          const inProseMirror = e.target.closest(".ProseMirror");
          if (inProseMirror) return;
          editor.chain().focus("end").run();
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* toolbar footer */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleCase}
            className="px-2 py-1 rounded-full hover:bg-white/5"
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
            onClick={toggleBulletList}
            className={`px-2 py-1 rounded-full hover:bg-white/5 ${
              editor.isActive("bulletList") ? "bg-white/10" : ""
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

        {dirty && (
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
              disabled={isSaving}
              className="px-4 py-[6px] rounded-full bg-[#FEEA3B] text-black font-medium disabled:opacity-40 disabled:cursor-default"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
