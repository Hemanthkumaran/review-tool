import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useWorkspace } from "../../context/WorkspaceContext";
import { constants } from "../../helpers/enum";
import FinalLinkPopover from "../DownloadLinkPopover";
import { HeadingIcon, BoldIcon, BulletListIcon, ItalicIcon, LinkIcon } from "../../assets/svgs/SvgComponents";
import { Tooltip } from 'react-tooltip';

const toolbarStyle = {"border":"1px solid #1F1F21","margin":"0px 15px","marginBottom":"15px", "marginRight":"5px","borderRadius":"15px"};

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
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkInitialValue, setLinkInitialValue] = useState("");
const [isEditing, setIsEditing] = useState(false);
const linkSelectionRef = useRef(null);
  const isSwitchingRef = useRef(false);
      const {
        userAccess
      } = useWorkspace();
  // state: content + dirty per section
  const [contents, setContents] = useState(() => {
    const obj = {};
    sections.forEach((s) => {
      obj[s.id] = initialBySection[s.id] || "";
    });
    return obj;
  });
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const editor = useEditor({
    editable: (userAccess == constants.OWNER || userAccess == constants.MEMBER) ? true : false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      })
    ],
    onFocus() {
      setIsEditing(true);
    },
    content: contents[activeSection] || "",
    autofocus: false,
    editorProps: {
      attributes: {
        class: "notes-editor font-[Gilroy] text-[13px]",
      },

      handleClick(view, pos, event) {
        const link = event.target.closest("a");

        if (link) {
          event.preventDefault();

          const href = link.getAttribute("href");

          const { from, to } = view.state.selection;

          linkSelectionRef.current = { from, to };

          setLinkInitialValue(href || "");
          setShowLinkPopover(true);

          return true;
        }

        return false;
      },
    },
    onUpdate({ editor }) {
      if (isSwitchingRef.current) return;

      const current = activeSectionRef.current;
      const html = editor.getHTML();

      setContents((prev) => ({
        ...prev,
        [current]: html,
      }));
    },
  });

  const [, forceUpdate] = useState({});

useEffect(() => {
  if (!editor) return;

  const update = () => {
    forceUpdate({});
  };

  editor.on("selectionUpdate", update);
  editor.on("transaction", update);

  return () => {
    editor.off("selectionUpdate", update);
    editor.off("transaction", update);
  };
}, [editor]);

  // sync with initialBySection (e.g. after fetch)
  useEffect(() => {
    const next = {};
    sections.forEach((s) => {
      next[s.id] = initialBySection[s.id] || "";
    });
    setContents(next);

    if (editor) {
      editor.commands.setContent(next[activeSection] || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBySection, sections, editor]);

  const handleChangeSection = (id) => {
    if (id === activeSection) return;

    isSwitchingRef.current = true;
    setActiveSection(id);

    if (editor) {
      editor.commands.setContent(contents[id] || "", false);
    }

    requestAnimationFrame(() => {
      isSwitchingRef.current = false;
    });
  };


  if (!editor) {
    return (
      <div className="bg-[#050506] rounded-2xl border border-[#202124] h-[460px] flex items-center justify-center text-xs text-gray-400">
        Loading editor…
      </div>
    );
  }

  const isSaving = savingSectionId === activeSection;

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
    .setTextSelection({ from, to })   // 🔥 restore selection
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

const openLinkPopover = () => {
  if (!linkSelectionRef.current) {
    setLinkInitialValue("");
    setShowLinkPopover(true);
    return;
  }

  const { from } = linkSelectionRef.current;

  const node = editor.state.doc.resolve(from);
  const linkMark = node.marks().find((m) => m.type.name === "link");

  const url = linkMark?.attrs?.href || "";

  setLinkInitialValue(url);
  setShowLinkPopover(true);
};

const handleSaveLink = (url) => {
  if (!linkSelectionRef.current) return;

  const { from, to } = linkSelectionRef.current;

  editor.chain().focus().setTextSelection({ from, to }).run();

  if (!url) {
    editor
      .chain()
      .focus()
      .extendMarkRange("link") // important
      .unsetLink()
      .run();

    setShowLinkPopover(false);
    return;
  }

  let formattedUrl = url.trim();

  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = "https://" + formattedUrl;
  }

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: formattedUrl })
    .run();

  setShowLinkPopover(false);
};



const handleSave = async () => {
  if (!onSave) return;

  const html = contents[activeSection] || "";
  await onSave(activeSection, html);

  setIsEditing(false);

  editor.commands.blur();
};

const handleCancel = () => {
  const original = initialBySection[activeSection] || "";
  editor.commands.setContent(original, false);

  setContents((prev) => ({
    ...prev,
    [activeSection]: original,
  }));

  setIsEditing(false);

  editor.commands.blur(); // removes blinking cursor

  onCancel?.();
};
const isBold = editor.isActive("bold");
const isItalic = editor.isActive("italic");
const isBullet = editor.isActive("bulletList");
const isLink = editor.isActive("link");

