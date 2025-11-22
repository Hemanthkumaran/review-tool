import React, { useState } from "react";

import SegmentedTabs from "../SegmentedTabs";
import CommentCard from "./CommentCard";
import downloadIcon from "../../assets/svgs/download.svg";
import filterIcon from "../../assets/svgs/filter.svg";
import NotesEditor from "../notes/NotesEditor";

function formatClockTime(t = 0) {
  const sec = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  const min = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

export default function CommentsColumn({
  isOpen,
  onToggle,
  markers,
  currentTime,
  onSeek,
}) {
  const [activeTab, setActiveTab] = useState("comments");
const [notesHtml, setNotesHtml] = useState(
  "<p>Transcript (Draft Voiceover):</p><ul><li>Managing workspaces shouldn't be chaos.</li>...</ul>"
);
const [notesUpdatedAt, setNotesUpdatedAt] = useState(new Date());

const handleSaveNotes = (html) => {
  setNotesHtml(html);
  setNotesUpdatedAt(new Date());
  // TODO: also send to API if needed
};

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
            <div className="flex items-center px-2 justify-between gap-2 mb-4">
              <div className="flex items-center">
                  <span>
                      {activeTab === "comments" ? "All Comments" : "All Notes"}
                  </span>
                  <img style={{ marginLeft:10 }} src={downloadIcon}/>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Unresolved</span>
                  <button className="w-8 h-4 rounded-full bg-[#222] flex items-center px-[2px]">
                      <span className="w-3 h-3 rounded-full bg-[#FEEA3B]" />
                  </button>
                  <img style={{ marginLeft:10 }} src={filterIcon}/>
              </div>
            </div>
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
                  />
                ))}
              </>
            ) : (
              <div className="text-[13px] text-gray-500 mt-6">
                <NotesEditor
                  initialHtml={notesHtml}
                  lastUpdated={notesUpdatedAt}
                  onSave={handleSaveNotes}
                  onCancel={() => {}}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
