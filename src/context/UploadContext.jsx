/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { uploadToMux } from "../helpers/muxHelpers";

const UploadContext = createContext(null);

const clampProgress = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

function uploadReducer(state, action) {
  const current = state[action.projectId];

  if (
    current &&
    action.uploadId &&
    current.uploadId !== action.uploadId &&
    action.type !== "start"
  ) {
    return state;
  }

  switch (action.type) {
    case "start":
      return {
        ...state,
        [action.projectId]: {
          uploadId: action.uploadId,
          projectId: action.projectId,
          fileName: action.fileName,
          source: action.source,
          status: "uploading",
          progress: 0,
          error: null,
          startedAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

    case "progress":
      if (!current) return state;
      return {
        ...state,
        [action.projectId]: {
          ...current,
          status: "uploading",
          progress: clampProgress(action.progress),
          updatedAt: Date.now(),
        },
      };

    case "processing":
      if (!current) return state;
      return {
        ...state,
        [action.projectId]: {
          ...current,
          status: "processing",
          progress: 100,
          updatedAt: Date.now(),
          uploadedAt: Date.now(),
        },
      };

    case "error":
      return {
        ...state,
        [action.projectId]: {
          ...(current || {}),
          uploadId: action.uploadId,
          projectId: action.projectId,
          status: "error",
          progress: current?.progress || 0,
          error: action.error,
          updatedAt: Date.now(),
        },
      };

    case "clear": {
      if (!current) return state;
      const next = { ...state };
      delete next[action.projectId];
      return next;
    }

    default:
      return state;
  }
}

export function UploadProvider({ children }) {
  const [uploads, dispatch] = useReducer(uploadReducer, {});

  const startMuxUpload = useCallback(async ({
    projectId,
    muxUploadURL,
    file,
    source = "video",
  }) => {
    if (!projectId) {
      throw new Error("Project id is required to track video upload progress");
    }

    if (!muxUploadURL) {
      throw new Error("Mux upload URL is missing");
    }

    if (!file) {
      throw new Error("Video file is missing");
    }

    const uploadId = `${projectId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    dispatch({
      type: "start",
      projectId,
      uploadId,
      fileName: file.name,
      source,
    });

    try {
      await uploadToMux(muxUploadURL, file, (progress) => {
        dispatch({
          type: "progress",
          projectId,
          uploadId,
          progress,
        });
      });

      dispatch({ type: "processing", projectId, uploadId });
      return { uploadId };
    } catch (error) {
      dispatch({
        type: "error",
        projectId,
        uploadId,
        error: error?.message || "Video upload failed",
      });
      throw error;
    }
  }, []);

  const clearUpload = useCallback((projectId) => {
    if (!projectId) return;
    dispatch({ type: "clear", projectId });
  }, []);

  const value = useMemo(
    () => ({
      uploads,
      startMuxUpload,
      clearUpload,
    }),
    [uploads, startMuxUpload, clearUpload]
  );

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploads() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUploads must be used inside UploadProvider");
  }

  return context;
}

export function useProjectUpload(projectId) {
  const { uploads, startMuxUpload, clearUpload } = useUploads();

  return {
    uploadTask: projectId ? uploads[projectId] || null : null,
    startMuxUpload,
    clearUpload,
  };
}
