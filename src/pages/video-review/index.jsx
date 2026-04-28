import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import VideoPlayerWithSeekbar from "../../components/videoPlayer/VideoPlayerWithSeekbar";
import CommentBar from "../../components/videoPlayer/CommentBar";
import VideoHeader from "../../components/videoPlayer/VideoHeader";
import CommentsColumn from "../../components/videoPlayer/CommentsColumn";
import VideoUploadPlaceholder from "../../components/videoPlayer/VideoUploadPlaceholder";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addCommentApi, addReplyApi, deleteProjectVersionApi, getOneProjectApi, getVideoUploadUrl, updateCommentApi, updateProjectApi } from "../../services/api";
import AppLoader from "../../components/common/AppLoader";
import { hasAnnotationContent } from "../../helpers/annotation";
import { mapCommentsToMarkers } from "../../helpers/mapCommentsToMarkers";
import { getVideoDuration } from "../../helpers/muxHelpers";
import GuestIdentityModal from "../../components/modals/GuestIdentityModal";
import {
  getAuthToken,
  getGuestIdentity,
  getReviewerPassword,
  setGuestIdentity,
  setReviewerPassword as persistReviewerPassword,
} from "../../helpers/storage.js";
import { constants } from "../../helpers/enum.js";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";
import { PATHS } from "../../routes/paths.jsx";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../helpers/showToast";
import { useProjectUpload } from "../../context/UploadContext.jsx";
import { frameToTime, getFrameSeekTime, normalizeVideoFps, snapTimeToFrame, timeToFrame } from "../../helpers/videoFrames.js";

const REVIEWER_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getValidGuestIdentity = () => {
  const guest = getGuestIdentity();
  const reviewerName = guest?.reviewerName?.trim();
  const reviewerEmail = guest?.reviewerEmail?.trim();

  if (!guest) return null;

  if (!reviewerName || !REVIEWER_EMAIL_REGEX.test(reviewerEmail || "")) {
    setGuestIdentity(null);
    return null;
  }

  return { reviewerName, reviewerEmail };
};

const getFileFromUrl = async (url, index) => {
  try {
    // ✅ DATA URL
    if (url.startsWith("data:")) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], `comment-image-${index + 1}.png`, {
        type: blob.type,
      });
    }

    // ✅ BLOB URL
    if (url.startsWith("blob:")) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], `comment-image-${index + 1}.jpg`, {
        type: blob.type || "image/jpeg",
      });
    }

    // ⚠️ REMOTE URL (CORS risk)
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();

    if (!blob || blob.size === 0) {
      throw new Error("Empty blob");
    }

    return new File([blob], `comment-image-${index + 1}.jpg`, {
      type: blob.type || "image/jpeg",
    });
  } catch (err) {
    console.error("Image conversion failed:", url, err);
    return null;
  }
};

