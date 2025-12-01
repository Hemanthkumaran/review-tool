// CommentCard.jsx
import React from "react";
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
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "Now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export default function CommentCard({ marker, index, onGo }) {
  const { time, type, text, audioUrl, images = [], createdAt, user } = marker;

  const name = user?.name ?? "John";
  const role = user?.role ?? "Owner";
  const avatar = user?.avatarUrl ?? "https://i.pravatar.cc/32?u=john";

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
            <VoiceNotePlayer src={audioUrl} />
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

      {/* footer actions */}
      <div className="flex items-center justify-between text-[12px]">
        <button className="text-gray-400 hover:text-white hover:underline">
          Reply
        </button>
      </div>
    </div>
  );
}