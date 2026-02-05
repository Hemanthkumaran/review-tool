// src/components/videoPlayer/VideoUploadPlaceholder.jsx
import React, { useEffect, useRef, useState } from "react";
import { getOneProjectApi, getVideoUploadUrl } from "../../services/api";
import uploadIcon from '../../assets/svgs/upload.svg';
import { constants } from "../../helpers/enum";
import { getVideoDuration } from "../../helpers/muxHelpers";


function UploadFrameLoader({ progress = 0, label = "Uploading" }) {
  const fillWidth = Math.max(progress, 8); // never look empty

  return (
    <div className="w-[260px] h-[120px] rounded-2xl border border-white/10 bg-[#101113] flex items-center justify-center">
      <div className="relative w-[92%] h-[80%] rounded-2xl border border-white/8 bg-[#111214] overflow-hidden">
        {/* left fill */}
        <div
          className="absolute inset-y-0 left-0 bg-[#5e6132]"
          style={{ width: `${fillWidth}%` }}
        />
        {/* centered text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] text-white">{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mux upload helper (same as add-project) ---------- */

function uploadToMux(muxUploadURL, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", muxUploadURL, true);

    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === "function") {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(`Mux upload failed: ${xhr.status} ${xhr.responseText}`)
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error while uploading to Mux"));
    };

    xhr.send(file);
  });
}

export default function VideoUploadPlaceholder({ projectId, onVideoUploaded, muxStatus, userAccess }) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const [error, setError] = useState("");
const showProcessing =
  !isUploading && muxStatus === "waiting";

useEffect(() => {
  if (isUploading) return;

  const interval = setInterval(async () => {
    try {
      const res = await getOneProjectApi(projectId);
      const project = res.data.project;

      const latest = project?.versions?.[project.versions.length - 1];
      
      if (latest?.muxStatus === "ready") {
        onVideoUploaded?.(project);
        clearInterval(interval);
      }
    } catch (e) {
      console.warn("Mux polling failed", e);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [isUploading, projectId]);





  const openFilePicker = () => {
    if (isUploading) return;
    if (!projectId) {
      console.error("VideoUploadPlaceholder: projectId is required");
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };


  const handleFile = async (file) => {
    if (!file) return;

    setError("");
    setIsUploading(true);
    setProgress(0);

    try {
      const duration = await getVideoDuration(file);
      const res = await getVideoUploadUrl(projectId, duration);
      const { muxUploadURL } = res.data || {};

      if (!muxUploadURL) throw new Error("No muxUploadURL returned");

      await uploadToMux(muxUploadURL, file, (pct) => setProgress(pct));

      // await onVideoUploaded?.();
    } catch (err) {
      console.error("Video upload failed", err.response);
      // setError(err.response.error || "Failed to upload video.");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };


  return (
    <>
      {/* Outer video frame – blue border, full width, rounded corners */}
      <div
        className={`relative w-full h-[460px] rounded-3xl overflow-hidden
          ${isDragging ? "ring-2 ring-[#FEEA3B] bg-[#0f1208]" : "bg-[#050608]"}
        `}
        onDragEnter={(e) => {
          e.preventDefault();
          if (userAccess !== constants.REVIEWER) setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (userAccess !== constants.REVIEWER) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (userAccess === constants.REVIEWER) return;

          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("video/")) {
            handleFile(file);
          } else {
            setError("Please drop a video file");
          }
        }}
      >
        {/* Inner dark panel */}
        <div className="absolute inset-[3px] rounded-[22px] bg-[#18191b] flex items-center justify-center">
          {/* Idle vs uploading state */}
          {isUploading ? (
  /* --- UPLOADING: real progress --- */
  <div className="flex flex-col items-center gap-3 select-none">
    <UploadFrameLoader progress={progress} label="Uploading" />
    <div className="text-[11px] text-gray-400">
      Uploading… {progress}%
    </div>
  </div>
) : showProcessing ? (
  /* --- BACKEND PROCESSING --- */
  <div className="flex flex-col items-center gap-3 select-none">
    <UploadFrameLoader progress={100} label="Processing" />
    <div className="text-[11px] text-gray-400">
      Processing video…
    </div>
  </div>
) : (
        <button
          type="button"
          onClick={userAccess !== constants.REVIEWER ? openFilePicker : null}
          className="flex flex-col items-center justify-center gap-3 select-none focus:outline-none"
        >
          <img src={uploadIcon} />
          <span
            style={{ fontFamily: "Gilroy-Light" }}
            className="cursor-pointer text-[14px] text-[#BFBFBF] underline underline-offset-[3px] decoration-gray-500 hover:text-gray-100 hover:decoration-gray-300"
          >
            {isDragging ? "Drop your video here" : "Click to upload"}
          </span>
          {error && (
            <span className="mt-1 text-[11px] text-red-400 max-w-xs text-center">
              {error}
            </span>
          )}
        </button>
      )}

        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
