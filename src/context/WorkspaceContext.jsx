import { createContext, useContext, useEffect, useState } from "react";
import { getAllUserWorkspace, getWorkspaceUsers } from "../services/api";
import { useAuth } from "./AuthContext";
import { constants } from "../helpers/enum";

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const auth = useAuth(); // 🔑 do NOT destructure immediately
  const isAuthenticated = auth?.isAuthenticated;

  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [workspaceUsers, setWorkspaceUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const userAccess = activeWorkspace?.permissionType == undefined ? constants.REVIEWER : activeWorkspace?.permissionType;
  
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);

      const res = await getAllUserWorkspace();
      const list = res.data.workspaceArray || [];

      setWorkspaces(list);

      setActiveWorkspace(prev => prev || list[0] || null);

      // Set default workspace once
      // if (list.length && !activeWorkspace) {
      //   setActiveWorkspace(list[0]);
      // }
    } catch (e) {
      console.error("Failed to fetch workspaces", e);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   * Fetch members for workspace
   * ---------------------------- */
  const fetchWorkspaceUsers = async (workspaceId) => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      setWorkspaceUsers(null); // 🔑 reset to avoid flashing old data

      const res = await getWorkspaceUsers(workspaceId);
      setWorkspaceUsers(res.data.workspace || null);
    } catch (e) {
      console.error("Failed to fetch workspace members", e);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   * Fetch workspaces after auth
   * ---------------------------- */
  useEffect(() => {
    fetchWorkspaces();
  }, []);


  /* -----------------------------
   * Fetch members when workspace changes
   * ---------------------------- */
  useEffect(() => {
    if (!activeWorkspace?._id) return;

    fetchWorkspaceUsers(activeWorkspace._id);
  }, [activeWorkspace?._id]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        workspaceUsers,
        loading,
        refreshWorkspace: fetchWorkspaces,
        fetchWorkspaceUsers,
        userAccess
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return ctx;
};
