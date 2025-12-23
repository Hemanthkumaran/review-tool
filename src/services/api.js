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
  return axiosClient.patch(
    `/project/addReply?projectID=${projectId}&versionID=${versionId}&commentID=${commentId}`,
    payload
  );
};

export const resolveCommentApi = (projectId, versionId, commentId, payload) => {
  return axiosClient.patch(
    `/project/resolveComment?projectID=${projectId}&versionID=${versionId}&commentID=${commentId}`,
    payload
  );
};

export const updateDownloadLinkApi = (projectID, payload) => {
  return axiosClient.patch(
    `/project/updateDownloadLink?projectID=${projectID}`,
    payload
  );
};

export const updateProjectStatusApi = (projectId, status) => {
  return axiosClient.patch(
    `/project/updateStatus?projectID=${projectId}`,
    { status } // "in progress" | "completed"
  );
};

export const updateFolderApi = (folderId, payload) => {
  return axiosClient.patch(
    `/folder/updateFolder?folderID=${folderId}`,
    payload
  );
};

export const deleteFolderApi = (folderId) => {
  return axiosClient.delete(
    `/folder/deleteFolder?folderID=${folderId}`
  );
};

export const updateProjectApi = (projectId, payload) => {
  return axiosClient.patch(
    `/project/updateProject?projectID=${projectId}`,
    payload
  );
};

export const deleteProjectApi = (projectId) => {
  return axiosClient.delete(
    `/project/deleteProject?projectID=${projectId}`
  );
};

export const getAllUserWorkspace = () => {
  return axiosClient.get(`/user/getAllUserWorkspace`);
};

export const getWorkspaceSettings = () => {
  return axiosClient.get(`/user/getWorkspaceMembers`);
};

export const inviteUserToWorkspace = (workspaceID, payload) => {
  return axiosClient.put(
    `user/inviteUserToWorkspace?workspaceID=${workspaceID}`,
    payload
  );
};

export const removeUserFromWorkspace = (workspaceID, payload) => {
  return axiosClient.put(
    `user/removeUserFromWorkspace?workspaceID=${workspaceID}`,
    payload
  );
};