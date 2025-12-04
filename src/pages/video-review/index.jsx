// VideoReview.jsx
import React, { useEffect, useRef, useState } from "react";

import VideoPlayerWithSeekbar from "../../components/videoPlayer/VideoPlayerWithSeekbar";
import CommentBar from "../../components/videoPlayer/CommentBar";
import VideoHeader from "../../components/videoPlayer/VideoHeader";
import CommentsColumn from "../../components/videoPlayer/CommentsColumn";
import ShareModal from "../../components/modals/ShareModal";
import VideoUploadPlaceholder from "../../components/videoPlayer/VideoUploadPlaceholder";
import { useLocation, useNavigate } from "react-router-dom";
import { addCommentApi, addReplyApi, getOneProjectApi } from "../../services/api";
import AppLoader from "../../components/common/AppLoader";
import { mapCommentsToMarkers } from "../../helpers/mapCommentsToMarkers";

export default function VideoReview() {
  const playerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [projectDetail, setProjectDetail] = useState(null);

  const [videoSrc, setVideoSrc] = useState(null);
  // const [videoFile, setVideoFile] = useState(null);

  const [markers, setMarkers] = useState([]);
  const [annotationMode, setAnnotationMode] = useState(false);

  // voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVoice, setPendingVoice] = useState(null); // { url, startTime }
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceStartTimeRef = useRef(0);
  const cancelledRef = useRef(false);

  // annotation draft (from canvas)
  const [pendingAnnotation, setPendingAnnotation] = useState(null); // { time, annotation }
  const annotationStartTimeRef = useRef(0);

  const currentUser = {
    id: "me",
    name: "John",
    role: "Owner",
    avatarUrl: "https://i.pravatar.cc/40?u=john",
  };

  useEffect(() => {
    fetchProject();
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  
useEffect(() => {
  if (!projectDetail) {
    setMarkers([]);
    return;
  }

  const version =
    // projectDetail.versions?.find((v) => v._id === versionId) ||
    projectDetail.versions?.[0];

  const backendComments = version?.comments || [];
  const mapped = mapCommentsToMarkers(backendComments);

  setMarkers(mapped);
}, [projectDetail]);

  function fetchProject() {
    getOneProjectApi(location.state.projectId).then((res) => {
      console.log(res, "res");
      setProjectDetail(res.data.project);
      if (res.data.project.versions[0]?.muxPlaybackID) {
        setVideoSrc(res.data.project.versions[0].muxPlaybackID);
      }
      setLoading(false);
    });
  }

  // called AFTER upload finishes in VideoUploadPlaceholder
  const handleVideoUploaded = () => {
    console.log('called');
    // playbackUrl – e.g. https://stream.mux.com/<playbackId>.m3u8
    // playbackId   – in case you need to store/use it elsewhere
    fetchProject()
    // setVideoSrc(playbackUrl);
    // setIsPlaying(false);
    // setCurrentTime(0);
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

  const rawVersions = projectDetail?.versions || [];

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

  // optional: keep which version is active in local state
  const [activeVersionId, setActiveVersionId] = useState(
    versionsForSwitcher[0]?._id
  );

  // when user selects a version from the dropdown
  const handleChangeVersion = (ver) => {
    setActiveVersionId(ver._id);
    // if you need the full original version object:
    const original = rawVersions.find((rv) => rv._id === ver._id);
    // update the rest of your UI / player using `original`
  };

  const pauseVideo = () => {
    if (playerRef.current) {
      playerRef.current.pause?.();
    }
    setIsPlaying(false);
  };

  const addMarker = (partial) => {
    pauseVideo();
    const marker = {
      id:
        Date.now().toString(36) + Math.random().toString(36).slice(2),
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

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
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

  // const goToTimeAndPause = (time) => {
  //   pauseVideo();
  //   if (playerRef.current) {
  //     playerRef.current.currentTime = time;
  //   }
  //   setCurrentTime(time);
  // };

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
    const projectId = projectDetail?._id;
    const activeVersion = projectDetail?.versions?.[0]; // or however you pick version
    const versionId = activeVersion?._id;

    // reuse your existing function that refetches project + remaps markers
    // e.g. fetchProjectDetail();

    const handleAddReply = async (commentId, text) => {
      const trimmed = text?.trim();
      if (!trimmed || !projectId || !versionId) return;

      try {
        await addReplyApi(projectId, versionId, commentId, { text: trimmed });
        // refresh project data so replies show up
        fetchProject();
      } catch (err) {
        console.error("Failed to add reply", err);
        // optional: show toast
      }
    };


  const handleSendComment = async ({ text, images }) => {
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

  const baseTime =
    (hasAnnotation && pendingAnnotation.time) ||
    (hasVoice && pendingVoice.startTime) ||
    currentTime ||
    0;

  /* ---------- 1) Update local UI immediately (add marker) ---------- */

  // decide marker type for your local timeline
  let markerType = "text";
  if (hasAnnotation && hasVoice) markerType = "annotation";
  else if (hasAnnotation) markerType = "annotation";
  else if (hasVoice) markerType = "voice";

  const localMarkerPayload = {
    time: baseTime,
    type: markerType,
    text: trimmed || "",
    images: imageUrls,
  };

  if (hasAnnotation) {
    localMarkerPayload.annotation = pendingAnnotation.annotation;
  }
  if (hasVoice) {
    localMarkerPayload.audioUrl = pendingVoice.url;
  }

  // this is your existing helper that updates state
  addMarker(localMarkerPayload);

  /* ---------- 2) Build FormData for backend ---------- */

  const formData = new FormData();

  // timeline in seconds (backend expects string)
  formData.append("timeline", Math.round(baseTime).toString());

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



  // images: each URL -> Blob -> File, appended as "images"
  if (imageUrls.length) {
    try {
      const blobs = await Promise.all(
        imageUrls.map((url) =>
          fetch(url)
            .then((r) => r.blob())
            .catch((err) => {
              console.error("Failed to fetch image blob for", url, err);
              return null;
            })
        )
      );

      blobs.forEach((blob, idx) => {
        if (!blob) return;
        const imgFile = new File(
          [blob],
          `comment-image-${idx + 1}.jpg`,
          { type: blob.type || "image/jpeg" }
        );
        formData.append("images", imgFile);
      });
    } catch (err) {
      console.error("Failed to attach images", err);
    }
  }

  /* ---------- 3) Send to backend ---------- */

  try {
    const projectID = projectDetail._id
    // pick versionID from location or projectDetail – adjust as needed
    const versionID = projectDetail.versions[0]._id

    if (!projectID || !versionID) {
      console.warn("Missing projectID or versionID for addComment");
    } else {
      await addCommentApi(projectID, versionID, formData);
    }
  } catch (err) {
    console.error("addComment API failed", err?.response?.data || err);
    // TODO: optionally show a toast or mark the local marker as "failed"
  } finally {
    /* ---------- 4) Clear pending states ---------- */
    if (hasAnnotation) {
      setPendingAnnotation(null);
      setAnnotationMode(false);
    }
    if (hasVoice) {
      setPendingVoice(null);
    }
  }
};


  const hasPendingAnnotation =
    !!pendingAnnotation &&
    !!pendingAnnotation.annotation &&
    pendingAnnotation.annotation.strokes?.length > 0;

  const hasPendingVoice =
    !!pendingVoice && !!pendingVoice.url;

  if (loading) return <AppLoader visible={loading} message="Loading folders…" />




  return (
    <div
      style={{ margin: 25 }}
      className="min-h-screen text-gray-200 font-sans"
    >
      {/* <ShareModal onClose={() => null} /> */}
      <VideoHeader 
        goBack={() => navigate(-1)}
        projectDetail={projectDetail} 
        versions={versionsForSwitcher}
        project={{ activeVersionId }}
        onChangeVersion={handleChangeVersion}
      />
      <div className="mx-auto flex">
        {/* Col 1 */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            isCommentsOpen ? "basis-3/4" : "basis-full"
          }`}
        >
          {videoSrc ? (
            <VideoPlayerWithSeekbar
              src={videoSrc}
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
          ) : (
            <div style={{ marginRight:10, marginBottom:10 }}>
            <VideoUploadPlaceholder
              projectId={location.state.projectId}
              onVideoUploaded={handleVideoUploaded}
            />
            </div>
          )}
          <CommentBar
            currentTime={currentTime}
            isRecording={isRecording}
            hasPendingVoice={hasPendingVoice}
            isAnnotating={annotationMode}
            hasPendingAnnotation={hasPendingAnnotation}
            onSend={handleSendComment}
            onStartVoice={startVoiceRecording}
            onStopVoice={stopVoiceRecording}
            onCancelVoice={handleCancelVoice}
            onStartAnnotation={handleStartAnnotation}
            onCancelAnnotation={handleCancelAnnotation}
            pauseVideo={pauseVideo}
          />
        </div>
        {/* Col 2 */}
        <div
          className={`relative transition-all duration-300 ${
            isCommentsOpen
              ? "basis-1/4 max-w-[360px]"
              : "basis-[32px] max-w-[32px]"
          }`}
        >
          <CommentsColumn
            isOpen={isCommentsOpen}
            onToggle={() => setIsCommentsOpen((v) => !v)}
            markers={markers}
            currentTime={currentTime}
            onSeek={handleSeek}
            pauseVideo={pauseVideo}
            projectId={location.state.projectId}
            projectDetail={projectDetail}
            onAddReply={handleAddReply}
          />
        </div>
      </div>
    </div>
  );
}