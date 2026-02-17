import defaultUser from '../assets/images/default_user.png'

function safeParseAnnotation(raw) {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    console.warn("Failed to parse annotation JSON", e);
    return null;
  }
}

export function mapCommentsToMarkers(comments = [], userLookup = {}) {
  return (comments || []).map((c) => {
    const user = c.userData
      ? {
          id: c.userData._id,
          name: `${c.userData.firstName || ""} ${c.userData.lastName || ""}`.trim(),
          email: c.userData.email || "",
          role: c.userData.role || "Owner", // 🔥 backend-ready
          avatarUrl:
            c.userData.profileImage?.url ||
            null, // 🔥 real S3 image, fallback handled by UI
        }
      : null;

    // Images (already signed URLs)
    const images = (c.images || []).map(
      (img) => img?.url || img?.signedUrl || ""
    );

    // Voice note (signed URL)
    const audioUrl = c.voiceNote?.url || null;

    const annotation = safeParseAnnotation(c.annotation);

    const baseType =
      annotation && audioUrl
        ? "mixed"
        : annotation
        ? "annotation"
        : audioUrl
        ? "voice"
        : "text";

    const replies = (c.replies || []).map((r) => {
      const replyUser =
        r.userData
          ? {
              id: r.userData._id,
              name: `${r.userData.firstName || ""} ${r.userData.lastName || ""}`.trim(),
              email: r.userData.email || "",
              role: r.userData.role || "Owner",
              avatarUrl: r.userData.profileImage?.url || null,
            }
          : userLookup?.[r.userID]
          ? {
              ...userLookup[r.userID],
              avatarUrl:
                userLookup[r.userID]?.profileImage?.url ||
                userLookup[r.userID]?.avatarUrl ||
                null,
            }
          : null;

      return {
        id: r._id,
        text: r.text || "",
        createdAt: r.createdAt ? new Date(r.createdAt) : null,
        user: replyUser,
      };
    });

    return {
      id: c._id,
      time: typeof c.timeline === "number" ? c.timeline : 0,
      type: baseType,
      text: c.text || "",
      audioUrl,
      images,
      annotation,
      createdAt: c.createdAt ? new Date(c.createdAt) : null,
      commentType: c.commentType ?? "everyone",
      user,
      replies,
      isResolved: !!c.isResolved,
      _raw: c, // keep raw
    };
  });
}
