// VideoReview.jsx
import React, { useEffect, useRef, useState } from "react";

import VideoPlayerWithSeekbar from "../../components/videoPlayer/VideoPlayerWithSeekbar";
import CommentBar from "../../components/videoPlayer/CommentBar";
import VideoHeader from "../../components/videoPlayer/VideoHeader";
import CommentsColumn from "../../components/videoPlayer/CommentsColumn";
import ShareModal from "../../components/modals/ShareModal";
import VideoUploadPlaceholder from "../../components/videoPlayer/VideoUploadPlaceholder";
import { useLocation, useNavigate } from 'react-router-dom';
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

  const [videoSrc, setVideoSrc] = useState(null);   // 🔹 new
  const [videoFile, setVideoFile] = useState(null); // optional if you want the File

  const [markers, setMarkers] = useState([]);
  const [annotationMode, setAnnotationMode] = useState(false);

  // voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVoice, setPendingVoice] = useState(null); // { url, startTime }
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceStartTimeRef = useRef(0);
  const cancelledRef = useRef(false);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const annotationStartTimeRef = useRef(0);
  const currentUser = {
    id: "me",
    name: "John",
    role: "Owner",
    avatarUrl: "https://i.pravatar.cc/40?u=john",
  };

  console.log(location.state.projectId, 'location');
  

   useEffect(() => {
    fetchProject();
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  function fetchProject(params) {
    getOneProjectApi(location.state.projectId)
    .then(res => {
      console.log(res, 'res');
      setProjectDetail(res.data.project);
      setLoading(false);
    })
  }

  const handleVideoLoaded = (file, url) => {
    // revoke old one if any
    if (videoSrc && videoSrc.startsWith("blob:")) {
      URL.revokeObjectURL(videoSrc);
    }

    setVideoFile(file);
    setVideoSrc(url);

    // reset player-related state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setMarkers([]);
    setAnnotationMode(false);
  };

const handleSendComment = ({ text, images }) => {
  const trimmed = text.trim();
  const imageUrls = images || [];

  // 1) annotation + voice + optional text/images
  if (pendingAnnotation && pendingVoice) {
    addMarker({
      time: pendingAnnotation.time ?? pendingVoice.startTime,
      type: "annotation",
      annotation: pendingAnnotation.annotation,
      audioUrl: pendingVoice.url,
      text: trimmed || "",
      images: imageUrls,
    });

    setPendingAnnotation(null);
    setPendingVoice(null);
    return;
  }

  // 2) annotation + optional text/images
  if (pendingAnnotation) {
    addMarker({
      time: pendingAnnotation.time,
      type: "annotation",
      annotation: pendingAnnotation.annotation,
      text: trimmed || "",
      images: imageUrls,
    });

    setPendingAnnotation(null);
    return;
  }

  // 3) voice + optional text/images
  if (pendingVoice) {
    addMarker({
      time: pendingVoice.startTime,
      type: "voice",
      audioUrl: pendingVoice.url,
      text: trimmed || "",
      images: imageUrls,
    });

    setPendingVoice(null);
    return;
  }

  // 4) text/images only
  if (trimmed || imageUrls.length) {
    addMarker({
      type: "text",
      text: trimmed,
      images: imageUrls,
    });
  }
};





  const addMarker = (partial) => {
    const marker = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
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

  /* player callbacks ... (same as you have) */

  const handleTimeUpdate = (e) => {
    const t = e?.target?.currentTime ?? playerRef.current?.currentTime ?? 0;
    setCurrentTime(t);
  };

  const handleLoadedMetadata = (e) => {
    const dur = e?.target?.duration ?? playerRef.current?.duration ?? 0;
    if (dur && !Number.isNaN(dur)) setDuration(dur);
  };

  const togglePlay = () => {
    if (!playerRef.current || !videoSrc) return;   // 🔹 guard if no video yet
    const el = playerRef.current;
    if (isPlaying) {
      el.pause?.();
      setIsPlaying(false);
    } else {
      el.play?.();
      setIsPlaying(true);
    }
  };

  const seekTo = (time) => {
    if (!playerRef.current || !videoSrc) return;   // 🔹 guard
    try {
      playerRef.current.currentTime = time;
      if (typeof playerRef.current.setCurrentTime === "function") {
        playerRef.current.setCurrentTime(time);
      }
    } catch {
      const vid = playerRef.current?.querySelector?.("video");
      if (vid) vid.currentTime = time;
    }
    setCurrentTime(time);
  };
  /* text comments now sent via handleSendComment */

  /* voice recording */

  const startVoiceRecording = async () => {
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
      setPendingVoice(null); // clear any previous pending note

      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      mr.onstop = () => {
        setIsRecording(false);

        // stop tracks
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

        // Do NOT add marker yet – store as pending
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
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === "inactive") return;
    mediaRecorderRef.current.stop();
  };

  // replaces: onStartAnnotation={() => setAnnotationMode(true)}
const handleStartAnnotation = () => {
  annotationStartTimeRef.current = currentTime;
  setPendingAnnotation(null);      // clear old scribble
  setAnnotationMode(true);
};


  const handleCancelVoice = () => {
    // cancel in-progress recording
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

    // clear pending voice note
    if (pendingVoice) {
      URL.revokeObjectURL(pendingVoice.url);
      setPendingVoice(null);
    }
  };


  // store scribble as pending; don't create a marker yet
  const handleAddAnnotation = ({ time, annotation }) => {
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

  console.log(projectDetail, 'pro');
  

  if (loading) {
    return <div>loading...</div>
  }

  return (
    <div
      style={{ margin: 25 }}
      className="min-h-screen text-gray-200 font-sans"
    >
      {/* <ShareModal onClose={() => null} /> */}
      <VideoHeader projectDetail={projectDetail}/>
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
              annotationMode={annotationMode}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onTogglePlay={togglePlay}
              onSeek={seekTo}
              onAddAnnotation={handleAddAnnotation}
            />
          ) : (
            <VideoUploadPlaceholder onVideoLoaded={handleVideoLoaded} />
          )}
          <CommentBar
            currentTime={currentTime}
            isRecording={isRecording}
            hasPendingVoice={!!pendingVoice}
            isAnnotating={annotationMode}              
            hasPendingAnnotation={!!pendingAnnotation} 
            onSend={handleSendComment}
            onStartVoice={startVoiceRecording}
            onStopVoice={stopVoiceRecording}
            onCancelVoice={handleCancelVoice}
            onStartAnnotation={handleStartAnnotation}
            onCancelAnnotation={handleCancelAnnotation}
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
            onSeek={seekTo}
          />
        </div>
      </div>
    </div>
  );
}
