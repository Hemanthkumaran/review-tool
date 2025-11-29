import React, { useRef, useState } from "react";

export default function MuxUploader({ muxUploadURL, onUploaded }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // optional % UI
  const [error, setError] = useState(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(null);
    setUploading(true);

    try {
      // Use XMLHttpRequest so we can track progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", muxUploadURL, true); // or POST (Mux supports both PUT/POST for direct uploads)

        // optional content-type, Mux recommends the file's mime type
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(
              new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`)
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error while uploading to Mux"));
        };

        xhr.send(file);
      });

      setUploading(false);
      setProgress(100);

      // 🔥 IMPORTANT:
      // You *don’t* get playback key directly from this response on the frontend.
      // Your backend (which created the directUpload) should listen to Mux webhooks,
      // then store the asset_id / playback_id and send it back to you via your own API.
      //
      // For now, just notify parent that upload finished:
      onUploaded?.();
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-[#28A5FF] bg-[#141518] min-h-[260px] cursor-pointer relative"
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!uploading && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full border border-[#5C9DFF] flex items-center justify-center">
            <span className="text-xl text-gray-200">↑</span>
          </div>
          <button
            type="button"
            className="underline text-[13px] text-[#D4D4D4]"
          >
            Click to upload
          </button>
        </div>
      )}

      {uploading && (
        <div className="flex flex-col items-center gap-2 text-[13px] text-gray-200">
          <div className="w-40 h-1 rounded-full bg-[#222] overflow-hidden">
            <div
              className="h-full bg-[#FEEA3B] transition-all"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
          <div>{progress ?? 0}% uploading to Mux…</div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-[12px] text-red-400 text-center px-4">
          {error}
        </div>
      )}
    </div>
  );
}
