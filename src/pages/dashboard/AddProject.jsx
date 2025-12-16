import { useEffect, useState } from 'react';

import CreateFolderModal from '../../components/modals/CreateFolderModal';
import cutjamm from '../../assets/svgs/cutjamm.svg';
import ProjectFolder from '../../components/ProjectFolder';
import Folder from '../../components/Folder/Folder';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import LeftArrow from '../../assets/svgs/arrow-left.svg';
import AddProjectModal from '../../components/modals/AddProjectModal';
import { allProjectsApi, createProjectApi, deleteProjectApi, updateProjectApi } from '../../services/api';
import DashboardHeader from '../../components/DashboardHeader';
import AppLoader from '../../components/common/AppLoader';
import ShareModal from '../../components/modals/ShareModal';
import { uploadToMux } from '../../helpers/muxHelpers';

export default function AddProject({
  role = "Owner",
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
  
  useEffect(() => {
    getAllProjects();
  }, []);

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
    } catch (err) {
      console.error("Delete failed", err);
    }
  };


function handleCreate(name, selectedFile) {
  setCreateLoading(true);

  const data = {
    folderID: location.state._id,
    name,
  };

  if (selectedFile) {
    data.hasFile = true; // tells backend to create Mux direct upload
  }

  createProjectApi(data)
    .then(async (res) => {
      console.log(res, "res");

      const { muxUploadURL } = res.data || {};

      // if backend created a mux direct upload AND we actually have a file
      if (muxUploadURL && selectedFile) {
        try {
          // 1) upload video file from browser directly to Mux
          await uploadToMux(muxUploadURL, selectedFile, (pct) => {
            // optional: setUploadProgress(pct);
            console.log("Mux upload progress:", pct);
          });

          // 2) after upload, you might want to inform backend or just refetch
          //    (usually backend listens to Mux webhooks and attaches playbackId
          //     to this project, so just re-fetch projects)
          await getAllProjects();
        } catch (err) {
          console.error("Mux upload error", err);
          // show toast / message if you have one
        } finally {
          setCreateLoading(false);
          setAddProjectOpen(false);
        }
      } else {
        // no file OR backend chose not to create mux upload
        await getAllProjects();
        setCreateLoading(false);
        setAddProjectOpen(false);
      }
    })
    .catch((err) => {
      console.log(err?.response?.data || err);
      setCreateLoading(false);
    });
}



  function getAllProjects() {

    const params = {
      sortField: 'createdAt',
      sortOrder: 'desc',
      folderID: location.state._id
    };

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

  if (loading) return <AppLoader visible={loading} message="Loading folders…" />

  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      <DashboardHeader
        role={role}
        minutesUsed={minutesUsed}
        minutesCap={minutesCap}
        usagePct={usagePct}
      />
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
                <span>{location.state.name}</span>
            </div>
            <div style={{ backgroundColor:"#1F1E0C", padding:"2px 13px", borderRadius:14, fontSize:14, marginLeft:5 }}>{allProjects.length}</div>
            </div>
          </div>
          <div onClick={() => setInviteModal(true)} className="hidden md:flex items-center gap-3">
            <button
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>
            <button
                onClick={(e) => {
                e.stopPropagation();  
                setAddProjectOpen(true);
              }}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#F9EF38] text-black px-4 py-2 hover:opacity-90"
            >
              <PlusThin className="h-4 w-4" />
              <span>Add project</span>
            </button>
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
              onClick={() =>
                navigate(PATHS.VIDEO_REVIEW, { state: { projectId: item._id } })
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
      {inviteModal ? <ShareModal onClose={() => setInviteModal(false)}/> : null}
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