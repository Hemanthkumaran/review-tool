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

// Folder api
export const createFolderApi = (data) => {
  return axiosClient.post(`/folder/createFolder`, data);
};

export const allFoldersApi = (sortBy = 'createdAt', sortOrder = 'desc') => {
  return axiosClient.get(`/folder/getAllFolders?sortField=${sortBy}&sortOrder=${sortOrder}`);
};

export const getOneFolderApi = (folderId) => {
  return axiosClient.get(`/folder/getOneFolder?folderID=${folderId}`);
};

// Project api
export const createProjectApi = (data) => {
  return axiosClient.post(`/project/createProject`, data);
};

export const allProjectsApi = (params) => {
  return axiosClient.get('/project/getAllProjects', { params });
};

export const getOneProjectApi = (projId) => {
  return axiosClient.get(`/project/getOneProject?projectID=${projId}`);
};

export const getVideoUploadUrl = (projId) => {
  return axiosClient.get(`/project/getUploadVideoLink?projectID=${projId}`);
};

export const addCommentApi = (projectID, versionID, formData) => {
  return axiosClient.post(
    `/project/addComment?projectID=${projectID}&versionID=${versionID}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export async function updateNotesApi(projectID, data) {
  const res = await axiosClient.patch(`/project/updateNotes?projectID=${projectID}`, data);
  return res.data;
}

export const addReplyApi = (projectId, versionId, commentId, payload) => {
  // payload: { text: string }  (extend later if replies get attachments)
  return axiosClient.patch(
    `/project/addReply?projectID=${projectId}&versionID=${versionId}&commentID=${commentId}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
