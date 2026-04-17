// src/components/videoPlayer/VideoUploadPlaceholder.jsx
import { useEffect, useRef, useState } from "react";
import { getOneProjectApi, getVideoUploadUrl } from "../../services/api";
import uploadIcon from '../../assets/svgs/upload.svg';
import { constants } from "../../helpers/enum";
import { getVideoDuration } from "../../helpers/muxHelpers";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../helpers/showToast";
import { useProjectUpload } from "../../context/UploadContext";

const POLLABLE_MUX_STATUSES = new Set(["waiting", "preparing", "processing"]);

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

export default function VideoUploadPlaceholder({ projectId, onVideoUploaded, muxStatus, userAccess }) {
  const inputRef = useRef(null);
  const onVideoUploadedRef = useRef(onVideoUploaded);
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const { uploadTask, startMuxUpload, clearUpload } = useProjectUpload(projectId);

  useEffect(() => {
    onVideoUploadedRef.current = onVideoUploaded;
  }, [onVideoUploaded]);

  const isUploading = uploadTask?.status === "uploading";
  const hasUploadError = uploadTask?.status === "error";
  const uploadProgress = isPreparingUpload ? 0 : uploadTask?.progress || 0;
  const isProcessing =
    !hasUploadError &&
    !isPreparingUpload &&
    !isUploading &&
    (
      uploadTask?.status === "processing" ||
      POLLABLE_MUX_STATUSES.has(muxStatus)
    );

  useEffect(() => {
    if (uploadTask?.status !== "error") return;

    const message = uploadTask.error || "Failed to upload video";
    setError(message);
  }, [uploadTask]);

useEffect(() => {
  if (!projectId || isPreparingUpload || isUploading || !isProcessing) return;

  let cancelled = false;

  const pollProject = async () => {
    try {
      const res = await getOneProjectApi(projectId);
      const project = res.data.project;

      const latest = project?.versions?.[project.versions.length - 1];
      
      if (!cancelled && latest?.muxStatus === "ready") {
        onVideoUploadedRef.current?.(project);
        clearUpload(projectId);
        showSuccessToast("Video is ready");
      }
    } catch (e) {
      if (!cancelled) {
        console.warn("Mux polling failed", e);
      }
    }
  };

  pollProject();
  const interval = setInterval(pollProject, 3000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [clearUpload, isPreparingUpload, isProcessing, isUploading, projectId]);





  const openFilePicker = () => {
    if (isPreparingUpload || isUploading || isProcessing) return;
    if (!projectId) {
      console.error("VideoUploadPlaceholder: projectId is required");
      showErrorToast("Project is not ready for upload yet");
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
    setIsPreparingUpload(true);
    try {
      const duration = await getVideoDuration(file);
      const res = await getVideoUploadUrl(projectId, duration, file.name);
      const { muxUploadURL } = res.data || {};

      if (!muxUploadURL) throw new Error("No muxUploadURL returned");

      setIsPreparingUpload(false);
      startMuxUpload({
        projectId,
        muxUploadURL,
        file,
        source: "project-upload",
      }).catch((err) => {
        console.error("Video upload failed", err);
        showErrorToast(getApiErrorMessage(err, "Failed to upload video"));
      });
    } catch (err) {
      console.error("Video upload failed", err.response);
      const message = getApiErrorMessage(err, "Failed to upload video");
      setError(message);
      showErrorToast(message);
    } finally {
      setIsPreparingUpload(false);
    }
  };


  return (
    <>
      {/* Outer video frame – blue border, full width, rounded corners */}
      <div
        className={`relative w-full h-[80vh] rounded-3xl overflow-hidden
          ${isDragging ? "ring-2 ring-[var(--brand-color)] bg-[#0f1208]" : "bg-[#050608]"}
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
            showErrorToast("Please drop a video file");
          }
        }}
      >
        {/* Inner dark panel */}
        <div className="absolute inset-[3px] rounded-[22px] bg-[#18191b] flex items-center justify-center">
          {/* Idle vs uploading state */}
          {(isPreparingUpload || isUploading) ? (
          /* --- UPLOADING: real progress --- */
          <div className="flex flex-col items-center gap-3 select-none">
            <UploadFrameLoader
              progress={uploadProgress}
              label={isPreparingUpload ? "Preparing" : "Uploading"}
            />
            <div className="text-[11px] text-gray-400">
              {isPreparingUpload ? "Preparing upload…" : `Uploading… ${uploadProgress}%`}
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center gap-3 select-none">
            <UploadFrameLoader progress={100} label="Processing" />
            <div className="text-[11px] text-gray-400">
              Upload complete. Processing video…
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
                  className="cursor-pointer text-[14px] text-[#BFBFBF] decoration-gray-500 hover:text-gray-100 hover:decoration-gray-300"
                >
                  {isDragging ? "Drop your video here" : "Click to upload or drag and drop"}
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