export default function VideoReview() {
  const playerRef = useRef(null);
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [projectDetail, setProjectDetail] = useState(null);

  const [videoSrc, setVideoSrc] = useState(null);

  const [markers, setMarkers] = useState([]);
  const [sendingComment, setSendingComment] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [projectAccess, setProjectAccess] = useState(null);

  // voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVoice, setPendingVoice] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceStartTimeRef = useRef(0);
  const cancelledRef = useRef(false);
  const [timelineSettled, setTimelineSettled] = useState(false);
  const timelineSettleTokenRef = useRef(0);
  const frameDisplayLockRef = useRef(null);
  const playbackStateRef = useRef({
    currentTime: 0,
    duration: 0,
    videoFps: null,
  });
  const isPlayingRef = useRef(false);
  const { projectId } = useParams();
  const { startMuxUpload } = useProjectUpload(projectId);
  const [error, setError] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [reviewerPassword, setReviewerPassword] = useState("");
  const [guestModalStep, setGuestModalStep] = useState("identity");
  const passwordUnlockedProjectRef = useRef(null);
  const commentInputRef = useRef(null);
  const { brandingColor } = useWorkspace();
  const [searchParams] = useSearchParams();
  // annotation draft (from canvas)
  const [pendingAnnotation, setPendingAnnotation] = useState(null); // { time, annotation }
  const annotationStartTimeRef = useRef(0);
  const fileInputRef = useRef(null);
  const rawVersions = projectDetail?.versions || [];
  const isLatestVersion =
    rawVersions.length > 0 &&
    activeVersionId === rawVersions[rawVersions.length - 1]?._id;

  const activeRawVersion = useMemo(() => {
    if (!activeVersionId || !rawVersions?.length) return null;
    return rawVersions.find(v => v._id === activeVersionId) || null;
  }, [activeVersionId, rawVersions]);

const playbackId = activeRawVersion?.muxPlaybackID || null;
const videoFps = normalizeVideoFps(
  activeRawVersion?.fps ??
  activeRawVersion?.videoFps ??
  activeRawVersion?.frameRate
);
playbackStateRef.current = { currentTime, duration, videoFps };
const passwordRequiredFromLink =
  searchParams.get("passwordRequired") === "true";
  
  const currentUser = {
    id: "me",
    name: "John",
    role: "Owner",
    avatarUrl: "https://i.pravatar.cc/40?u=john",
  };

    useEffect(() => {
    if (brandingColor) {
      document.documentElement.style.setProperty(
        "--brand-color",
        brandingColor
      );
    }
  }, [brandingColor]);

  useEffect(() => {
    const storedPwd = getReviewerPassword(projectId);
    const hasUnlockedPasswordThisOpen =
      passwordUnlockedProjectRef.current === projectId;

    setReviewerPassword(
      hasUnlockedPasswordThisOpen ? storedPwd || "" : ""
    );

    const bootstrapReview = async () => {
      if (getAuthToken()) {
        await fetchProject();
        return;
      }

      const storedGuest = getValidGuestIdentity();

      if (passwordRequiredFromLink && !hasUnlockedPasswordThisOpen) {
        persistReviewerPassword(projectId, "");
        setReviewerPassword("");
        setProjectDetail(null);
        setGuestModalStep("password");
        setError("");
        setLoading(false);
        setShowGuestModal(true);
        return;
      }

      if (!storedGuest && !storedPwd) {
        const result = await fetchProject(null, null);

        if (result?.status === "passwordRequired") {
          setGuestModalStep("password");
          setError("");
          setShowGuestModal(true);
          return;
        }

        setGuestModalStep("identity");
        setError("");
        setShowGuestModal(true);
        return;
      }

      const result = await fetchProject(storedGuest, storedPwd);

      if (result?.status === "passwordRequired") {
        persistReviewerPassword(projectId, "");
        setReviewerPassword("");
        setGuestModalStep("password");
        setError("");
        setShowGuestModal(true);
        return;
      }

      if (result?.status === "success" && !storedGuest) {
        setGuestModalStep("identity");
        setError("");
        setShowGuestModal(true);
      }
    };

    bootstrapReview();
  }, [projectId, passwordRequiredFromLink]);

  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

const handleGuestSubmit = async ({ name, email }) => {
  const guestData = {
    reviewerName: name,
    reviewerEmail: email,
  };

  setGuestIdentity(guestData);
  setError("");
  setLoading(true);
  setShowGuestModal(false);
  await fetchProject(guestData, reviewerPassword);
};

const handleGuestModalClose = () => {
  setShowGuestModal(false);
  setError("");
  navigate(PATHS.ROOT, { replace: true });
};

//   useEffect(() => {
//   if (!rawVersions?.length) return;

//   // pick latest version (last item from backend)
//   const latest = rawVersions[rawVersions.length - 1];
//   setActiveVersionId(latest._id);
// }, [rawVersions]);

  useEffect(() => {
    if (!rawVersions?.length) return;

    // Only set if nothing selected yet
    if (!activeVersionId) {
      const latest = rawVersions[rawVersions.length - 1];
      setActiveVersionId(latest._id);
    }
  }, [rawVersions, activeVersionId]);

useEffect(() => {
  if (!projectDetail) {
    setMarkers([]);
    return;
  }
  const version = projectDetail.versions?.find((v) => v._id === activeVersionId)
  
  const backendComments = version?.comments || [];
  const mapped = mapCommentsToMarkers(backendComments);
  
  setMarkers(mapped);
}, [projectDetail, activeVersionId]);

  // Avoid brief "clumped markers" on first mount/refresh while duration + comments hydrate.
  // Single settling gate: hide markers until duration is known and layout had a tick to settle.
  useEffect(() => {
    const token = ++timelineSettleTokenRef.current;
    setTimelineSettled(false);

    const hasDuration = Number.isFinite(duration) && duration > 0;
    if (!hasDuration || !playbackId || !projectDetail) return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (timelineSettleTokenRef.current === token) {
          setTimelineSettled(true);
        }
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [activeVersionId, duration, playbackId, projectDetail, markers.length]);


const handleUpdateProject = async (id, payload) => {
  try {
    await updateProjectApi(id, payload);
    fetchProject();
    showSuccessToast(payload?.status ? "Project status updated" : "Project renamed successfully");
  } catch (err) {
    console.error("Update failed", err);
    showErrorToast(getApiErrorMessage(err, "Failed to update project"));
  }
};



async function handlePasswordSubmit({ password }) {
  setLoading(true);
  setError("");

  const storedGuest = getValidGuestIdentity();
  const result = await fetchProject(storedGuest, password);

  if (result?.status !== "success") {
    persistReviewerPassword(projectId, "");
    setReviewerPassword("");
    setLoading(false);
    setGuestModalStep("password");
    setShowGuestModal(true);
    setError(
      result?.status === "passwordRequired"
        ? "The password entered is wrong."
        : result?.error?.response?.data?.message || "Unable to unlock this link right now."
    );
    return;
  }

  passwordUnlockedProjectRef.current = projectId;
  persistReviewerPassword(projectId, password);
  setReviewerPassword(password);
  setError("");
  setLoading(false);

  if (storedGuest) {
    setShowGuestModal(false);
    return;
  }

  setGuestModalStep("identity");
  setShowGuestModal(true);
}

async function fetchProject(storedGuest = getValidGuestIdentity(), pwd = reviewerPassword || getReviewerPassword(projectId)) {
  const params = {
    ...(storedGuest && {
      reviewerName: storedGuest.reviewerName, // ✅ FIXED
      reviewerEmail: storedGuest.reviewerEmail, // ✅ FIXED
    }),
    ...(pwd && {
      reviewerPassword: pwd, // 🔥 IMPORTANT
    }),
  };

  try {
    const res = await getOneProjectApi(projectId, params);
    const project = res.data.project;

    const permission =
      res.data.permission == "none"
        ? constants.REVIEWER
        : res.data.permission;

    setProjectAccess(permission);

    setProjectDetail(() => {
      const currentVersionStillExists = project.versions?.some(
        (v) => v._id === activeVersionId
      );

      if (!currentVersionStillExists) {
        const latest =
          project.versions?.[project.versions.length - 1];
        if (latest) {
          setActiveVersionId(latest._id);
        }
      }

      return project;
    });

    if (pwd) {
      setReviewerPassword(pwd);
    }

    setLoading(false);
    return { status: "success", data: res.data };
  } catch (err) {
    if (err?.response?.data?.passwordRequired) {
      setError("");
      setLoading(false);
      return { status: "passwordRequired", error: err };
    }

    setLoading(false);
    return { status: "error", error: err };
  }
}





  // called AFTER upload finishes in VideoUploadPlaceholder
  const handleVideoUploaded = (projectData) => {
    setProjectDetail(projectData);

    const latest = projectData?.versions?.[projectData.versions.length - 1];
    if (latest?._id) {
      setActiveVersionId(latest._id);
    }
  };


  // const handleVideoLoaded = (file, url) => {
  //   setLoading(true);
  //   if (videoSrc && videoSrc.startsWith("blob:")) {
  //     URL.revokeObjectURL(videoSrc);
  //   }

  //   setVideoFile(file);
  //   setVideoSrc(url);

  //   setCurrentTime(0);
  //   setDuration(0);
  //   setIsPlaying(false);
  //   setMarkers([]);
  //   setAnnotationMode(false);
  // };

    // VideoReview.jsx (or wherever you render <VideoHeader />)


  const versionsForSwitcher = rawVersions.map((v, index) => ({
    _id: v._id,
    name: v.name || projectDetail.name || `Version ${index + 1}`,
    // if you later store per-version createdAt / duration, plug them in here
    createdAt: v.createdAt || projectDetail.createdAt,
    durationSeconds: v.durationSeconds || projectDetail.durationSeconds,
    // thumbnail from mux if you have it, otherwise leave undefined
    thumbnailUrl: v.thumbnailUrl,
    label: `v${index + 1}`,          // v1, v2, v3…
    // keep original data in case you need it later
    _raw: v,
  }));
  
  const handleChangeVersion = (ver) => {
    setActiveVersionId(ver._id);
  };

  const pauseVideo = () => {
    if (playerRef.current) {
      playerRef.current.pause?.();
    }
    setIsPlaying(false);
  };

  const _addMarker = (partial) => {
    const tempId = "tmp_" + Date.now();
    pauseVideo();
    const marker = {
      id: tempId,
      time: partial.time ?? currentTime,
      type: "text",
      text: "",
      audioUrl: null,
      annotation: null,
      createdAt: new Date(),
      user: currentUser,
      ...partial,
    };
    setMarkers((arr) => [...arr, marker].sort((a, b) => a.time - b.time));
  };

  // const handleTogglePlay = () => {
  //   setIsPlaying((prev) => !prev);
  // };

  const handleTogglePlay = (playing) => {
    isPlayingRef.current = playing;
    if (playing) {
      frameDisplayLockRef.current = null;
    }
    setIsPlaying(playing);
  };

  const handleTimeUpdate = (e) => {
    const t = e?.target?.currentTime ?? playerRef.current?.currentTime ?? 0;
    const displayLock = frameDisplayLockRef.current;
    const playing = isPlayingRef.current;

    if (displayLock) {
      if (!playing && displayLock.expiresAt && Date.now() < displayLock.expiresAt) {
        setCurrentTime(displayLock.time);
        return;
      }

      const mediaFrame = timeToFrame(t, videoFps);
      const frameDelta = mediaFrame - displayLock.frame;

      if (!playing && Math.abs(frameDelta) <= 1) {
        setCurrentTime(displayLock.time);
        return;
      }

      frameDisplayLockRef.current = null;
    }

    setCurrentTime(t);
  };

  const handleLoadedMetadata = (e) => {
    const dur = e?.target?.duration ?? playerRef.current?.duration ?? 0;
    if (dur && !Number.isNaN(dur)) setDuration(dur);
  };

  const handleSeek = (newTime) => {
    const snappedTime = snapTimeToFrame(newTime, videoFps, duration);
    const snappedFrame = timeToFrame(snappedTime, videoFps);
    frameDisplayLockRef.current = {
      frame: snappedFrame,
      time: snappedTime,
      expiresAt: Date.now() + 750,
    };
    if (playerRef.current) {
      playerRef.current.currentTime = getFrameSeekTime(snappedFrame, videoFps, duration);
    }
    setCurrentTime(snappedTime);
  };

  const seekByFrames = useCallback((delta) => {
    const player = playerRef.current;
    const { currentTime: latestCurrentTime, duration: latestDuration, videoFps: latestFps } =
      playbackStateRef.current;
    const safeDuration =
      Number.isFinite(Number(latestDuration)) && Number(latestDuration) > 0
        ? Number(latestDuration)
        : 0;
    const step = Math.trunc(Number(delta));

    if (!player || !safeDuration || !step) return;

    const fps = normalizeVideoFps(latestFps);
    const maxFrame = Math.max(0, timeToFrame(safeDuration, fps));
    const lockedFrame = Number(frameDisplayLockRef.current?.frame);
    const currentFrame = Number.isFinite(lockedFrame)
      ? lockedFrame
      : timeToFrame(latestCurrentTime, fps);
    const targetFrame = Math.min(Math.max(currentFrame + step, 0), maxFrame);
    const targetTime =
      targetFrame >= maxFrame
        ? snapTimeToFrame(safeDuration, fps, safeDuration)
        : frameToTime(targetFrame, fps);

    player.pause?.();
    isPlayingRef.current = false;
    setIsPlaying(false);

    frameDisplayLockRef.current = {
      frame: targetFrame,
      time: targetTime,
      expiresAt: Date.now() + 750,
    };
    player.currentTime = getFrameSeekTime(targetFrame, fps, safeDuration);
    playbackStateRef.current = {
      ...playbackStateRef.current,
      currentTime: targetTime,
    };
    setCurrentTime(targetTime);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        document.activeElement?.isContentEditable;

      if (isTyping) return;

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        e.preventDefault();
        seekByFrames(e.key === "ArrowRight" ? 1 : -1);
        return;
      }

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        commentInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [seekByFrames]);


  const startVoiceRecording = async () => {
    pauseVideo();
    setAnnotationMode(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      showErrorToast("Recording is not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      cancelledRef.current = false;
      voiceStartTimeRef.current = snapTimeToFrame(currentTime, videoFps, duration);
      setPendingVoice(null);

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      mr.onstop = () => {
        setIsRecording(false);

        mr.stream?.getTracks?.().forEach((t) => t.stop());

        if (cancelledRef.current) {
          cancelledRef.current = false;
          chunksRef.current = [];
          return;
        }

        if (!chunksRef.current.length) return;

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        chunksRef.current = [];

        setPendingVoice({
          url,
          startTime: voiceStartTimeRef.current,
        });
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      showErrorToast(getApiErrorMessage(err, "Unable to start recording"));
    }
  };

  const stopVoiceRecording = () => {
    pauseVideo();
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === "inactive") return;
    mediaRecorderRef.current.stop();
  };
  

  const handleStartAnnotation = () => {
    pauseVideo();
    annotationStartTimeRef.current = snapTimeToFrame(currentTime, videoFps, duration);
    setPendingAnnotation(null);
    setAnnotationMode(true);
  };

  const handleCancelVoice = () => {
    pauseVideo();
    if (isRecording && mediaRecorderRef.current) {
      cancelledRef.current = true;
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
    }
    setIsRecording(false);

    if (pendingVoice) {
      URL.revokeObjectURL(pendingVoice.url);
      setPendingVoice(null);
    }
  };

  const handleCancelAnnotation = () => {
    setPendingAnnotation(null);
    setAnnotationMode(false);
  };

  const handleFinishAnnotation = () => {
    setAnnotationMode(false);
  };

  const handleAnnotationDraftChange = (draft) => {
    // draft: null OR { time, annotation }
    setPendingAnnotation(draft);
  };

  // assuming you already have these from earlier work:
  const activeVersion = projectDetail?.versions?.find(
    (v) => v._id === activeVersionId
  );

    const versionId = activeVersion?._id;

    const handleAddReply = async (commentId, text) => {
      const trimmed = text?.trim();
      if (!trimmed || !projectId || !versionId) return;

      try {
        let reviewer = null;

        if (projectAccess == constants.REVIEWER) {
          reviewer = getValidGuestIdentity();
        }
        
        await addReplyApi(
          projectId,
          versionId,
          commentId,
          { text: trimmed },
          reviewer
        );

        fetchProject();

      } catch (err) {
        console.error("Failed to add reply", err);
        showErrorToast(getApiErrorMessage(err, "Failed to add reply"));
      }
    };



  const handleSendComment = async ({ text, images, commentType, isEdit = false, commentId = null, existingMarker = null }) => {
    setSendingComment(true);
    pauseVideo();

    const trimmed = (text || "")?.trim();
    const imageUrls = images || [];

    const hasAnnotation = hasAnnotationContent(pendingAnnotation?.annotation);

    const hasVoice = !!pendingVoice && !!pendingVoice.url;
    const hasTextOrImages = !!trimmed || imageUrls.length > 0;

    // nothing to send
    if (!hasAnnotation && !hasVoice && !hasTextOrImages) {
      setSendingComment(false);
      return;
    }

  const baseTime = snapTimeToFrame(
    isEdit
      ? existingMarker.time
      : hasAnnotation
        ? pendingAnnotation.time ?? currentTime ?? 0
        : hasVoice
          ? pendingVoice.startTime ?? currentTime ?? 0
          : currentTime || 0,
    videoFps,
    duration
  );

  /* ---------- 2) Build FormData for backend ---------- */

  const formData = new FormData();
  formData.append('commentType', commentType);

  const fps = normalizeVideoFps(videoFps);
  const frame = timeToFrame(baseTime, fps);
  const snappedTime = frameToTime(frame, fps);

  if (!isEdit) {
    frameDisplayLockRef.current = {
      frame,
      time: snappedTime,
      expiresAt: Date.now() + 750,
    };
    if (playerRef.current) {
      playerRef.current.currentTime = getFrameSeekTime(frame, fps, duration);
    }
    setCurrentTime(snappedTime);
  }

  formData.append("timeline", snappedTime.toFixed(6));
  formData.append("frame", frame);
          

  if (trimmed) {
    formData.append("text", trimmed);
  }

  if (hasAnnotation) {
    const annotationPayload = pendingAnnotation.annotation;
    formData.append(
      "annotation",
      JSON.stringify(annotationPayload)
    );

    if (!isEdit) {
      setPendingAnnotation(null);
      setAnnotationMode(false);
    }
  }

    // voiceNote: convert object URL -> Blob -> File, force WAV mimetype
    if (hasVoice && pendingVoice.url) {
      try {
        const voiceBlob = await fetch(pendingVoice.url).then((r) => r.blob());

        // Backend only allows wav / x-wav / wave, so we wrap bytes as audio/wav
        const voiceFile = new File([voiceBlob], "voice-note.wav", {
          type: "audio/wav",
        });

        formData.append("voiceNote", voiceFile);
      } catch (err) {
        console.error("Failed to attach voice note file", err);
        showErrorToast("Failed to attach voice note");
        setSendingComment(false);
        return;
      }
    }



  if (imageUrls.length) {
    try {
      const files = await Promise.all(
        imageUrls.map((url, idx) => getFileFromUrl(url, idx))
      );

      files.forEach((file) => {
        if (!file) return;
        formData.append("images", file);
      });

      if (!files.some(Boolean)) {
        showErrorToast("Failed to attach image");
        setSendingComment(false);
        return;
      }
    } catch (err) {
      console.error("Failed to attach images", err);
      showErrorToast("Failed to attach image");
      setSendingComment(false);
      return;
    }
  }

  // images: each URL -> Blob -> File, appended as "images"
  // if (imageUrls.length) {
  //   try {
  //     const blobs = await Promise.all(
  //       imageUrls.map((url) =>
  //         fetch(url)
  //           .then((r) => r.blob())
  //           .catch((err) => {
  //             console.error("Failed to fetch image blob for", url, err);
  //             return null;
  //           })
  //       )
  //     );

  //     blobs.forEach((blob, idx) => {
  //       if (!blob) return;
  //       const imgFile = new File(
  //         [blob],
  //         `comment-image-${idx + 1}.jpg`,
  //         { type: blob.type || "image/jpeg" }
  //       );
  //       formData.append("images", imgFile);
  //     });
  //   } catch (err) {
  //     console.error("Failed to attach images", err);
  //   }
  // }

  
  

  try {
  const projectID = projectDetail._id;
  const versionID = activeVersionId;

  if (!projectID || !versionID) {
    console.warn("Missing projectID or versionID");
    setSendingComment(false);
    return;
  }


  if (isEdit) {
    const res = await updateCommentApi(
      projectID,
      versionID,
      commentId,
      formData
    );
    const backendComment = res.data.comment;
    setProjectDetail(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        versions: prev.versions.map(v => {
          if (v._id !== versionID) return v;

          const updatedComments = [...v.comments, backendComment].sort(
            (a, b) => a.timeline - b.timeline
          );

          return {
            ...v,
            comments: updatedComments
          };
        })
      };
    });
    setSendingComment(false);
  } else {
    let reviewer = null;

    if (projectAccess == constants.REVIEWER) {
      reviewer = getValidGuestIdentity();
    }
    const res = await addCommentApi(projectID, versionID, formData, reviewer);
    const backendComment = res.data.comment;
    setProjectDetail(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        versions: prev.versions.map(v => {
          if (v._id !== versionID) return v;

          const updatedComments = [...v.comments, backendComment].sort(
            (a, b) => a.timeline - b.timeline
          );

          return {
            ...v,
            comments: updatedComments
          };
        })
      };
    });
    setSendingComment(false);
  }
  } catch (err) {
    setSendingComment(false);
    console.error("addComment API failed", err?.response?.data || err);
    showErrorToast(getApiErrorMessage(err, isEdit ? "Failed to update comment" : "Failed to add comment"));
  } finally {
  if (!isEdit) {
    if (hasAnnotation) {
      setPendingAnnotation(null);
      setAnnotationMode(false);
    }
    if (hasVoice) {
      setPendingVoice(null);
    }
  }
}
};

  const deleteCommentLocal = (commentId, versionId) => {
    setProjectDetail(prev => ({
      ...prev,
      versions: prev.versions.map(v => {
        if (v._id !== versionId) return v;
        return {
          ...v,
          comments: v.comments.filter(c => c._id !== commentId)
        };
      })
    }));
  };


  const updateCommentLocal = (commentId, versionId, newText) => {
    setProjectDetail(prev => ({
      ...prev,
      versions: prev.versions.map(v => {
        if (v._id !== versionId) return v;
        return {
          ...v,
          comments: v.comments.map(c =>
            c._id === commentId ? { ...c, text: newText } : c
          )
        };
      })
    }));
  };


  const updateCommentResolvedLocal = (commentId, versionId, isResolved) => {
    setProjectDetail(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        versions: prev.versions.map(v => {
          if (v._id !== versionId) return v;

          return {
            ...v,
            comments: v.comments.map(c =>
              c._id === commentId ? { ...c, isResolved } : c
            )
          };
        })
      };
    });
  };


