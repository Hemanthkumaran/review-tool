import { useState } from "react";

import VoiceNotePlayer from "../VoiceNotePlayer";
import { deleteCommentApi, resolveCommentApi } from "../../../services/api";
import { formatClockTime, formatRelative } from "../../../helpers/common";
import ReplyItem from "./ReplyItem";
import CommentHeader from "./CommentHeader";
import CommentUserCard from "./CommentUserCard";
import ReplyInput from "./ReplyInput";
import DeleteCommentModal from "../../modals/DeleteCommentModal";


export default function CommentCard({
  marker,
  index,
  onGo,
  onReplySubmit, // (text) => Promise | void
  projectId,
  activeVersionId,
  onCommentUpdated,
  onCommentDeleted,
  onReplyUpdated,
  onReplyDeleted,
  handleSendComment
}) {
  const {
    time,
    type,
    text,
    audioUrl,
    images = [],
    createdAt,
    user,
    replies = [],
  } = marker;
  
  const name = user?.name ?? "John";
  const role = user?.role ?? "Owner";
  const avatar = user?.avatarUrl ?? "https://i.pravatar.cc/32?u=john";

  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [isResolved, setIsResolved] = useState(!!marker.isResolved);
  const [resolving, setResolving] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  // const [editedText, setEditedText] = useState(text);
  const [draftText, setDraftText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const handleToggleResolved = async () => {
    if (resolving) return;

    const next = !isResolved;
    setIsResolved(next); // optimistic
    setResolving(true);

    try {
      await resolveCommentApi(
        projectId,
        activeVersionId,
        marker.id,
        { isResolved: next }
      );
    } catch (err) {
      console.error("Failed to update resolved state", err);
      setIsResolved(!next); // rollback
    } finally {
      setResolving(false);
    }
  };

  const handleSubmitReply = async () => {
    
    const trimmed = replyText.trim();
    
    if (!trimmed || !onReplySubmit || sending) return;

    try {
      setSending(true);
      await onReplySubmit(trimmed);
      setReplyText("");
      setShowReplyBox(false);
    } catch (e) {
      console.error("Failed to send reply", e);
    } finally {
      setSending(false);
    }
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
  };

  return (
    <div className="group/comment relative  bg-[#050506] rounded-2xl border border-black px-4 py-3 mb-3 last:mb-0 text-[13px]">
      <CommentHeader
        time={time}
        index={index}
        createdAt={createdAt}
        isResolved={isResolved}
        resolving={resolving}
        onGo={onGo}
        onToggleResolved={handleToggleResolved}
        formatClockTime={formatClockTime}
        formatRelative={formatRelative}
      />
      <CommentUserCard avatar={avatar} name={name} role={role}/>
      {/* main content */}
      <div 
        className="text-[13px] text-gray-200 leading-relaxed mb-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isEditingComment ? (
          <>
            <p className="whitespace-pre-line">{marker.text}</p>
            {/* footer row */}
                <div className="mt-3 flex items-center justify-between">
                  {/* Reply */}
                  <div
                    onClick={() => setShowReplyBox((v) => !v)}
                    className="cursor-pointer"
                    style={{
                      color: "#BFBFBF",
                      fontSize: 14,
                      fontFamily: "Gilroy-Light",
                    }}
                  >
                    Reply
                  </div>

                  {/* Edit / Delete */}
                  {!isEditingComment && isHovered && (
                    <div className="flex gap-5 text-[13px] text-gray-400">
                      <button
                        className="hover:text-white cursor-pointer"
                          onClick={() => {
                            setDraftText(marker.text);
                            setIsEditingComment(true);
                          }}
                        >
                        Edit
                      </button>

                      <button
                        className="hover:text-white cursor-pointer"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
            </>
          ) : (
            <>
              {/* EDIT UI (image #2 style) */}
              <div className="bg-[#0F1011] rounded-2xl border border-[#232427] p-4">
                <textarea
                  className="
                    w-full bg-transparent outline-none resize-none
                    text-[14px] text-white min-h-[80px]
                  "
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                />

                <div className="flex justify-end gap-2 mt-3 cursor-pointer">
                  <button
                    className="px-4 py-2 rounded-full border border-[#2A2B2F] cursor-pointer"
                    onClick={() => {
                      setIsEditingComment(false);
                      setDraftText(text);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-5 py-2 rounded-full bg-[#F9EF38] text-black cursor-pointer"
                    onClick={() => {
                      onCommentUpdated(marker.id, draftText);
                      setIsEditingComment(false);
                      handleSendComment({
                        text: draftText,
                        images: marker.images,
                        commentType: marker.commentType,
                        isEdit: true,
                        commentId: marker.id,
                        existingMarker: marker,
                      })  
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {type === "voice" && audioUrl && (
          <div className="mt-1">
            <span className="block mb-1 text-[11px] text-gray-400">
              Voice note
            </span>
            <VoiceNotePlayer src={audioUrl}/>
          </div>
        )}

        {/* images row */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="w-[76px] h-[76px] rounded-2xl overflow-hidden bg-black/40"
              >
                <img
                  src={src}
                  alt={`attachment-${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      {/* replies list */}
      {replies.length > 0 && (
        <div className="mt-3">
          <div className="mt-4 ml-6 relative">
            <div className="absolute left-1 top-0 bottom-0 w-px bg-white/10" />
              <div className="pl-6 space-y-5">
                {replies.map((r) => (
                  <ReplyItem
                    key={r.id}
                    reply={r}
                    projectId={projectId}
                    versionId={activeVersionId}
                    commentId={marker.id}
                    onReplyUpdated={onReplyUpdated}
                    onReplyDeleted={onReplyDeleted}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    sending={sending}
                    handleSubmitReply={handleSubmitReply}
                    handleReplyKeyDown={handleReplyKeyDown}
                  />
                ))}
              </div>
            </div>
        </div>
      )}
      {/* reply input */}
      {showReplyBox && (
        <ReplyInput
          value={replyText}
          sending={sending}
          onChange={setReplyText}
          onCancel={() => {
            setShowReplyBox(false);
            setReplyText("");
          }}
          onSubmit={handleSubmitReply}
          onKeyDown={handleReplyKeyDown}
        /> 
      )}
      <DeleteCommentModal
        open={showDeleteModal}
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          try {
            setDeleting(true);
            await deleteCommentApi(projectId, activeVersionId, marker.id);
            onCommentDeleted(marker.id); // optimistic remove
            setShowDeleteModal(false);
          } catch (err) {
            console.error("Delete comment failed", err);
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
    
  );
}
