// src/components/comments/CommentCard.jsx
import React, { useState } from "react";
import VoiceNotePlayer from "./VoiceNotePlayer";

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

function ReplyItem({ reply }) {
  const name = reply?.user?.name ?? "John";
  const role = reply?.user?.role ?? "Owner";
  const avatar =
    reply?.user?.avatarUrl ?? "https://i.pravatar.cc/32?u=reply-default";
  const createdAt = reply?.createdAt ? formatRelative(reply.createdAt) : "";

  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between mb-1">
          <div>
            <div className="text-[14px] leading-tight">{name}</div>
            <div className="text-[11px] text-gray-500 leading-tight">
              {role}
            </div>
          </div>
          {createdAt && (
            <div className="text-[11px] text-gray-500">{createdAt}</div>
          )}
        </div>
        <div className="text-[13px] text-gray-200 leading-relaxed whitespace-pre-line">
          {reply?.text}
        </div>
      </div>
    </div>
  );
}

export default function CommentCard({
  marker,
  index,
  onGo,
  onReplySubmit, // (text) => Promise | void
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
          <button className="w-5 h-5 rounded-[5px] border border-white/30 hover:border-white/70" />
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
        {text && <p className="whitespace-pre-line">{text}</p>}

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
              <ReplyItem key={r.id} reply={r} />
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
