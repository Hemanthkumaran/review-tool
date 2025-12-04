// src/components/VersionSwitcher.jsx
import React, { useMemo, useState } from "react";

import addVersion from '../assets/svgs/add-version.svg';
import manageVersion from '../assets/svgs/manage-version.svg';
import downloadIcon from '../assets/svgs/download-icon.svg';
import trashIcon from '../assets/svgs/trash-icon.svg';

// Small helpers --------------------------------------------------

function formatDateTime(dt) {
  if (!dt) return "";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(sec) {
  if (!sec && sec !== 0) return "";
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s} min`;
}

// Types expected for each version:
// {
//   _id: string
//   name?: string          // filename / label
//   createdAt?: string
//   durationSeconds?: number
//   thumbnailUrl?: string
//   label?: string         // "v1", "v2", ...
// }

// Main component --------------------------------------------------

export default function VersionSwitcher({
  versions = [],
  currentVersionId,
  onSelectVersion,
  onAddNewVersion,
  onUploadNewVersion,
  onDownloadVersion,
  onDeleteVersion,
}) {
  const [open, setOpen] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const current = useMemo(() => {
    if (!versions.length) return null;
    return (
      versions.find((v) => v._id === currentVersionId) ||
      versions[0]
    );
  }, [versions, currentVersionId]);

  const currentLabel =
    current?.label ||
    (current
      ? `v${versions.findIndex((v) => v._id === current._id) + 1}`
      : "v1");

  // --- basic pill in header ------------------------------------
  return (
    <>
      <div className="relative ml-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer flex items-center gap-1 px-3 py-[6px] rounded-full bg-[#19191C] text-[13px] font-[Gilroy-Regular] text-white border border-white/10 hover:bg-white/10"
        >
          <span>{currentLabel}</span>
          <svg
            className={`w-3 h-3 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {/* Dropdown panel (1st screenshot) */}
        {open && (
          <div className="absolute mt-2 left-0 z-30 w-[360px] rounded-2xl bg-[#050506] border border-[#26262A] shadow-xl overflow-hidden">
            {/* Add new version */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onAddNewVersion && onAddNewVersion();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left"
            >
              <img src={addVersion}/>
              <div style={{ fontFamily:'Gilroy-Light'}} className="text-[14px]">
                Add new version
              </div>
            </button>
              <div style={{height:1, backgroundColor:"#2B2B2B" }}/>
            {/* Versions list */}
            <div className="max-h-[260px] overflow-y-auto">
              {versions.map((v, idx) => {
                const label = v.label || `v${idx + 1}`;
                const duration = formatDuration(v.durationSeconds);
                const dateText = formatDateTime(v.createdAt);
                const meta = [dateText, duration].filter(Boolean).join(" • ");
                const isActive = current && current._id === v._id;

                return (
                  <button
                    key={v._id || idx}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onSelectVersion && onSelectVersion(v);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left cursor-pointer"
                  >
                    <div style={{ fontFamily:'Gilroy-Regular' }} className="text-[14px] w-5 text-gray-300">
                      {label}
                    </div>
                    <div className="w-[72px] h-[48px] rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                      {v.thumbnailUrl ? (
                        <img
                          src={v.thumbnailUrl}
                          alt={v.name || label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#202124]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontFamily:'Gilroy-Regular' }} className="text-[13px] truncate">
                        {v.name || "Version video.mp4"}
                      </div>
                      {meta && (
                        <div className="text-[11px] text-gray-400 mt-[2px]">
                          {meta}
                        </div>
                      )}
                    </div>
                    <div className="pl-2">
                      {isActive ? (
                        <div className="w-5 h-5 rounded-full bg-[#FEEA3B] flex items-center justify-center">
                          <svg
                            viewBox="0 0 16 16"
                            className="w-3 h-3"
                            fill="none"
                          >
                            <path
                              d="M4 8.5L6.5 11L12 5.5"
                              stroke="#000"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/25" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manage versions footer */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowManage(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 border-t border-white/5 hover:bg-white/5 text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {/* tiny sliders icon */}
                <img src={manageVersion}/>
              </div>
              <div style={{ fontFamily:'Gilroy-Light'}} className="text-[14px] cursor-pointer">
                Manage versions
              </div>
            </button>
          </div>
        )}
      </div>

      {showManage && (
        <ManageVersionsModal
          versions={versions}
          currentVersionId={current?._id}
          onClose={() => setShowManage(false)}
          onSelectVersion={(v) => {
            onSelectVersion && onSelectVersion(v);
          }}
          onUploadNewVersion={onUploadNewVersion}
          onDownloadVersion={onDownloadVersion}
          onDeleteVersion={onDeleteVersion}
        />
      )}
    </>
  );
}

// Manage versions modal (2nd screenshot) -------------------------

function ManageVersionsModal({
  versions,
  currentVersionId,
  onClose,
  onSelectVersion,
  onUploadNewVersion,
  onDownloadVersion,
  onDeleteVersion,
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-[600px] max-h-[80vh] bg-[#050506] rounded-[28px] border border-[#26262A] shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="px-7 pt-6 pb-4 flex items-start justify-between">
          <div>
            <div className="text-[20px] font-[Gilroy-Semibold] mb-2">
              Manage versions
            </div>
            <p style={{ fontFamily:'Gilroy-Light' }} className="text-[14px] text-gray-400 max-w-[520px] leading-snug">
              The last uploaded video will be the default version visible in the player. You can delete any old versions to save storage or hide from reviewers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#111215] flex items-center justify-center hover:bg-white/10"
          >
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              stroke="#ffffff"
              strokeWidth="1.4"
            >
              <path d="M4 4L12 12" />
              <path d="M12 4L4 12" />
            </svg>
          </button>
        </div>

        {/* list */}
        <div className="px-7 pb-4 flex-1 overflow-y-auto">
          <div className="space-y-5">
            {versions.map((v, idx) => {
              const label = v.label || `v${idx + 1}`;
              const duration = formatDuration(v.durationSeconds);
              const dateText = formatDateTime(v.createdAt);
              const meta = [dateText, duration].filter(Boolean).join(" • ");
              const isActive = v._id === currentVersionId;

              return (
                <div
                  key={v._id || idx}
                  className="flex items-center gap-4 text-[13px]"
                >
                  <div style={{ fontFamily:'Gilroy-Medium' }} className="text-[14px] w-7">
                    {label}
                  </div>
                  <div className="w-[96px] h-[64px] rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt={v.name || label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#202124]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-[Gilroy-Medium]">
                      {v.name || "Logo introduction video.mp4"}
                    </div>
                    {meta && (
                      <div className="text-[12px] text-gray-400 mt-[2px]">
                        {meta}
                      </div>
                    )}
                  </div>

                  {/* active tick */}
                  <button
                    type="button"
                    onClick={() => onSelectVersion && onSelectVersion(v)}
                    className="mr-2"
                  >
                    {isActive ? (
                      <div className="w-4 h-4 rounded-full bg-[#FEEA3B] flex items-center justify-center">
                        <svg
                          viewBox="0 0 16 16"
                          className="w-3 h-3"
                          fill="none"
                        >
                          <path
                            d="M4 8.5L6.5 11L12 5.5"
                            stroke="#000"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-white/25" />
                    )}
                  </button>

                  {/* download */}
                  <button
                    type="button"
                    onClick={() =>
                      onDownloadVersion && onDownloadVersion(v)
                    }
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded-full"
                  >
                    <img className='cursor-pointer' src={downloadIcon}/>
                  </button>

                  {/* delete */}
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteVersion && onDeleteVersion(v)
                    }
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full"
                  >
                    <img className='cursor-pointer' src={trashIcon}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer buttons */}
        <div className="px-7 pb-6 pt-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex-1 px-6 py-3 rounded-full border border-[#2a2b2e] bg-[#111216] text-gray-100 text-[14px] hover:bg-[#18191d]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onUploadNewVersion && onUploadNewVersion()}
            className="cursor-pointer flex-[1.2] px-6 py-3 rounded-full bg-[#FEEA3B] text-black text-[14px] font-[Gilroy-Medium] hover:bg-[#f7e22c]"
          >
            Upload new version
          </button>
        </div>
      </div>
    </div>
  );
}