const handleDeleteVersion = async (version) => {
  try {
    await deleteProjectVersionApi(projectDetail._id, version._id);
    fetchProject();
    showSuccessToast("Version deleted successfully");
  } catch (err) {
    console.error("Delete version failed", err);
    showErrorToast(getApiErrorMessage(err, "Failed to delete version"));
  }
};

const handleNewVersionFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = "";
  const previousVersionId = activeVersionId;

  try {
    const duration = await getVideoDuration(file);
    const uploadRes = await getVideoUploadUrl(projectId, duration, file.name);
    const { muxUploadURL } = uploadRes.data;

    if (!muxUploadURL) {
      throw new Error("Mux upload URL is missing");
    }

    setVideoSrc(null);
    setActiveVersionId(null);

    try {
      const response = await getOneProjectApi(projectId);
      const project = response.data.project;

      setProjectDetail(project);

      const latest =
        project.versions?.[project.versions.length - 1];

      if (latest?._id && latest.muxStatus !== "ready") {
        setActiveVersionId(latest._id);
      }
    } catch (refreshErr) {
      console.warn("Failed to refresh project before version upload", refreshErr);
    }

    await startMuxUpload({
      projectId,
      muxUploadURL,
      file,
      source: "version-upload",
    });
  } catch (err) {
    console.error(err);
    setActiveVersionId(previousVersionId);
    showErrorToast(getApiErrorMessage(err, "Failed to upload new version"));
  }
};

  const hasPendingAnnotation =
    hasAnnotationContent(pendingAnnotation?.annotation);

  const hasPendingVoice =
    !!pendingVoice && !!pendingVoice.url;

    const showVideo =
  activeVersion?.muxStatus === "ready" &&
  !!activeVersion?.muxPlaybackID;


  if (loading) return <AppLoader visible={loading} message="Loading project..." />

  if (showGuestModal) return <GuestIdentityModal
      open={showGuestModal}
      error={error}
      onClose={handleGuestModalClose}
      onContinue={guestModalStep === "password" ? handlePasswordSubmit : handleGuestSubmit}
      step={guestModalStep}
    />


  return (
  <div className="h-[100svh] overflow-hidden bg-[#050506] text-gray-200 font-sans">
  <div className="mx-auto flex h-full w-full max-w-[1760px] flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
  <input
    ref={fileInputRef}
    type="file"
    accept="video/*"
    hidden
    onChange={handleNewVersionFile}
  />

  <VideoHeader
    goBack={() => navigate(-1)}
    fetchProject={fetchProject}
    projectDetail={projectDetail}
    versions={versionsForSwitcher}
    activeVersionId={activeVersionId}
    onChangeVersion={handleChangeVersion}
    handleUpdateProject={handleUpdateProject}
    onAddNewVersion={() => {
      fileInputRef.current?.click();
    }}
    onDeleteVersion={handleDeleteVersion}
    userAccess={projectAccess}
  />

  {/* MAIN LAYOUT */}
  <div
    className="flex flex-1 min-h-0 items-stretch justify-center overflow-hidden"
    style={{
      columnGap: isCommentsOpen ? "2px" : "0px",
      transition:
        "column-gap 500ms cubic-bezier(0.22, 1, 0.36, 1)",
    }}
  >
    {/* ================= COLUMN 1 ================= */}
    <div className="flex min-w-0 flex-1 select-none min-h-0 items-stretch">
      <div
        className="mx-auto flex h-full w-full min-w-0 flex-col"
        style={{
          maxWidth: isCommentsOpen
            ? "min(1240px, calc((100svh - 230px) * 1.78), calc(100vw - clamp(380px, 29vw, 450px) - 48px))"
            : "min(1240px, calc((100svh - 288px) * 1.78))",
          transition: "max-width 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Video container */}
        <div className="relative w-full flex-1 min-h-0 rounded-3xl bg-black">
          {showVideo ? (
            <div className="relative w-full h-full overflow-hidden rounded-3xl">
              <VideoPlayerWithSeekbar
                activeVersionId={activeVersionId}
                projectId={projectId}
                src={playbackId}
                playerRef={playerRef}
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                markers={markers}
                pendingAnnotation={pendingAnnotation}
                annotationMode={annotationMode}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onTogglePlay={handleTogglePlay}
                onSeek={handleSeek}
                onAnnotationDraftChange={handleAnnotationDraftChange}
                onFinishAnnotation={handleFinishAnnotation}
                videoFps={videoFps}
                timelineSettled={timelineSettled}
              />
            </div>
          ) : (
            <VideoUploadPlaceholder
              projectId={projectId}
              onVideoUploaded={handleVideoUploaded}
              muxStatus={activeVersion?.muxStatus}
              userAccess={projectAccess}
            />
        )}
      </div>
      {/* Comment input bar */}
      {!isLatestVersion ? null :
        <CommentBar
          disabled={!isLatestVersion}
          currentTime={currentTime}
          isRecording={isRecording}
          hasPendingVoice={hasPendingVoice}
          pendingVoiceUrl={pendingVoice?.url}
          isAnnotating={annotationMode}
          hasPendingAnnotation={hasPendingAnnotation}
          onSend={handleSendComment}
          onStartVoice={startVoiceRecording}
          onStopVoice={stopVoiceRecording}
          onCancelVoice={handleCancelVoice}
          onStartAnnotation={handleStartAnnotation}
          onCancelAnnotation={handleCancelAnnotation}
          onFinishAnnotation={handleFinishAnnotation}
          pauseVideo={pauseVideo}
          commentInputRef={commentInputRef}
          sendingComment={sendingComment}
          userAccess={projectAccess}
          videoFps={videoFps}
        frame={activeRawVersion.frame}
      />}
      </div>
    </div>

    {/* ================= COLUMN 2 ================= */}
    <div className="select-none relative h-full min-h-0 overflow-visible flex flex-col flex-none">
      <CommentsColumn
        isOpen={isCommentsOpen}
        onToggle={() => setIsCommentsOpen((v) => !v)}
        markers={markers}
        setMarkers={setMarkers}
        currentTime={currentTime}
        onSeek={handleSeek}
        pauseVideo={pauseVideo}
        projectId={projectId}
        projectDetail={projectDetail}
        onAddReply={handleAddReply}
        handleSendComment={handleSendComment}
        activeVersionId={activeVersionId}
        userAccess={projectAccess}
        updateCommentResolvedLocal={updateCommentResolvedLocal}
        updateCommentLocal={updateCommentLocal}
        deleteCommentLocal={deleteCommentLocal}
        videoFps={videoFps}
      />
    </div>
  </div>
  </div>
  </div>
  );
}
