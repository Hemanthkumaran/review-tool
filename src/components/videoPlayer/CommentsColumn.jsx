import React, { useState } from "react";
import Switch from "react-switch";

import SegmentedTabs from "../SegmentedTabs";
import CommentCard from "./CommentCard";
import downloadIcon from "../../assets/svgs/download.svg";
import filterIcon from "../../assets/svgs/filter.svg";
import NotesEditor from "../notes/NotesEditor";
import { updateNotesApi } from "../../services/api";


export default function CommentsColumn({
  isOpen,
  onToggle,
  markers,
  onSeek,
  projectId,
  projectDetail,
  onAddReply
}) {
  const [activeTab, setActiveTab] = useState("comments");
  const NOTES_SECTIONS = [
    { id: "brief", label: "Brief" },
    { id: "script", label: "Script" },
    { id: "references", label: "References" },
    { id: "raw", label: "Raw file" },
  ];
  const [notesBySection, setNotesBySection] = useState({
    brief: projectDetail?.notes?.brief || "",
    script: projectDetail?.notes?.script || "",
    references: projectDetail?.notes?.references || "",
    raw: projectDetail?.notes?.rawFile || "",
  });
  const [notesUpdatedBySection, setNotesUpdatedBySection] = useState({});
  const [savingSectionId, setSavingSectionId] = useState(null);

  // somewhere near the top of the file
const SECTION_FIELD_MAP = {
  brief: "brief",
  script: "script",
  references: "references",
  raw: "rawFile",
};

// keep this name the same – just replace the body
const handleSaveNotesSection = async (sectionId, html) => {
  if (!projectId) return;

  const field = SECTION_FIELD_MAP[sectionId];
  if (!field) {
    console.warn("Unknown notes section:", sectionId);
    return;
  }

  setSavingSectionId(sectionId);

  try {
    // update local state immediately
    setNotesBySection((prev) => ({
      ...prev,
      [sectionId]: html,
    }));

    // build backend payload: { brief: "...html..." } / { rawFile: "...html..." } etc.
    const payload = {
      [field]: html,
    };

    await updateNotesApi(projectId, payload);

    setNotesUpdatedBySection((prev) => ({
      ...prev,
      [sectionId]: new Date(),
    }));
  } catch (err) {
    console.error("Failed to update notes", err);
  } finally {
    setSavingSectionId(null);
  }
};


  // const handleSaveNotesSection = async (sectionId, html) => {
  //   if (!projectId) return;

  //   setSavingSectionId(sectionId);
  //   try {
  //     setNotesBySection((prev) => ({
  //       ...prev,
  //       [sectionId]: html,
  //     }));
  //     console.log(projectId, html);
      
  //     // backend: still using same API you had before
  //     // if you later support per-section, you can add &section=sectionId
  //     await updateNotesApi(projectId, html);

  //     setNotesUpdatedBySection((prev) => ({
  //       ...prev,
  //       [sectionId]: new Date(),
  //     }));
  //   } catch (err) {
  //     console.error("Failed to update notes", err);
  //   } finally {
  //     setSavingSectionId(null);
  //   }
  // };

  return (
    <>
      {/* chevron button overlapping between columns */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#111111] border border-[#242424] shadow flex items-center justify-center hover:bg-white/10 z-20"
      >
        {isOpen ? (
          <svg
            className="w-3 h-3"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 3L11 8L6 13"
              stroke="#E5E7EB"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            className="w-3 h-3"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 3L5 8L10 13"
              stroke="#E5E7EB"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* comments panel – hide content when collapsed */}
      {isOpen && (
        <div className="h-[74vh] rounded-2xl flex flex-col">
          {/* tabs */}
          <div className="mt-2">
            <SegmentedTabs
              options={[
                { id: "comments", label: "Comments" },
                { id: "notes", label: "Notes" },
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* body */}
          <div className="mt-3 px-2 pb-4 pt-2 flex-1 overflow-auto bg-[#101213] rounded-2xl">
            { activeTab === "comments" ?
            <div className="flex items-center px-2 justify-between gap-2 mb-4">
              <div className="flex items-center">
                  <span>
                    All Comments
                  </span>
                  <img style={{ marginLeft:10 }} src={downloadIcon}/>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Unresolved</span>
                  {/* <Switch onColor="#F9F046" width={50} height={25} handleDiameter={1} onHandleColor="#101213" offHandleColor="#101213" checkedIcon={false} uncheckedIcon={false} onChange={(v) => setChecked(v)} checked={checked} /> */}
                  <button className="w-8 h-4 rounded-full bg-[#222] flex items-center px-[2px]">
                      <span className="w-3 h-3 rounded-full bg-[#FEEA3B]" />
                  </button>
                  <img style={{ marginLeft:10 }} src={filterIcon}/>
              </div>
            </div> : null }
            {activeTab === "comments" ? (
              <>
                {markers.length === 0 && (
                  <div className="text-[13px] text-gray-500 mt-6">
                    No comments yet — add one from the comment bar below the
                    video.
                  </div>
                )}
                {markers.map((m, idx) => (
                  <CommentCard
                    key={m.id}
                    marker={m}
                    index={idx}
                    onGo={() => onSeek(m.time)}
                    onReplySubmit={(text) =>
                      onAddReply ? onAddReply(m.id, text) : null
                    }
                  />
                ))}
              </>
            ) : (
              <div className="text-[13px] text-gray-500 mt-2">
                <NotesEditor
                  sections={NOTES_SECTIONS}
                  initialBySection={notesBySection}
                  // lastUpdatedBySection={notesUpdatedBySection}
                  onSave={handleSaveNotesSection}
                  onCancel={() => {}}
                  savingSectionId={savingSectionId}
                  lastUpdatedBySection={{}}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
