import { useEffect, useState } from 'react';

import CreateFolderModal from '../../components/modals/CreateFolderModal';
import cutjamm from '../../assets/svgs/cutjamm.svg';
import ProjectFolder from '../../components/ProjectFolder';
import Folder from '../../components/Folder/Folder';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import LeftArrow from '../../assets/svgs/arrow-left.svg';
import AddProjectModal from '../../components/modals/AddProjectModal';
import { allProjectsApi, createProjectApi, deleteProjectApi, updateProjectApi } from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
import AppLoader from '../../components/common/AppLoader';
import ShareModal from '../../components/modals/ShareModal';
import { getVideoDuration, uploadToMux } from '../../helpers/muxHelpers';
import { useWorkspace } from '../../context/WorkspaceContext';
import { constants } from '../../helpers/enum';
import Spinner from '../../components/common/Spinner';

export default function AddProject({
  minutesUsed = 89,
  minutesCap = 500,
  onCreateFolder = () => {},
}) {

  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const usagePct = Math.min(100, Math.round((minutesUsed / minutesCap) * 100));
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const folderId = params.get("folder");
  const folderName = params.get("folderName");
  const { activeWorkspace, loading: workspaceLoading, userAccess, refreshWorkspacePlan } = useWorkspace();
  
    useEffect(() => {
      if (activeWorkspace !== null) {
        getAllProjects();
      }
    }, [activeWorkspace]);

// useEffect(() => {
//   if (workspaceLoading) return;
//   if (!activeWorkspace?._id) return;
//   if (!location.state?._id) return;

//   getAllProjects();
// }, [workspaceLoading, activeWorkspace?._id, location.state?._id]);




  const handleUpdateProject = async (id, payload) => {
    try {
      await updateProjectApi(id, payload);
      getAllProjects();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProjectApi(id);
      getAllProjects();
      refreshWorkspacePlan(activeWorkspace._id);
    } catch (err) {
      console.error("Delete failed", err);
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
        // videoDuration: duration
      };

      if (selectedFile) {
        duration = await getVideoDuration(selectedFile);
        data['videoDuration'] = duration;
        console.log("Video duration:", duration, folderId);
      }

      console.log(data, 'data')
      // 1) Create project immediately
      const res = await createProjectApi(data);
      const { muxUploadURL } = res.data || {};

      // 2) Close modal + refresh
      setAddProjectOpen(false);
      setCreateLoading(false);
      refreshWorkspacePlan(activeWorkspace._id);
      await getAllProjects();

      // 3) Upload in background
      if (muxUploadURL && selectedFile) {
        uploadToMux(muxUploadURL, selectedFile, pct => {
          console.log("Uploading in background:", pct);
        }).catch(err => {
          console.error("Mux upload failed", err);
        });
      }

    } catch (err) {
      console.error(err);
      alert(err.response.data.error)
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
    console.log(params, 'params');
    
    allProjectsApi(params)
    .then(res => {
      console.log(res, 'all projects');
      setAllProjects(res.data.projectArray);
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      console.log(err);
    })
  }

  
  if (loading) {
    return <div className='flex items-center justify-center mt-30'>
        <Spinner size={46} color="#F9EF38" />
    </div>
  }

  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      {/* Page content */}
      <main className="px-6 md:px-8">
        {/* Title row */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center">
            <img onClick={() => navigate(-1)} style={{ height:20, width:20, cursor:'pointer' }} src={LeftArrow} />
            <div style={{ height:20, width:0.8,  background:"#202020", margin:"0 10px" }}/>
            <div className="flex items-center">
            <div style={{ fontFamily:"Gilroy-Light", color:"#fff" }}>
              <span onClick={() => navigate(-1)} style={{ color:"#9C9C9C", cursor:'pointer' }}>
                All Folders {" "}</span> / {" "}
                <span>{folderName}</span>
            </div>
            <div style={{ backgroundColor:"#1F1E0C", padding:"2px 13px", borderRadius:14, fontSize:14, marginLeft:5 }}>{allProjects.length}</div>
            </div>
          </div>
          <div onClick={() => setInviteModal(true)} className="hidden md:flex items-center gap-3">
            {userAccess == constants.OWNER &&<button
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>}
            {(userAccess == constants.OWNER || userAccess == constants.MEMBER) &&
            <button
                onClick={(e) => {
                e.stopPropagation();  
                setAddProjectOpen(true);
              }}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#F9EF38] text-black px-4 py-2 hover:opacity-90"
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
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-3 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>
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
      {/* Bottom-right watermark */}
      <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#101213] px-3 py-2">
        <img src={cutjamm}/>
        <span style={{ fontFamily:'Gilroy-Light' }} className="text-[#fff]">powered by Cutjamm</span>
      </div>
      {/* {inviteModal ? <ShareModal onClose={() => setInviteModal(false)}/> : null} */}
      {addProjectOpen && <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        handleCreate={handleCreate}
        createLoading={createLoading}
      />}
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