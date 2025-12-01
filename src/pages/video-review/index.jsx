// VideoReview.jsx
import React, { useEffect, useRef, useState } from "react";

import VideoPlayerWithSeekbar from "../../components/videoPlayer/VideoPlayerWithSeekbar";
import CommentBar from "../../components/videoPlayer/CommentBar";
import VideoHeader from "../../components/videoPlayer/VideoHeader";
import CommentsColumn from "../../components/videoPlayer/CommentsColumn";
import ShareModal from "../../components/modals/ShareModal";
import VideoUploadPlaceholder from "../../components/videoPlayer/VideoUploadPlaceholder";
import { useLocation, useNavigate } from "react-router-dom";
import { getOneProjectApi } from "../../services/api";

export default function VideoReview() {
  const playerRef = useRef(null);
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [projectDetail, setProjectDetail] = useState(null);

  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

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

  function fetchProject() {
    getOneProjectApi(location.state.projectId).then((res) => {
      console.log(res, "res");
      setProjectDetail(res.data.project);
      setLoading(false);
    });
  }

  const handleVideoLoaded = (file, url) => {
    if (videoSrc && videoSrc.startsWith("blob:")) {
      URL.revokeObjectURL(videoSrc);
    }

    setVideoFile(file);
    setVideoSrc(url);

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setMarkers([]);
    setAnnotationMode(false);
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

  const goToTimeAndPause = (time) => {
    pauseVideo();
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
    setCurrentTime(time);
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

  const handleSendComment = ({ text, images }) => {
    pauseVideo();

    const trimmed = (text || "").trim();
    const imageUrls = images || [];

    const hasAnnotation =
      !!pendingAnnotation &&
      !!pendingAnnotation.annotation &&
      pendingAnnotation.annotation.strokes?.length > 0;

    const hasVoice = !!pendingVoice && !!pendingVoice.url;
    const hasTextOrImages = !!trimmed || imageUrls.length > 0;

    if (!hasAnnotation && !hasVoice && !hasTextOrImages) {
      return;
    }

    const baseTime =
      (hasAnnotation && pendingAnnotation.time) ||
      (hasVoice && pendingVoice.startTime) ||
      currentTime ||
      0;

    // 1) annotation + voice + optional text/images
    if (hasAnnotation && hasVoice) {
      addMarker({
        time: baseTime,
        type: "annotation",
        annotation: pendingAnnotation.annotation,
        audioUrl: pendingVoice.url,
        text: trimmed || "",
        images: imageUrls,
      });

      setPendingAnnotation(null);
      setPendingVoice(null);
      setAnnotationMode(false);
      return;
    }

    // 2) annotation + optional text/images
    if (hasAnnotation) {
      addMarker({
        time: baseTime,
        type: "annotation",
        annotation: pendingAnnotation.annotation,
        text: trimmed || "",
        images: imageUrls,
      });

      setPendingAnnotation(null);
      setAnnotationMode(false);
      return;
    }

    // 3) voice + optional text/images
    if (hasVoice) {
      addMarker({
        time: baseTime,
        type: "voice",
        audioUrl: pendingVoice.url,
        text: trimmed || "",
        images: imageUrls,
      });

      setPendingVoice(null);
      return;
    }

    // 4) text/images only (still anchored to baseTime)
    if (hasTextOrImages) {
      addMarker({
        time: baseTime,
        type: "text",
        text: trimmed,
        images: imageUrls,
      });
    }
  };

  const hasPendingAnnotation =
    !!pendingAnnotation &&
    !!pendingAnnotation.annotation &&
    pendingAnnotation.annotation.strokes?.length > 0;

  const hasPendingVoice =
    !!pendingVoice && !!pendingVoice.url;

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div
      style={{ margin: 25 }}
      className="min-h-screen text-gray-200 font-sans"
    >
      {/* <ShareModal onClose={() => null} /> */}
      <VideoHeader projectDetail={projectDetail} />
      <div className="mx-auto flex">
        {/* Col 1 */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            isCommentsOpen ? "basis-3/4" : "basis-full"
          }`}
        >
          {!videoSrc ? (
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
            <VideoUploadPlaceholder onVideoLoaded={handleVideoLoaded} />
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
          />
        </div>
      </div>
    </div>
  );
}