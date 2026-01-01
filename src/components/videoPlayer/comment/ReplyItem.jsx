import { useState } from "react";
import { deleteReplyApi, updateReplyApi } from "../../../services/api";
import ReplyInput from "./ReplyInput";
import { formatRelative } from "../../../helpers/common";

export default function ReplyItem({
  reply,
  projectId,
  versionId,
  commentId,
  onReplyDeleted,
  onReplyUpdated,
  sending,
  handleSubmitReply,
  handleReplyKeyDown,
  setReplyText,
  replyText,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(reply.text);
  const [isHovered, setIsHovered] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <>
      <div
        className="flex gap-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* avatar */}
        <div className="w-9 h-9 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
          <img
            src={reply.user?.avatarUrl}
            alt={reply.user?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* content */}
        <div className="flex-1">
          {!isEditing ? (
            <>
              {/* header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[15px] text-white leading-tight">
                    {reply.user?.name ?? "Unknown"}
                  </div>
                  <div className="text-[12px] text-gray-400">
                    {reply.user?.role ?? ""}
                  </div>
                </div>

                <div className="text-[12px] text-gray-400">
                  {formatRelative(reply.createdAt)}
                </div>
              </div>

              {/* text (SOURCE OF TRUTH) */}
              <div className="mt-2 text-[13px] text-gray-200 whitespace-pre-line">
                {reply.text}
              </div>

              {/* footer */}
              <div className="mt-2 flex items-center justify-between">
                <span
                  onClick={() => setShowReplyBox((v) => !v)}
                  className="cursor-pointer"
                  style={{
                    color: "#BFBFBF",
                    fontSize: 14,
                    fontFamily: "Gilroy-Light",
                  }}
                >
                  Reply
                </span>

                {isHovered && (
                  <div className="flex gap-4 text-gray-400 text-xs">
                    <button
                      className="hover:text-white"
                      onClick={() => {
                        setDraftText(reply.text);
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="hover:text-white"
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
                )}
              </div>
            </>
          ) : (
            <>
              {/* edit mode */}
              <textarea
                className="
                  w-full bg-[#101213] border border-[#1F1F21]
                  rounded-xl p-3 text-[13px]
                  outline-none resize-none
                "
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-3 py-1 rounded-full border border-[#2A2B2F] text-gray-200"
                  onClick={() => {
                    setIsEditing(false);
                    setDraftText(reply.text);
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
                      { text: draftText }
                    );
                    onReplyUpdated(commentId, reply.id, draftText);
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

      {/* reply input */}
      {showReplyBox && (
        <ReplyInput
          value={replyText}
          onChange={setReplyText}
          sending={sending}
          onCancel={() => {
            setShowReplyBox(false);
            setReplyText("");
          }}
          onSubmit={() => {
            handleSubmitReply();
            setShowReplyBox(false);
            setReplyText("");
          }}
          onKeyDown={handleReplyKeyDown}
        />
      )}
    </>
  );
}
