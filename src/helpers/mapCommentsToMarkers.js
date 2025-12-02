// helpers/mapCommentsToMarkers.js

/**
 * Safely extract a usable URL from backend file objects.
 * Supports:
 *  - string (already a URL)
 *  - { url }, { location }, { signedUrl }
 *  - { key } when key itself is a full http(s) URL
 */
function buildFileUrl(fileLike) {
  if (!fileLike) return undefined;

  // already a URL string
  if (typeof fileLike === "string") return fileLike;

  // typical shapes from backend
  const maybe =
    fileLike.signedUrl ||
    fileLike.url ||
    fileLike.location;

  if (maybe && typeof maybe === "string" && maybe.startsWith("http")) {
    return maybe;
  }

  // if key itself is a full URL (future-proof)
  if (
    fileLike.key &&
    typeof fileLike.key === "string" &&
    fileLike.key.startsWith("http")
  ) {
    return fileLike.key;
  }

  // otherwise we *don't* try to build URLs from keys
  // (backend will give us proper signed URLs)
  return undefined;
}

/**
 * Map backend comments → UI markers used by:
 *  - CustomSeekBar (for markers on the track)
 *  - CommentsColumn / CommentCard
 *  - VideoPlayerWithSeekbar (annotation overlay)
 */
export function mapCommentsToMarkers(comments = []) {
  return comments.map((comment, index) => {
    const time = Number(comment.timeline) || 0;

    // annotation
    let annotationObj = undefined;
    if (comment.annotation) {
      try {
        annotationObj = JSON.parse(comment.annotation);
      } catch (e) {
        console.warn("Failed to parse annotation JSON", e, comment.annotation);
      }
    }

    // voice note
    const audioUrl = buildFileUrl(comment.voiceNote);

    // images
    const imageUrls = (comment.images || [])
      .map((img) => buildFileUrl(img))
      .filter(Boolean);

    // pick type for UI
    let type = "text";
    if (annotationObj && audioUrl) type = "annotation";
    else if (annotationObj) type = "annotation";
    else if (audioUrl) type = "voice";

    return {
      id: comment._id || `c-${index}`,
      time,
      type, // "text" | "voice" | "annotation"
      text: comment.text || "",
      audioUrl,
      annotation: annotationObj,
      images: imageUrls,
      createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
      isResolved: !!comment.isResolved,
      // basic user info (can be replaced when backend sends user object)
      user: {
        id: comment.userID,
        name: "Reviewer",
        role: "Owner",
        avatarUrl: `https://i.pravatar.cc/40?u=${comment.userID || "default"}`,
      },
    };
  });
}
