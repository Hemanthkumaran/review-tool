import { useEffect, useMemo, useRef, useState } from "react";

import SegmentedTabs from "../SegmentedTabs";
import CommentCard from "./comment/CommentCard";
import downloadIcon from "../../assets/svgs/download.svg";
import filterIcon from "../../assets/svgs/filter.svg";
import NotesEditor from "../notes/NotesEditor";
import { getUserProfileApi, updateNotesApi } from "../../services/api";
import ToggleButton from "../buttons/ToggleButton";
import { constants } from "../../helpers/enum";
import CommentFilterDropdown from "./CommentFilterDropdown";

export default function CommentsColumn({
  isOpen,
  onToggle,
  markers,
  onSeek,
  projectId,
  projectDetail,
  onAddReply,
  activeVersionId,
  userAccess,
  setMarkers,
  handleSendComment,
  updateCommentResolvedLocal,
  updateCommentLocal,
  deleteCommentLocal,
  videoFps
}) {
  const [activeTab, setActiveTab] = useState("comments");
  const panelWidth = "clamp(380px, 29vw, 450px)";
  const panelTransition = "500ms cubic-bezier(0.22, 1, 0.36, 1)";
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
  const [_notesUpdatedBySection, setNotesUpdatedBySection] = useState({});
  const [savingSectionId, setSavingSectionId] = useState(null);
  const [showResolved, setShowResolved] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [commentFilters, setCommentFilters] = useState([constants.MEMBER, constants.COLLABORATOR, constants.REVIEWER]);
  const [user, setUser] = useState(null);
  const filterBtnRef = useRef(null);
  
  useEffect(() => {
    fetchUserProfile();
  }, [])
    const fetchUserProfile = async () => {
      try {
        // setProfileLoading(true);
        const res = await getUserProfileApi();
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setUser(null);
      } finally {
        // setProfileLoading(false);
      }
    };
const handleCommentUpdated = (commentId, newText) => {
  setMarkers((prev) =>
    prev.map((c) =>
      c.id === commentId ? { ...c, text: newText } : c
    )
  );
};

const handleCommentDeleted = (commentId) => {
  setMarkers((prev) =>
    prev.filter((c) => c.id !== commentId)
  );
};


const handleReplyUpdated = (commentId, replyId, newText) => {
  setMarkers((prev) =>
    prev.map((c) =>
      c.id === commentId
        ? {
            ...c,
            replies: c.replies.map((r) =>
              r.id === replyId ? { ...r, text: newText } : r
            ),
          }
        : c
    )
  );
};

const handleReplyDeleted = (commentId, replyId) => {
  setMarkers((prev) =>
    prev.map((c) =>
      c.id === commentId
        ? {
            ...c,
            replies: c.replies.filter((r) => r.id !== replyId),
          }
        : c
    )
  );
};


const filteredComments = useMemo(() => {
  return markers.filter((c) => {
    if (showResolved && c.isResolved) return false;

    const role = c.user?.role;

    if (role === constants.OWNER) return true;

    let roleType;

    if (role === constants.COLLABORATOR) {
      roleType = constants.COLLABORATOR;
    } else if (role === constants.REVIEWER) {
      roleType = constants.REVIEWER;
    } else {
      roleType = constants.MEMBER;
    }

    return commentFilters.includes(roleType);
  });
}, [markers, showResolved, commentFilters]);


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


  return (
    <div className="relative h-full overflow-visible">
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Collapse comments panel" : "Expand comments panel"}
        aria-expanded={isOpen}
        className={`cursor-pointer z-30 flex items-center justify-center shadow-[0_14px_40px_rgba(0,0,0,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "absolute -left-3 top-24 h-7 w-7 rounded-full border border-[#24262A] bg-[#121314]/95 backdrop-blur-sm hover:bg-[#18191B]"
            : "fixed right-0 top-1/2 h-8 w-9 -translate-y-1/2 rounded-l-full rounded-r-none bg-[var(--brand-color)] text-black"
        }`}
      >
        {isOpen ? (
          <svg
            className="h-3 w-3"
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
            className="h-4 w-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 3L5 8L10 13"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div
        className="h-full overflow-hidden"
        style={{
          width: isOpen ? panelWidth : "0px",
          transition: `width ${panelTransition}`,
        }}
      >
        <div
          className={`h-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-8 opacity-0 pointer-events-none"
          }`}
          style={{ width: panelWidth }}
          aria-hidden={!isOpen}
        >
          <div className="h-full rounded-2xl flex flex-col">
            {/* tabs */}
            <div className="mt-2">
              <SegmentedTabs
                options={
                  userAccess !== constants.REVIEWER ?
                  [{ id: "comments", label: "Comments" }, { id: "notes", label: "Notes" }] :
                  [{ id: "comments", label: "Comments" }]
                }
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* body */}
            <div className="mt-3 flex-1 min-h-0 bg-[#101213] rounded-2xl flex flex-col">
              { activeTab === "comments" ?
              <div className="flex items-center px-2 justify-between gap-2 mb-4 mt-3">
                <div className="px-2 flex items-center">
                    <span>
                      All Comments
                    </span>
                    <img style={{ marginLeft:10 }} src={downloadIcon}/>
                </div>
                <div className=" px-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>Unresolved only</span>
                    <ToggleButton
                      checked={showResolved}
                      onChange={setShowResolved}
                      size="sm"
                    />
                  <div className="relative">
                    <img
                      ref={filterBtnRef}
                      src={filterIcon}
                      className="cursor-pointer"
                      onClick={() => setShowFilter((v) => !v)}
                    />

                    {showFilter && (
                      <CommentFilterDropdown
                        selected={commentFilters}
                        onChange={setCommentFilters}
                        onClose={() => setShowFilter(false)}
                        triggerRef={filterBtnRef}
                      />
                    )}
                  </div>
                </div>
              </div> : null }
              {activeTab === "comments" ? (
                <div className="h-full overflow-y-auto px-2">
                  {filteredComments.length === 0 && (
                    <div className="text-[13px] text-gray-500 mt-6">
                      No comments yet — add one from the comment bar below the
                      video.
                    </div>
                  )}
                  {filteredComments.map((m, idx) => (
                    <CommentCard
                      key={m.id}
                      marker={m}
                      loggedInUser={user}
                      projectId={projectId}
                      index={idx}
                      onGo={() => {
                        const fps = m.fps || projectDetail?.versions?.[0]?.fps || 60;
                        const frame = m.frame;

                        const exactTime = frame / fps;

                        // small offset to ensure correct frame landing
                        const epsilon = 0.000001;
                        
                        onSeek(exactTime + epsilon);
                      }}
                      activeVersionId={activeVersionId}
                      onReplySubmit={(text) =>
                        onAddReply ? onAddReply(m.id, text) : null
                      }
                      handleSendComment={handleSendComment}
                      onCommentUpdated={handleCommentUpdated}
                      updateCommentLocal={updateCommentLocal}
                      deleteCommentLocal={deleteCommentLocal}
                      onCommentDeleted={handleCommentDeleted}
                      onReplyUpdated={handleReplyUpdated}
                      onReplyDeleted={handleReplyDeleted}
                      updateCommentResolvedLocal={updateCommentResolvedLocal}
                      videoFps={videoFps}
                    />
                  ))}
                  <div style={{ height:120 }}/>
                </div>
              ) : (
                  <div className="h-full">
                    <NotesEditor
                      sections={NOTES_SECTIONS}
                      initialBySection={notesBySection}
                      onSave={handleSaveNotesSection}
                      onCancel={() => {}}
                      savingSectionId={savingSectionId}
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
