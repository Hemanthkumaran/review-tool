import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllUserWorkspace, getWorkspacePlanApi, getWorkspaceUsers } from "../services/api";
import { constants } from "../helpers/enum";

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {

  const [workspaces, setWorkspaces] = useState([]);
  const [ownerWorkspace, setOwnerWorkspace] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [workspaceUsers, setWorkspaceUsers] = useState(null);
  const [loading, setLoading] = useState(false);

  const [workspacePlan, setWorkspacePlan] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [trialUsed, setTrialUsed] = useState(false);

  const userAccess = activeWorkspace?.permissionType == undefined ? constants.REVIEWER : activeWorkspace?.permissionType;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceIdFromUrl = searchParams.get("ws");

  const fetchWorkspacePlan = async (workspaceId) => {
    
    if (!workspaceId) return;

    try {
      setBillingLoading(true);

      const res = await getWorkspacePlanApi(workspaceId);

      setWorkspacePlan(res.data);

    } catch (err) {
      console.error("Failed to fetch plan", err);
    } finally {
      setBillingLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);

      const res = await getAllUserWorkspace();
      
      const list = res.data.workspaceArray || [];
      const ownerWorkspaces = list.filter(
        (ws) => ws.permissionType === constants.OWNER
      );
      setOwnerWorkspace(ownerWorkspaces[0]);
      
      setWorkspaces(list);

      // setActiveWorkspace(prev => prev || list[0] || null);
      let next = null;

      // 1) Try URL
      if (workspaceIdFromUrl) {
        next = list.find(w => w._id === workspaceIdFromUrl);
      }

      // 2) Fallback to first workspace
      if (!next) next = list[0] || null;

      setActiveWorkspace(next);

      // 3) If URL missing or invalid → fix it
      if (next && next._id !== workspaceIdFromUrl) {
        const params = new URLSearchParams(searchParams);
        params.set("ws", next._id);
        setSearchParams(params, { replace: true });
      }
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
    fetchWorkspacePlan(activeWorkspace._id);
    fetchWorkspaceUsers(activeWorkspace._id);
    setSubscriptionStatus(null);
    setTrialUsed(false);

  }, [activeWorkspace?._id]);


  useEffect(() => {
    if (!workspaces.length) return;
    if (!workspaceIdFromUrl) return;

    const found = workspaces.find(w => w._id === workspaceIdFromUrl);
    if (found && found._id !== activeWorkspace?._id) {
      setActiveWorkspace(found);
    }
  }, [workspaceIdFromUrl, workspaces]);


  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace: (ws) => {
          setActiveWorkspace(ws);
          if (ws?._id) {
            const params = new URLSearchParams(searchParams);
            params.set("ws", ws._id);
            setSearchParams(params);
          }
        },
        workspaceUsers,
        loading,
        refreshWorkspace: fetchWorkspaces,
        fetchWorkspaceUsers,
        userAccess,  
        workspacePlan,
        billingLoading,
        refreshWorkspacePlan: fetchWorkspacePlan,
        subscriptionStatus,
        setSubscriptionStatus,
        trialUsed,
        setTrialUsed,
        ownerWorkspace
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
