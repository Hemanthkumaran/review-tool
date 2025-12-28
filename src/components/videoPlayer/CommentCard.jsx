// src/components/comments/CommentCard.jsx
import React, { useState } from "react";
import VoiceNotePlayer from "./VoiceNotePlayer";
import { deleteCommentApi, deleteReplyApi, resolveCommentApi, updateCommentApi, updateReplyApi } from "../../services/api";

function formatClockTime(t = 0) {
  const sec = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  const min = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

function formatRelative(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

function ReplyItem({
  reply,
  projectId,
  versionId,
  commentId,
  onReplyDeleted,
  onReplyUpdated
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(reply.text);

  return (
    <div className="group flex gap-3 relative">
      {/* avatar */}
      <div className="w-9 h-9 rounded-2xl overflow-hidden bg-white/10">
        <img src={reply.user?.avatarUrl} />
      </div>

      <div className="flex-1">
        {!isEditing ? (
          <>
            <div className="text-[13px] text-gray-200 whitespace-pre-line">
              {reply.text}
            </div>

            {/* hover actions */}
            <div className="
              absolute right-0 top-0
              opacity-0 group-hover:opacity-100
              transition flex gap-3 text-gray-400 text-xs
            ">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setText(reply.text);
                }}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  await deleteReplyApi(
                    projectId,
                    versionId,
                    commentId,
                    reply.id
                  );
                  onReplyDeleted(commentId, reply.id);
                }}
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <textarea
              className="
                w-full bg-[#101213] border border-[#1F1F21]
                rounded-xl p-3 text-[13px]
              "
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-3 py-1 rounded-full border"
                onClick={() => {
                  setIsEditing(false);
                  setText(reply.text);
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-1 rounded-full bg-[#F9EF38] text-black"
                onClick={async () => {
                  await updateReplyApi(
                    projectId,
                    versionId,
                    commentId,
                    reply.id,
                    { text }
                  );

onReplyUpdated(commentId, reply.id, text);
                  setIsEditing(false);
                }}
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


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
  onReplyDeleted

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
  const [editedText, setEditedText] = useState(text);

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedReplyText, setEditedReplyText] = useState("");

  
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
    <div className="bg-[#050506] rounded-2xl border border-black px-4 py-3 mb-3 last:mb-0 text-[13px]">
      {/* header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[14px]">
          <span onClick={onGo} className="text-[#F9F046] cursor-pointer">
            {formatClockTime(time)}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span>{formatRelative(createdAt)}</span>
          <label
            className={`
              w-5 h-5 rounded-[5px]
              inline-flex items-center justify-center
              border transition
              cursor-pointer
              ${isResolved
                ? "bg-[#FEEA3B] border-[#FEEA3B]"
                : "border-white/30 hover:border-white/70"}
              ${resolving ? "opacity-50 pointer-events-none" : ""}
            `}
            title={isResolved ? "Mark as unresolved" : "Mark as resolved"}
          >
            <input
              type="checkbox"
              checked={isResolved}
              onChange={handleToggleResolved}
              className="sr-only"
              disabled={resolving}
            />
            {isResolved && (
              <svg
                viewBox="0 0 16 16"
                className="w-3.5 h-3.5"
                fill="none"
              >
                <path
                  d="M3.5 8.5l3 3 6-7"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              )}
            </label>
        </div>
      </div>

      {/* avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-[15px] leading-tight">{name}</div>
          <div className="text-[11px] text-gray-500 leading-tight">
            {role}
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="text-[13px] text-gray-200 leading-relaxed mb-3 space-y-2">
        {/* {text && <p className="whitespace-pre-line">{text}</p>} */}
<div
  className="group relative"
>
  {!isEditingComment ? (
    <>
      <p className="whitespace-pre-line">{text}</p>

      {/* hover actions */}
      <div className="
        absolute right-0 bottom-0
        opacity-0 group-hover:opacity-100
        transition flex gap-3
        text-gray-400
      ">
        <button onClick={() => setShowReplyBox(true)}>Reply</button>
        <button onClick={() => setIsEditingComment(true)}>Edit</button>
        <button
          onClick={async () => {
            await deleteCommentApi(projectId, activeVersionId, marker.id);
            onCommentDeleted(marker.id);
          }}
        >
          Delete
        </button>
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
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-3">
          <button
            className="px-4 py-2 rounded-full border border-[#2A2B2F]"
            onClick={() => {
              setIsEditingComment(false);
              setEditedText(text);
            }}
          >
            Cancel
          </button>

          <button
            className="px-5 py-2 rounded-full bg-[#F9EF38] text-black"
            onClick={async () => {
              await updateCommentApi(
                projectId,
                activeVersionId,
                marker.id,
                { text: editedText }
              );
              
            onCommentUpdated(marker.id, editedText);
            setIsEditingComment(false);
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
      </div>

      {/* replies list */}
      {replies.length > 0 && (
        <div className="mt-3">
          {/* <div className="text-[13px] mb-2">Reply</div> */}
          <div className="mt-3 flex items-center justify-between text-[12px]">
            <button
              style={{ fontFamily:'Gilroy-Light'}}
              className="text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setShowReplyBox((v) => !v)}
            >
              {showReplyBox ? "Close reply" : "Reply"}
            </button>
          </div>
          <div className="border-l border-white/10 pl-4 space-y-4 ml-2 mt-1">
                {replies.map((r) => (
              <ReplyItem
                key={r.id}
                reply={r}
                projectId={projectId}
                versionId={activeVersionId}
                commentId={marker.id}
                onReplyUpdated={onReplyUpdated}
                onReplyDeleted={onReplyDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* reply input */}
      {showReplyBox && (
        <div className="mt-3">
          <textarea
            className="w-full bg-[#101213] border border-[#1F1F21] rounded-2xl px-3 py-2 text-[13px] outline-none placeholder-[#58595A] resize-none min-h-[60px]"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleReplyKeyDown}
          />
          <div className="mt-2 flex justify-end gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setShowReplyBox(false);
                setReplyText("");
              }}
              className="px-3 py-[4px] rounded-full border border-[#2a2b2e] bg-[#111216] text-gray-200 hover:bg-[#18191d]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitReply}
              disabled={sending || !replyText.trim()}
              className="px-4 py-[4px] rounded-full bg-[#FEEA3B] text-black font-medium disabled:opacity-40 disabled:cursor-default"
            >
              {sending ? "Sending…" : "Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
