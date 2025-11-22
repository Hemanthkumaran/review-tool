import axiosClient from "./axiosClient";

export const signupApi = (data) => {
  return axiosClient.post(`/user/signup`, data);
};

export const signinApi = (data) => {
  return axiosClient.post(`/user/login`, data);
};

export const forgotPasswordApi = (data) => {
  return axiosClient.post(`/user/forgotPassword`, data);
};

export const verifyResetCodeApi = (data) => {
  return axiosClient.post(`/user/verifyResetPassword`, data);
};

export const resetForgotPasswordApi = (data) => {
  return axiosClient.post(`/user/resetPassword`, data);
};

export const emailVerificationApi = (data) => {
  return axiosClient.post(`/user/verifyEmail`, data);
};

export const resendEmailVerificationApi = () => {
  return axiosClient.get(`/user/resendEmailVerification`);
};

export const createWorkspaceApi = (data) => {
  return axiosClient.post(`/user/addWorkspace`, data);
};

export async function saveComment(payload) {
  // payload: { videoId, time, text, annotations, audioUrl }
  const res = await axiosClient.post("/comments", payload);
  return res.data;
}

// Upload audio blob; backend should return a public URL after upload
export async function uploadVoiceNote(blob, { filename = "voice.webm" } = {}) {
  // Recommended: your backend should return a presigned URL to upload the file,
  // or accept multipart/form-data to receive and store it.
  // Example here: send form-data directly to /upload-audio
  const fd = new FormData();
  fd.append("file", blob, filename);

  const res = await axiosClient.post("/upload-audio", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // expect { url: 'https://...' }
  return res.data;
}

// Fetch existing comments for a video
export async function fetchComments(videoId) {
  const res = await axiosClient.get(`/comments?videoId=${encodeURIComponent(videoId)}`);
  return res.data;
}

