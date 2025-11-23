import React, { useRef } from "react";
import uploadIcon from "../../assets/svgs/upload.svg"; // or whatever icon you have

export default function VideoUploadPlaceholder({ onVideoLoaded }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onVideoLoaded?.(file, url);
  };

  return (
    <div className="bg-[#0b0c0e] rounded-2xl overflow-hidden shadow-lg">
      <div className="p-6 pb-0">
        <div
          className="w-full rounded-xl outline-dashed outline-[#2A2C2D] bg-[#141518] min-h-[420px] flex flex-col items-center justify-center cursor-pointer relative"
          onClick={handleClick}
        >
          {/* hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* inner placeholder content */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center">
              {uploadIcon ? (
                <img src={uploadIcon} alt="Upload" className="w-5 h-5" />
              ) : (
                <span className="text-xl text-gray-300">↑</span>
              )}
            </div>
            <button
              type="button"
              style={{ fontFamily:'Gilroy-Light' }}
              className="underline text-[13px] text-[#D4D4D4]"
            >
              Click to upload
            </button>
          </div>
        </div>
      </div>

      {/* bottom spacing to match player layout */}
      <div className="h-4" />
    </div>
  );
}
