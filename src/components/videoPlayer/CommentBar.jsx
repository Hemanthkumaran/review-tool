// CommentBar.jsx
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";

import clockIcon from "../../assets/svgs/clock.svg";
import brushIcon from "../../assets/svgs/brush.svg";
import clipIcon from "../../assets/svgs/clip.svg";
import emojiIcon from "../../assets/svgs/emoji.svg";
import micIcon from "../../assets/svgs/mic.svg";
import sendIcon from "../../assets/svgs/send.svg";
import AudienceSelect from "../AudienceSelect";
import { constants } from "../../helpers/enum";
import { formatClockTime, formatClockTime2, formatClockTimeMMSS } from "../../helpers/common";
import Spinner from "../common/Spinner";
import VoicePreviewModal from "../modals/VoicePreviewModal";
import VoiceNotePlayer from "./VoiceNotePlayer";


/**
 * Props:
 *  - currentTime
 *  - isRecording
 *  - hasPendingVoice
 *  - isAnnotating
 *  - hasPendingAnnotation
 *  - onSend({ text, images })
 *  - onStartVoice, onStopVoice, onCancelVoice
 *  - onStartAnnotation, onCancelAnnotation
 */
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
  pauseVideo,
  sendingComment,
  commentInputRef,
  userAccess,
  pendingVoiceUrl
}) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]); // [{ url, name }]
  const fileInputRef = useRef(null);
  const [audience, setAudience] = useState("everyone");
  const [showVoicePreview, setShowVoicePreview] = useState(false);
  
  const emojiBtnRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [emojiPos, setEmojiPos] = useState(null);

  const MAX_RECORD_SECONDS = 180;
  const [recordSeconds, setRecordSeconds] = useState(MAX_RECORD_SECONDS);
  
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

  // recording timer
  // useEffect(() => {
  //   if (!isRecording) {
  //     setRecordSeconds(0);
  //     return;
  //   }

  //   const id = setInterval(() => {
  //     setRecordSeconds((s) => s + 1);
  //   }, 1000);

  //   return () => clearInterval(id);
  // }, [isRecording]);

  useEffect(() => {
  if (!isRecording) {
    setRecordSeconds(MAX_RECORD_SECONDS);
    return;
  }

  const id = setInterval(() => {
    setRecordSeconds((s) => {
      if (s <= 1) {
        onStopVoice?.(); // auto stop
        return 0;
      }
      return s - 1;
    });
  }, 1000);

  return () => clearInterval(id);
}, [isRecording, onStopVoice]);

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
    <div style={{ width: "60%", margin: "0 auto", paddingBottom:20 }}>
      {/* text input */}
      <input
        ref={commentInputRef}
        style={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
        className="bg-[#101213] rounded-2xl border border-[#1F1F21] px-4 py-3 w-full outline-none placeholder-[#58595A] text-sm"
        placeholder="Enter your comments here..."
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
      {/* image previews */}
      {attachments.length > 0 && (
          <div className="bg-[#101213] border-x border-[#1F1F21] px-4 py-2 w-full flex justify-start gap-2 overflow-x-auto">
          {attachments.map((att) => (
            <div
              key={att.url}
              className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-[#1F1F21]"
            >
              <img
                src={att.url}
                alt={att.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-[10px] flex items-center justify-center"
                onClick={() => removeAttachment(att.url)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    {showVoicePreview && (
      <div
        className="
          absolute
          bottom-[70px]
          left-1/2
          -translate-x-1/2
          w-[320px]
          bg-[#111216]
          border border-[#2A2B2E]
          rounded-xl
          px-3 py-2
          shadow-xl
          z-50
        "
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-300">Voice note preview</span>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setShowVoicePreview(false)}
          >
            ✕
          </button>
        </div>
        <VoiceNotePlayer src={pendingVoiceUrl} />
      </div>
    )}
      {/* bottom bar */}
      <div
        style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        className="flex items-center justify-between bg-[#101213] rounded-2xl border border-[#1F1F21] px-4 py-2 w-full text-sm"
      >
        {/* left: time + audience */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-1 py-[3px] rounded-full bg-[#111111] text-[11px]">
            <img src={clockIcon} />
            <span>{formatClockTime2(currentTime)}</span>
          </div>
          <AudienceSelect
            value={audience}
            onChange={setAudience}
            userAccess={userAccess}
          />
        </div>

        {/* right: tools + voice/annotation UI */}
        <div className="flex items-center gap-2">
          {/* annotation button */}
          <button
            className={`p-[6px] rounded-full hover:bg-white/5 ${
              isAnnotating || hasPendingAnnotation ? "bg-white/10" : ""
            }`}
            title={
              hasPendingAnnotation
                ? "Drawing ready"
                : "Add annotation"
            }
            onClick={onStartAnnotation}
          >
            <img src={brushIcon} />
          </button>

          {/* annotation pending chip */}
          {!isRecording && hasPendingAnnotation && (
            <div className="flex items-center gap-2 bg-[#18191b] rounded-full px-3 py-1 text-[11px]">
              <span className="text-gray-200">Drawing ready</span>
              <button
                className="text-gray-400 hover:text-white ml-1"
                onClick={onCancelAnnotation}
                title="Remove drawing"
              >
                ✕
              </button>
            </div>
          )}

          {/* emoji (disabled while recording) */}
          {!isRecording && (
            <div className="relative">
              <button
                ref={emojiBtnRef}
                className="p-[6px] rounded-full hover:bg-white/5"
                onClick={toggleEmoji}
                title="Add emoji"
              >
                <img src={emojiIcon} />
              </button>
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
                    autoFocusSearch={false}
                    onEmojiClick={(emoji) => {
                      setText((v) => v + emoji.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddFiles}
          />
          {!isRecording && (
            <button
              className="p-[6px] rounded-full hover:bg-white/5"
              title="Attach image"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={clipIcon} />
            </button>
          )}

          {/* voice recording / pending UI */}
          {isRecording ? (
            <div className="flex items-center gap-2 bg-[#18191b] rounded-full px-3 py-1 text-[11px]">
              <span className="text-red-500 text-xs">●</span>
              <span className="text-gray-200">
                Recording… {formatClockTimeMMSS(recordSeconds)}
              </span>
              <button
                className="text-[#F87171] hover:underline ml-1"
                onClick={onCancelVoice}
              >
                Cancel
              </button>
              <button
                className="ml-2 px-2 py-[2px] rounded-full bg-[var(--brand-color)] text-black text-[11px] font-medium"
                onClick={onStopVoice}
              >
                Stop
              </button>
            </div>
          ) : (
            hasPendingVoice && (
              <div
                className="flex items-center gap-2 bg-[#18191b] rounded-full px-3 py-1 text-[11px] cursor-pointer"
                onClick={() => setShowVoicePreview(true)}
              >
                <img src={micIcon} className="w-3 h-3 opacity-80" />
                <span className="text-gray-200">Click to play</span>

                <button
                  className="text-gray-400 hover:text-white ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelVoice();
                  }}
                  title="Remove voice note"
                >
                  ✕
                </button>
              </div>
            )
          )}

          {/* mic button (only when not recording) */}
          {!isRecording && (
            <button
              className="p-[6px] rounded-full hover:bg-white/5"
              onClick={toggleMic}
              title="Record voice note"
            >
              <img src={micIcon} />
            </button>
          )}

          {/* Send */}
          <button
            className="w-8 h-8 rounded-full bg-[var(--brand-color)] flex items-center justify-center shadow-sm disabled:opacity-40 disabled:cursor-default"
            onClick={handleSend}
            title="Add comment at current time"
            disabled={disabledSend}
          >
            {sendingComment ? <Spinner size={16} color="#000" /> : <img src={sendIcon} />}
          </button>
        </div>
      </div>
      {/* <VoicePreviewModal
        isOpen={showVoicePreview}
        onClose={() => setShowVoicePreview(false)}
        audioUrl={pendingVoiceUrl}
      /> */}
    </div>
  );
}
