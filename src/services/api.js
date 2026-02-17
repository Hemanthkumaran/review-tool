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

// export const allFoldersApi = (sortBy = 'createdAt', sortOrder = 'desc', workspaceID) => {
//   return axiosClient.get(`/folder/getAllFolders?sortField=${sortBy}&sortOrder=${sortOrder}&workspaceID=${workspaceID}`);
// };

export const allFoldersApi = (
  sortBy = "createdAt",
  sortOrder = "desc",
  workspaceID,
  filters = {}
) => {

  // ⭐ assigned filter
  let assigned = [];

  if (filters.assignment === "assigned") assigned = [true];
  else if (filters.assignment === "unassigned") assigned = [false];

  // ⭐ status filter
  const status = filters.status?.length
    ? filters.status.map(s => s.replaceAll("_", " "))
    : [];

  return axiosClient.post(
    `/folder/getAllFolders?sortField=${sortBy}&sortOrder=${sortOrder}&workspaceID=${workspaceID}`,
    {
      assigned,
      status,
    }
  );
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

export const getOneProjectApi = (projId, params) => {
  return axiosClient.get(`/project/getOneProject?projectID=${projId}`, { params });
};

export const getVideoUploadUrl = (projId, videoDuration) => {
  return axiosClient.get(`/project/getUploadVideoLink?projectID=${projId}&videoDuration=${videoDuration}`);
};

export const addCommentApi = (
  projectID,
  versionID,
  formData,
  reviewer = null
) => {

  const params = new URLSearchParams({
    projectID,
    versionID,
  });

  // ⭐ add reviewer params only if reviewer exists
  if (reviewer?.reviewerEmail && reviewer?.reviewerName) {
    params.append("reviewerEmail", reviewer.reviewerEmail);
    params.append("reviewerName", reviewer.reviewerName);
  }

  return axiosClient.post(
    `/project/addComment?${params.toString()}`,
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

// export const addReplyApi = (projectId, versionId, commentId, payload) => {
//   return axiosClient.patch(
//     `/project/addReply?projectID=${projectId}&versionID=${versionId}&commentID=${commentId}`,
//     payload
//   );
// };

export const addReplyApi = (
  projectId,
  versionId,
  commentId,
  payload,
  reviewer = null
) => {

  const params = new URLSearchParams({
    projectID: projectId,
    versionID: versionId,
    commentID: commentId,
  });

  // ⭐ append reviewer only if exists
  if (reviewer?.reviewerEmail && reviewer?.reviewerName) {
    params.append("reviewerEmail", reviewer.reviewerEmail);
    params.append("reviewerName", reviewer.reviewerName);
  }

  return axiosClient.patch(
    `/project/addReply?${params.toString()}`,
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

export const getWorkspaceUsers = () => {
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

export const updateCommentApi = (projectID, versionID, commentID, payload) => {
  return axiosClient.patch(
    `/project/updateComment?projectID=${projectID}&versionID=${versionID}&commentID=${commentID}`,
    payload
  );
};

export const deleteCommentApi = (projectID, versionID, commentID) => {
  return axiosClient.delete(
    `/project/deleteComment?projectID=${projectID}&versionID=${versionID}&commentID=${commentID}`
  );
};

export const updateReplyApi = (
  projectID,
  versionID,
  commentID,
  replyID,
  payload
) => {
  return axiosClient.patch(
    `/project/updateReply?projectID=${projectID}&versionID=${versionID}&commentID=${commentID}&replyID=${replyID}`,
    payload
  );
};

export const deleteReplyApi = (
  projectID,
  versionID,
  commentID,
  replyID
) => {
  return axiosClient.delete(
    `/project/deleteReply?projectID=${projectID}&versionID=${versionID}&commentID=${commentID}&replyID=${replyID}`
  );
};


export const addUserToProjectApi = (projectID, email) => {
  return axiosClient.put(
    `/project/addUserToProject?projectID=${projectID}`,
    { email }
  );
};


export const removeUserFromProjectApi = (projectID, email) => {
  return axiosClient.put(
    `/project/removeUserFromProject?projectID=${projectID}`,
    { email }
  );
};

export const deleteProjectVersionApi = (projectID, versionID) => {
  return axiosClient.delete(
   `/project/deleteVersion?projectID=${projectID}&versionID=${versionID}`
  );
};

export const startTrialApi = (workspaceID, payload) =>
  axiosClient.post(`/billing/startTrial?workspaceID=${workspaceID}`, payload);

export const getWorkspacePlanApi = (workspaceID) =>
  axiosClient.get(`/billing/getWorkspacePlanDetails?workspaceID=${workspaceID}`);

export const createPaymentOrderApi = (workspaceID, payload) =>
  axiosClient.post(`/billing/createPaymentOrder?workspaceID=${workspaceID}`, payload);

export const updateUserProfileApi = (payload) =>
  axiosClient.patch("/user/updateUserProfile", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  export const getUserProfileApi = () =>
  axiosClient.get("/user/getUserProfile");

  export const updateWorkspaceApi = (workspaceID, payload) =>
  axiosClient.patch(
    `/user/updateWorkspace?workspaceID=${workspaceID}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );