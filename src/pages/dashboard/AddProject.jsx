import { useEffect, useState } from 'react';

import ProjectFolder from '../../components/ProjectFolder';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import LeftArrow from '../../assets/svgs/arrow-left.svg';
import AddProjectModal from '../../components/modals/AddProjectModal';
import { allProjectsApi, createProjectApi, deleteProjectApi, updateProjectApi } from '../../services/api';
import { getVideoDuration, uploadToMux } from '../../helpers/muxHelpers';
import { useWorkspace } from '../../context/WorkspaceContext';
import { constants } from '../../helpers/enum';
import Spinner from '../../components/common/Spinner';
import SettingsModal from '../../components/settings/SettingsModal';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../helpers/showToast';
import { useUploads } from '../../context/UploadContext';

export default function AddProject({
  onCreateFolder = () => {},
}) {

  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const folderId = params.get("folder");
  const folderName = params.get("folderName");
  const { activeWorkspace, brandingColor, userAccess, refreshWorkspacePlan, setSubscriptionStatus, setTrialUsed } = useWorkspace();
  const { startMuxUpload } = useUploads();
  
  useEffect(() => {
      if (activeWorkspace !== null) {
        getAllProjects();
      }
    }, [activeWorkspace]);

  const handleUpdateProject = async (id, payload) => {
    try {
      await updateProjectApi(id, payload);
      getAllProjects();
      showSuccessToast(payload?.status ? "Project status updated" : "Project renamed successfully");
    } catch (err) {
      console.error("Update failed", err);
      showErrorToast(getApiErrorMessage(err, "Failed to update project"));
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProjectApi(id);
      getAllProjects();
      refreshWorkspacePlan(activeWorkspace._id);
      showSuccessToast("Project deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);
      showErrorToast(getApiErrorMessage(err, "Failed to delete project"));
    }
  };

  async function handleCreate(name, selectedFile) {
    setCreateLoading(true);

    let duration = null;

    try {
      const data = {
        folderID: folderId,
        name,
        hasFile: !!selectedFile,
      };

      if (selectedFile) {
        duration = await getVideoDuration(selectedFile);
        data['videoDuration'] = duration;
        data['fileName'] = selectedFile.name;
      }

      // 1) Create project immediately
      const res = await createProjectApi(data);
      const { muxUploadURL } = res.data || {};
      const createdProjectId =
        res.data?.project?._id ||
        res.data?.projectID ||
        res.data?.projectId ||
        res.data?._id ||
        res.data?.data?._id;
      let uploadStarted = false;

      const startBackgroundUpload = (projectIdForUpload = null) => {
        if (!muxUploadURL || !selectedFile || uploadStarted) return;
        uploadStarted = true;

        const uploadPromise = projectIdForUpload
          ? startMuxUpload({
            projectId: projectIdForUpload,
            muxUploadURL,
            file: selectedFile,
            source: "project-create",
          })
          : uploadToMux(muxUploadURL, selectedFile);

        uploadPromise.catch((err) => {
          console.error("Mux upload failed", err);
          showErrorToast(getApiErrorMessage(err, "Project created, but video upload failed"));
        });
      };

      startBackgroundUpload(createdProjectId);

      // 2) Close modal + refresh
      setAddProjectOpen(false);
      setCreateLoading(false);
      refreshWorkspacePlan(activeWorkspace._id);
      const refreshedProjects = await getAllProjects();

      if (selectedFile && !uploadStarted) {
        const createdProject = refreshedProjects?.find((project) => project.name === name);
        startBackgroundUpload(createdProject?._id);
      }

      showSuccessToast(selectedFile ? "Project created. Video upload started." : "Project created successfully");

    } catch (err) {
      console.error(err);
      showErrorToast(getApiErrorMessage(err, "Failed to create project"));
      setCreateLoading(false);
    }
  }



  function getAllProjects() {
    const params = {
      sortField: 'createdAt',
      sortOrder: 'desc',
      folderID: folderId,
      workspaceID: activeWorkspace._id
    };
    
    return allProjectsApi(params)
    .then(res => {
      setSubscriptionStatus(res.data.subscriptionStatus);
      setTrialUsed(res.data.trialUsed);
      setAllProjects(res.data.projectArray);
      setLoading(false);
      return res.data.projectArray;
    })
    .catch(() => {
      showErrorToast("Failed to load projects");
      setLoading(false);
    })
  }

  
  if (loading) {
    return <div className='flex items-center justify-center mt-30'>
        <Spinner size={46} color={brandingColor} />
    </div>
  }

  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      {/* Page content */}
      <main className="px-6 md:px-8">
        {/* Title row */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center">
            <img onClick={() => navigate(`${PATHS.DASHBOARD}?ws=${activeWorkspace?._id}`)} style={{ height:20, width:20, cursor:'pointer' }} src={LeftArrow} />
            <div style={{ height:20, width:0.8,  background:"#202020", margin:"0 10px" }}/>
            <div className="flex items-center">
            <div style={{ fontFamily:"Gilroy-Light", color:"#fff" }}>
              <span onClick={() => navigate(`${PATHS.DASHBOARD}?ws=${activeWorkspace?._id}`)} style={{ color:"#9C9C9C", cursor:'pointer' }}>
                All Folders {" "}</span> / {" "}
                <span>{folderName}</span>
            </div>
            <div style={{ backgroundColor:"#1F1E0C", padding:"2px 13px", borderRadius:14, fontSize:14, marginLeft:5 }}>{allProjects.length}</div>
            </div>
          </div>
          <div onClick={() => setIsSettingModalOpen(true)} className="hidden md:flex items-center gap-3">
            {/* {userAccess == constants.OWNER &&<button
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>} */}
            {(userAccess == constants.OWNER || userAccess == constants.MEMBER) &&
            <button
                onClick={(e) => {
                e.stopPropagation();  
                setAddProjectOpen(true);
              }}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[var(--brand-color)] text-black px-4 py-2 hover:opacity-90"
            >
              <PlusThin className="h-4 w-4" />
              <span>Add project</span>
            </button>}
          </div>
        </div>

        {/* Tabs & mobile actions */}
        <div className="mt-6 flex items-center justify-between">
          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
              {userAccess == constants.OWNER && <button
                onClick={() => setIsSettingModalOpen(true)}
                className="inline-flex items-center cursor-pointer gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
              >
                <InviteIcon className="h-4 w-4" />
                <span>Invite</span>
              </button>}
            <button
              onClick={onCreateFolder}
              className="inline-flex items-center gap-2 rounded-full bg-[#F9EF38] text-black px-3 py-2 hover:opacity-90"
            >
              <PlusThin className="h-4 w-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {allProjects.map((item) => (
            <ProjectFolder
              key={item._id}
              project={item}
              fetchGetAllProjs={getAllProjects}
              onClick={() =>
                navigate(`/video-review/${item._id}?ws=${activeWorkspace?._id}`)
              }
              onRename={(id, name) =>
                handleUpdateProject(id, { name })
              }
              onStatusChange={(id, status) =>
                handleUpdateProject(id, { status })
              }
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      </main>
      {addProjectOpen && <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        handleCreate={handleCreate}
        createLoading={createLoading}
      />}
              {/* SETTINGS MODAL */}
                <SettingsModal
                  isOpen={isSettingModalOpen}
                  onClose={() => setIsSettingModalOpen(false)}
                  activeScreen={"users"}
                  loading={createLoading}
                  activeWorkspace={activeWorkspace}
                />
    </div>
  );
}


function PlusThin({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M10 4v12M4 10h12" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}


function InviteIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" stroke="#BFBFBF" strokeWidth="1.6"/>
      <path d="M3 21c1.7-3.3 5-5.5 9-5.5s7.3 2.2 9 5.5" stroke="#BFBFBF" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
