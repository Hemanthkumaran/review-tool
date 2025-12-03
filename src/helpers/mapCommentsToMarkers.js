function safeParseAnnotation(raw) {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    console.warn("Failed to parse annotation JSON", e);
    return null;
  }
}

/**
 * comments: array from backend (version.comments)
 * userLookup: optional map { userId: { name, role, avatarUrl } }
 */
export function mapCommentsToMarkers(comments = [], userLookup = {}) {
  return (comments || []).map((c) => {
    const user = userLookup?.[c.userID] || null;

    // images already come as signed URLs from backend.
    const images = (c.images || []).map((img) => img.url || img.signedUrl || "");

    // voice note as signed URL
    const audioUrl = c.voiceNote?.url || null;

    const annotation = safeParseAnnotation(c.annotation);
    const baseType = annotation
      ? "annotation"
      : audioUrl
      ? "voice"
      : "text";

    const replies = (c.replies || []).map((r) => ({
      id: r._id,
      text: r.text || "",
      createdAt: r.createdAt ? new Date(r.createdAt) : null,
      user: userLookup?.[r.userID] || null,
    }));

    return {
      id: c._id,
      time: typeof c.timeline === "number" ? c.timeline : 0,
      type: baseType,
      text: c.text || "",
      audioUrl,
      images,
      annotation,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
      user,
      replies,
      // keep raw comment if you ever need more fields
      _raw: c,
    };
  });
}
