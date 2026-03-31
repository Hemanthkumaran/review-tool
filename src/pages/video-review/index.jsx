import { useEffect, useMemo, useRef, useState } from "react";

import VideoPlayerWithSeekbar from "../../components/videoPlayer/VideoPlayerWithSeekbar";
import CommentBar from "../../components/videoPlayer/CommentBar";
import VideoHeader from "../../components/videoPlayer/VideoHeader";
import CommentsColumn from "../../components/videoPlayer/CommentsColumn";
import VideoUploadPlaceholder from "../../components/videoPlayer/VideoUploadPlaceholder";
import { useNavigate, useParams } from "react-router-dom";
import { addCommentApi, addReplyApi, deleteProjectVersionApi, getOneProjectApi, getVideoUploadUrl, updateCommentApi, updateProjectApi } from "../../services/api";
import AppLoader from "../../components/common/AppLoader";
import { mapCommentsToMarkers } from "../../helpers/mapCommentsToMarkers";
import { getVideoDuration, uploadToMux } from "../../helpers/muxHelpers";
import GuestIdentityModal from "../../components/modals/GuestIdentityModal";
import { getAuthToken, getGuestIdentity, setGuestIdentity } from "../../helpers/storage.js";
import { constants } from "../../helpers/enum.js";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

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
  const [duration, setDuration] = useState(120);
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
  const { projectId } = useParams();
  const [error, setError] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guest, setGuest] = useState(null);
  const commentInputRef = useRef(null);
  
  const { brandingColor } = useWorkspace();
  console.log(brandingColor, 'brandingColor');
  
  // annotation draft (from canvas)
  const [pendingAnnotation, setPendingAnnotation] = useState(null); // { time, annotation }
  const annotationStartTimeRef = useRef(0);
  const fileInputRef = useRef(null);
  const [uploadPct, setUploadPct] = useState(null); // 0–100
  const [isUploading, setIsUploading] = useState(false);
  const rawVersions = projectDetail?.versions || [];
  const isLatestVersion =
  rawVersions.length > 0 &&
  activeVersionId === rawVersions[rawVersions.length - 1]?._id;

    const activeRawVersion = useMemo(() => {
  if (!activeVersionId || !rawVersions?.length) return null;
  return rawVersions.find(v => v._id === activeVersionId) || null;
}, [activeVersionId, rawVersions]);
const playbackId = activeRawVersion?.muxPlaybackID || null;
const muxStatus = activeRawVersion?.muxStatus;


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
    if (!getAuthToken()) {
      const storedGuest = getGuestIdentity();
      if (storedGuest) {
        fetchProject(storedGuest);
      } else {
        setLoading(false);
        setShowGuestModal(true);
      }
    } else {
      fetchProject(null);
    }

    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  // useEffect(() => {
  //   fetchProject();
  //   return () => {
  //     if (videoSrc && videoSrc.startsWith("blob:")) {
  //       URL.revokeObjectURL(videoSrc);
  //     }
  //   };
  // }, [videoSrc]);

    const handleGuestSubmit = async ({ name, email }) => {
      const guestData = { reviewerName: name, reviewerEmail: email };

      setGuestIdentity(guestData);
      setGuest(guestData);
      setLoading(true);
      setShowGuestModal(false);
      fetchProject(guestData);
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
  const handler = (e) => {
    // Don't steal focus if user is typing
    const tag = document.activeElement?.tagName;
    const isTyping =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      document.activeElement?.isContentEditable;

    if (isTyping) return;

    if (e.key.toLowerCase() === "c") {
      e.preventDefault();
      commentInputRef.current?.focus();
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

  
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

const handleUpdateProject = async (id, payload) => {
  try {
    await updateProjectApi(id, payload);
    fetchProject();
  } catch (err) {
    console.error("Update failed", err);
  }
};



function fetchProject(storedGuest = null) {
  const params = storedGuest
    ? {
        reviewerName: storedGuest.name,
        reviewerEmail: storedGuest.email,
      }
    : {};

  getOneProjectApi(projectId, params).then((res) => {
    const project = res.data.project;
    const permission = res.data.permission == 'none' ? constants.REVIEWER : res.data.permission;
    setProjectAccess(permission);

    setProjectDetail(prev => {
      // preserve current version if exists
      const currentVersionStillExists = project.versions?.some(
        v => v._id === activeVersionId
      );

      if (!currentVersionStillExists) {
        const latest = project.versions?.[project.versions.length - 1];
        if (latest) {
          setActiveVersionId(latest._id);
        }
      }

      return project;
    });

    setLoading(false);
  });
}





  // called AFTER upload finishes in VideoUploadPlaceholder
  const handleVideoUploaded = (projectData) => {
    
    setProjectDetail(projectData);
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

  const addMarker = (partial) => {
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
    setIsPlaying(playing);
  };

  const handleTimeUpdate = (e) => {
    const t = e?.target?.currentTime ?? playerRef.current?.currentTime ?? 0;
    setCurrentTime(t);
  };

  const handleLoadedMetadata = (e) => {
    const dur = e?.target?.duration ?? playerRef.current?.duration ?? 0;
    if (dur && !Number.isNaN(dur)) setDuration(dur);
  };

  const handleSeek = (newTime) => {
    if (playerRef.current) {
      playerRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };


  const startVoiceRecording = async () => {
    pauseVideo();
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Recording not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      cancelledRef.current = false;
      voiceStartTimeRef.current = currentTime;
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
      alert("Unable to start recording");
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
    annotationStartTimeRef.current = currentTime;
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

  // legacy hook-in if ever needed (not used by overlay now, but safe)
  const handleAddAnnotation = ({ time, annotation }) => {
    pauseVideo();
    setPendingAnnotation({
      time: time ?? annotationStartTimeRef.current,
      annotation,
    });
    setAnnotationMode(false);
  };

  const handleCancelAnnotation = () => {
    setPendingAnnotation(null);
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
          reviewer = getGuestIdentity();
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
      }
    };



  const handleSendComment = async ({ text, images, commentType, isEdit = false, commentId = null, existingMarker = null }) => {
    setSendingComment(true);
    pauseVideo();

    const trimmed = (text || "")?.trim();
    const imageUrls = images || [];

    const hasAnnotation =
      !!pendingAnnotation &&
      !!pendingAnnotation.annotation &&
      pendingAnnotation.annotation.strokes?.length > 0;

    const hasVoice = !!pendingVoice && !!pendingVoice.url;
    const hasTextOrImages = !!trimmed || imageUrls.length > 0;

    // nothing to send
    if (!hasAnnotation && !hasVoice && !hasTextOrImages) {
      return;
    }

  const baseTime = isEdit
    ? existingMarker.time           // 👈 reuse original timeline
    : (hasAnnotation && pendingAnnotation.time) ||
      (hasVoice && pendingVoice.startTime) ||
      currentTime ||
      0;

  /* ---------- 2) Build FormData for backend ---------- */

  const formData = new FormData();
  formData.append('commentType', commentType);
  // timeline in seconds (backend expects string)
  formData.append("timeline", baseTime.toFixed(3));

  if (trimmed) {
    formData.append("text", trimmed);
  }

  if (hasAnnotation) {
    // send your strokes structure as JSON
    formData.append(
      "annotation",
      JSON.stringify(pendingAnnotation.annotation)
    );
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
    } catch (err) {
      console.error("Failed to attach images", err);
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
      reviewer = getGuestIdentity();
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
    // TODO: optionally show a toast or mark the local marker as "failed"
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
  } catch (err) {
    console.error("Delete version failed", err);
    alert("Failed to delete version");
  }
};

const handleNewVersionFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = "";

  try {
    setIsUploading(true);
    setUploadPct(0);

    const duration = await getVideoDuration(file);
    const uploadRes = await getVideoUploadUrl(projectId, duration, file.name);
    const { muxUploadURL } = uploadRes.data;

    await uploadToMux(muxUploadURL, file, (pct) => {
      setUploadPct(pct);
    });

    // Upload finished → backend webhook still processing
    setUploadPct(null);
    setIsUploading(false);

    const response = await getOneProjectApi(projectId);
    const project = response.data.project;

    setProjectDetail(project);

    const latest =
      project.versions[project.versions.length - 1];

    setActiveVersionId(latest._id);

    if (latest.muxStatus === "ready") {
      setVideoSrc(latest.muxPlaybackID);
    } else {
      setVideoSrc(null);
    }
  } catch (err) {
    console.error(err);
    setIsUploading(false);
    setUploadPct(null);
  }
};

  const hasPendingAnnotation =
    !!pendingAnnotation &&
    !!pendingAnnotation.annotation &&
    pendingAnnotation.annotation.strokes?.length > 0;

  const hasPendingVoice =
    !!pendingVoice && !!pendingVoice.url;

    const showVideo =
  activeVersion?.muxStatus === "ready" &&
  !!activeVersion?.muxPlaybackID;


  if (loading) return <AppLoader visible={loading} message="Loading project..." />

  if (showGuestModal) return <GuestIdentityModal
      open={showGuestModal}
      error={error}
      onClose={() => setShowGuestModal(false)}
      onContinue={handleGuestSubmit}
    />


  return (
  <div
    style={{ margin: 15 }}
    className="min-h-screen text-gray-200 font-sans"
  >
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
    className={`
      mx-auto grid transition-all duration-300
      ${isCommentsOpen ? "grid-cols-[65%_32%]" : "grid-cols-[100%_0%]"}
    `}
    style={{ height: "calc(100vh - 160px)" }}
  >
    {/* ================= COLUMN 1 ================= */}
    <div className="flex flex-col min-w-0 h-full select-none">
      {/* Video container */}
      <div className="relative w-full flex-1 rounded-3xl bg-black min-h-0">
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
            onAddAnnotation={handleAddAnnotation}
            onCancelAnnotation={handleCancelAnnotation}
            onAnnotationDraftChange={handleAnnotationDraftChange}
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
        pauseVideo={pauseVideo}
        commentInputRef={commentInputRef}
        sendingComment={sendingComment}
        userAccess={projectAccess}
      />}
    </div>

    {/* ================= COLUMN 2 ================= */}
    <div className="select-none relative h-full overflow-hidden flex flex-col">
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
      />
    </div>
  </div>
</div>

  );
}