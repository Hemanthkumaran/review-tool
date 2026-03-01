import { useState } from "react";
import { deleteReplyApi, updateReplyApi } from "../../../services/api";
import ReplyInput from "./ReplyInput";
import { formatRelative } from "../../../helpers/common";
import { PenIcon, TrashIcon } from "../../../assets/svgs/SvgComponents";
import { getGuestIdentity } from "../../../helpers/storage";

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
  rawData,
  loggedInUserId
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(reply.text);
  const [isHovered, setIsHovered] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  
  const getInitials = (firstName = "", lastName = "") =>
  `${firstName.trim()[0] || ""}${lastName.trim()[0] || ""}`.toUpperCase();
  
const guest = getGuestIdentity();

const isOwnReply =
  // 🔹 Logged-in owner/admin
  (loggedInUserId &&
    reply?.user?.id &&
    loggedInUserId === reply.user.id) ||

  // 🔹 Guest reviewer (no loggedInUserId)
  (!loggedInUserId &&
    reply?.user?.email &&
    guest?.reviewerEmail === reply.user.email);

    // const isOwnComment = () => {
  
    //   if (loggedInUserId && reply.user?.id) {
    //     return loggedInUserId == reply.user?.id;
    //   }
  
    //   if (loggedInUserId == null || loggedInUserId == undefined) {
    //     return true;
    //   }
  
    // };

    console.log(isOwnReply, 'isOwnComment reply');
    console.log(isOwnReply, 'isOwnComment reply');
    

  return (
    <>
      <div
        className="flex gap-3"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* avatar */}
        {reply.user?.avatarUrl !== null ? 
        <div className="w-9 h-9 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
          <img
            src={reply.user?.avatarUrl}
            alt={reply.user?.name}
            className="w-full h-full object-cover"
          />
        </div> :
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#151618] border border-[#232427] mr-3">
          <div>{getInitials(rawData?.userData.firstName, rawData?.userData.lastName)}</div>
        </button>}
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

                {isHovered && isOwnReply && (
                  <div className="flex gap-4 text-gray-400 text-xs">
                    <button
                      className="hover:text-white cursor-pointer"
                      onClick={() => {
                        setDraftText(reply.text);
                        setIsEditing(true);
                      }}
                    >
                      <PenIcon color="#666666"/>
                    </button>

                    <button
                      className="hover:text-white cursor-pointer"
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
                      <TrashIcon color="#666666"/>
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