const { from, to } = editor.state.selection;
const selectedText =
  from !== to
    ? editor.state.doc.textBetween(from, to, "\n")
    : "";

const isUppercase =
  from !== to &&
  selectedText &&
  selectedText === selectedText.toUpperCase();

const FormatButton = ({ children, onClick, active }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();   // preserve selection
      onClick();
    }}
    className={`h-8 min-w-8 px-3 flex items-center justify-center rounded-full transition
      ${active 
        ? "bg-[var(--brand-color)] text-black" 
        : "text-white/70 hover:bg-white/10 hover:text-white"}
    `}
  >
    {children}
  </button>
);

const ToolbarButton = ({
  children,
  onClick,
  active,
  type = "format", // "format" | "action"
  ...props
}) => {
  const handleMouseDown = (e) => {
    if (type === "format") {
      e.preventDefault(); // preserve selection
      onClick?.();
    }
  };

  return (
    <button
      {...props}
      type="button"
      onMouseDown={type === "format" ? handleMouseDown : undefined}
      onClick={type === "action" ? onClick : undefined}
      className={`
        h-8 min-w-8 px-3 flex items-center justify-center 
        rounded-full transition-all duration-150 cursor-pointer
        ${active 
          ? "bg-[var(--brand-color)] text-black" 
          : "text-white/70 hover:bg-white/10 hover:text-white"}
      `}
    >
      {children}
    </button>
  );
};

  return (
    <div className="relative flex flex-col h-full rounded-2xl border border-[#202124] bg-[#050506] overflow-hidden">
      {/* top tabs row */}
        <div className="relative flex items-center justify-around gap-8 px-4 pt-3 text-[14px]">
          {/* bottom divider line */}
          <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-[#1A1A1A]" />

          {sections.map((s) => {
            const active = activeSection === s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleChangeSection(s.id)}
                className={`relative pb-3 text-sm transition-colors ${
                  active ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {s.label}

                {active && (
                  <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[var(--brand-color)] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      <div
        className="flex-1 px-4 py-4 overflow-y-auto"
        onClick={(e) => {
          if (!editor) return;
          const inProseMirror = e.target.closest(".ProseMirror");
          if (inProseMirror) return;
          editor.chain().focus("end").run();
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <FinalLinkPopover
        open={showLinkPopover}
        initialValue={linkInitialValue}
        onClose={() => setShowLinkPopover(false)}
        onSave={handleSaveLink}
        title="Enter link url"
      />
      {/* toolbar footer */}
      {(userAccess == constants.OWNER || userAccess == constants.MEMBER) && (
        <div style={toolbarStyle} className="sticky bottom-0 left-0 right-0 bg-[#050506] px-1 py-3 flex items-center justify-between">
          {/* LEFT TOOLS */}
          <div className="flex items-center gap-2">
            <ToolbarButton 
              type="format" 
              onClick={toggleCase} 
              active={isUppercase}
              data-tooltip-id="editor-tooltip"
              data-tooltip-content="Heading"
            >
            <HeadingIcon />
          </ToolbarButton>
          <ToolbarButton
            type="format"
            onClick={toggleItalic}
            active={isItalic}
            data-tooltip-id="editor-tooltip"
            data-tooltip-content="Italic"
          >
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton 
            type="format" 
            onClick={toggleBold} 
            active={isBold}
            data-tooltip-id="editor-tooltip"
            data-tooltip-content="Bold"
          >
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton 
            type="format" 
            onClick={toggleBulletList} 
            active={isBullet}
            data-tooltip-id="editor-tooltip"
            data-tooltip-content="Bulleted List"
          >
            <BulletListIcon />
          </ToolbarButton>
      <button
        data-tooltip-id="editor-tooltip"
        data-tooltip-content="Link"
        type="button"
        onClick={() => {
          const { from, to } = editor.state.selection;
          linkSelectionRef.current = { from, to };
          openLinkPopover();
        }}
        className={`h-8 min-w-8 px-3 flex items-center justify-center rounded-full transition
          ${isLink
            ? "bg-[var(--brand-color)] text-black"
            : "text-white/70 hover:bg-white/10 hover:text-white"}
        `}
      >
        <LinkIcon />
      </button>
          </div>

          {/* RIGHT ACTIONS */}
          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                style={{ borderRadius:8, fontFamily:'Gilroy-Light', fontSize:14 }}
                className="px-5 py-[6px] cursor-pointer text-sm border border-[#2a2b2e] bg-[#111216] hover:bg-[#18191d] transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ borderRadius:8, fontFamily:'Gilroy-Light', fontSize:14 }}
                className="px-6 py-[6px] bg-[var(--brand-color)] text-black disabled:opacity-40"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      )}
<Tooltip id="editor-tooltip" />
    </div>
  );
}
