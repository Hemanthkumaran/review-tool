// CommentBar.jsx
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";

import clockIcon from "../../assets/svgs/clock.svg";
import brushIcon from "../../assets/svgs/brush.svg";
import clipIcon from "../../assets/svgs/clip.svg";
import emojiIcon from "../../assets/svgs/emoji.svg";
import micIcon from "../../assets/svgs/mic.svg";
import AudienceSelect from "../AudienceSelect";
import { constants } from "../../helpers/enum";
import { formatClockTime2, formatClockTimeMMSS } from "../../helpers/common";
import Spinner from "../common/Spinner";
import VoiceNotePlayer from "./VoiceNotePlayer";
import { CommentSendIcon } from "../../assets/svgs/SvgComponents";
import { useWorkspace } from "../../context/WorkspaceContext";
import { frameToTime, normalizeVideoFps, timeToFrame } from "../../helpers/videoFrames";

export default function CommentBar({
  currentTime,
  isRecording,
  hasPendingVoice,
  isAnnotating,
  hasPendingAnnotation,
  onSend,
  onStartVoice,
  onStopVoice,
  onCancelVoice,
  onStartAnnotation,
  onCancelAnnotation,
  onFinishAnnotation,
  pauseVideo,
  sendingComment,
  commentInputRef,
  userAccess,
  pendingVoiceUrl,
  videoFps,
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]); // [{ url, name }]
  const fileInputRef = useRef(null);
  const [audience, setAudience] = useState("everyone");
  const [showVoicePreview, setShowVoicePreview] = useState(false);

  const { brandingColor } = useWorkspace();
  
  const emojiBtnRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [emojiPos, setEmojiPos] = useState(null);

  const MAX_RECORD_SECONDS = 180;
  const stopVoiceRef = useRef(onStopVoice);
  const [recordSeconds, setRecordSeconds] = useState(MAX_RECORD_SECONDS);

  const fps = normalizeVideoFps(videoFps);
  const snappedFrame = timeToFrame(currentTime, fps);
  const snappedTime = frameToTime(snappedFrame, fps);

  
  useEffect(() => {
    if (userAccess) {
      setAudience((userAccess == constants.OWNER || userAccess == constants.COLLABORATOR) ? "team only" : "everyone")
    }
  }, [userAccess]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    stopVoiceRef.current = onStopVoice;
  }, [onStopVoice]);

  useEffect(() => {
  if (!isRecording) {
    setRecordSeconds(MAX_RECORD_SECONDS);
    return;
  }

  setRecordSeconds(MAX_RECORD_SECONDS);

  const id = setInterval(() => {
    setRecordSeconds((s) => {
      const next = s - 1;
      if (next <= 0) {
        stopVoiceRef.current?.(); // auto stop
        return 0;
      }
      return next;
    });
  }, 1000);

  return () => clearInterval(id);
}, [isRecording]);

  const toggleEmoji = () => {
    if (!showEmojiPicker) {
      const rect = emojiBtnRef.current.getBoundingClientRect();

      setEmojiPos({
        top: rect.top - 420, // height of picker
        left: rect.left - 280 // adjust so it aligns nicely
      });
    }

    setShowEmojiPicker((v) => !v);
  };

  const handleSend = () => {
    if (isRecording) return;
    
    const trimmed = text.trim();
    const images = attachments.map((a) => a.url);

    if (!trimmed && !hasPendingVoice && images.length === 0 && !hasPendingAnnotation)
      return;

    onSend?.({ text: trimmed, images, commentType: audience });

    setText("");
    setAttachments([]);
  };

  const toggleMic = () => {
    if (isRecording) onStopVoice?.();
    else onStartVoice?.();
  };

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeAttachment = (url) => {
    setAttachments((prev) => {
      const rest = prev.filter((a) => a.url !== url);
      URL.revokeObjectURL(url);
      return rest;
    });
  };

const disabledSend =
sendingComment || 
  isRecording || (
    !text.trim() &&
    !hasPendingVoice &&
    attachments.length === 0 &&
    !hasPendingAnnotation
  );

  return (
   <div className="relative mx-auto w-full max-w-[600px] pb-0 pt-2">
  {/* Keep attachments out of the card height so the single-viewport review layout never clips the send bar. */}
  {attachments.length > 0 && (
    <div className="absolute bottom-full left-0 right-0 z-200 mb-2 rounded-2xl border border-[#1F1F21] bg-[#101213]/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.38)] backdrop-blur-md">
      <div className="flex max-h-[76px] gap-2 overflow-x-auto overflow-y-hidden">
        {attachments.map((att) => (
          <div
            key={att.url}
            className="relative h-16 w-16 flex-none overflow-hidden rounded-xl border border-[#2A2B2F] bg-black/40"
          >
            <img
              src={att.url}
              alt={att.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-[11px] text-white"
              onClick={() => removeAttachment(att.url)}
              aria-label={`Remove ${att.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
  <div className="bg-[#101213] border border-[#1F1F21] rounded-2xl p-3">

    {/* ================= TOP: INPUT + INLINE CHIPS ================= */}
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={commentInputRef}
        className="flex-1 bg-transparent outline-none text-sm placeholder-[#666]"
        placeholder="Add a comment..."
        value={text}
        onFocus={pauseVideo}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      {/* Drawing chip */}
      {hasPendingAnnotation && (
        <div className="flex items-center gap-2 bg-[#18191b] rounded-full px-3 py-1 text-[11px]">
          <span>Annotation ready</span>
          <button className="cursor-pointer" onClick={onCancelAnnotation}>✕</button>
        </div>
      )}

      {/* Voice chip */}
      {hasPendingVoice && !isRecording && (
        <div
          className="flex items-center gap-2 bg-[#18191b] rounded-full px-3 py-1 text-[11px] cursor-pointer"
          onClick={() => setShowVoicePreview(true)}
        >
          <span>Voice ready</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelVoice();
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>

    {/* ================= BOTTOM BAR ================= */}
    <div className="flex items-center justify-between mt-3">

      {/* LEFT: time + audience */}
      <div className="flex items-center gap-2">

        {/* Time chip */}
        <div className="flex items-center gap-1 bg-[#18191b] rounded-full px-3 py-1 text-[11px]">
          <img src={clockIcon} />
          <span>{formatClockTime2(snappedTime, fps)}</span>
          
        </div>

        {/* Audience */}
        <AudienceSelect
          value={audience}
          onChange={setAudience}
          userAccess={userAccess}
        />
      </div>

      {/* RIGHT: grouped actions */}
      <div className="flex items-center gap-2">

        {/* grouped tools */}
        <div className="flex items-center gap-1 bg-[#18191b] rounded-full px-2 py-1">

          {/* annotation */}
          <button
            className={`p-1 rounded-full ${
              isAnnotating || hasPendingAnnotation ? "bg-white/10" : ""
            }`}
            onClick={isAnnotating ? onFinishAnnotation : onStartAnnotation}
            title={isAnnotating ? "Done annotating" : "Add annotation"}
          >
            <img src={brushIcon} />
          </button>

          {/* emoji */}
          {!isRecording && (
            <button
              ref={emojiBtnRef}
              className="p-1 rounded-full hover:bg-white/10"
              onClick={toggleEmoji}
            >
              <img src={emojiIcon} />
            </button>
          )}

          {/* file */}
          {!isRecording && (
            <button
              className="p-1 rounded-full hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={clipIcon} />
            </button>
          )}

          {/* mic */}
          {!isRecording && (
            <button
              className="p-1 rounded-full hover:bg-white/10"
              onClick={toggleMic}
            >
              <img src={micIcon} />
            </button>
          )}
        </div>

        {/* Recording UI */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-[#18191b] rounded-full px-3 py-1 text-[11px]">
            <span className="text-red-500">●</span>
            <span>{formatClockTimeMMSS(recordSeconds)}</span>
            <button onClick={onCancelVoice}>Cancel</button>
            <button onClick={onStopVoice}>Stop</button>
          </div>
        )}

        {/* SEND BUTTON */}
        <button
          className="w-9 h-9 rounded-full bg-[var(--brand-color)] flex items-center justify-center shadow-md disabled:opacity-40"
          onClick={handleSend}
          disabled={disabledSend}
        >
          {sendingComment ? (
            <Spinner size={16} color="#000" />
          ) : (
            <CommentSendIcon color={brandingColor} />
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Emoji picker */}
  {showEmojiPicker && emojiPos && (
    <div
      ref={emojiPickerRef}
      style={{
        position: "fixed",
        top: emojiPos.top,
        left: emojiPos.left,
        zIndex: 9999
      }}
    >
      <EmojiPicker
        theme="dark"
        emojiStyle="native"
        onEmojiClick={(emoji) => {
          setText((v) => v + emoji.emoji);
          setShowEmojiPicker(false);
        }}
      />
    </div>
  )}

  {/* Voice preview */}
  {showVoicePreview && (
    <div style={{ right:0, zIndex:1000 }} className="absolute bottom-full mb-2 w-[90%] max-w-[320px] bg-[#111216] border border-[#2A2B2E] rounded-xl p-3 shadow-xl">
      <div className="flex justify-between mb-2 text-xs text-gray-300">
        Voice note preview
        <button onClick={() => setShowVoicePreview(false)}>✕</button>
      </div>
      <VoiceNotePlayer src={pendingVoiceUrl} />
    </div>
  )}

  {/* hidden input */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    multiple
    className="hidden"
    onChange={handleAddFiles}
  />
</div>
  );
}
