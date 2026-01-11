import { useState } from 'react';

import CreateFolderModal from '../../components/modals/CreateFolderModal';
import cutjamm from '../../assets/svgs/cutjamm.svg';
import Folder from '../../components/Folder/Folder';
import { PATHS } from '../../routes/paths';
import { useNavigate } from 'react-router-dom';
import { allFoldersApi, createFolderApi } from '../../services/api';
import { useEffect } from 'react';
import SegmentedTabs from '../../components/SegmentedTabs';
import DashboardHeader from '../../components/DashboardHeader';
import AppLoader from '../../components/common/AppLoader';
import ShareModal from '../../components/modals/ShareModal';
import ProjectAccordion from '../../components/karn-comp/components/Accordion/Accordion';
import { useWorkspace } from '../../context/WorkspaceContext';
import { constants } from '../../helpers/enum';
import filterIcon from "../../assets/svgs/filter.svg";
import ProjectFilter from '../../components/ProjectFilter';

export default function DashboardPage({
  minutesUsed = 89,
  minutesCap = 500,
  onCreateFolder = () => {},
}) {

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [inviteModal, setInviteModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("allFolders");
  const { activeWorkspace, loading: workspaceLoading, userAccess } = useWorkspace();
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    assignment: null,   // "assigned" | "unassigned" | null
    status: []          // ["yet_to_start", "in_progress", ...]
  });
  const usagePct = Math.min(100, Math.round((minutesUsed / minutesCap) * 100));
  const navigate = useNavigate();
  useEffect(() => {
  console.log("filters changed", filters);
}, [filters]);

  useEffect(() => {
    if (workspaceLoading) return;
    if (!activeWorkspace?._id) return;

    getAllFolders();
  }, [workspaceLoading, activeWorkspace?._id]);


  function handleCreate() {
    setCreateLoading(true);
    createFolderApi({ name: 'Untitled', workspaceID: activeWorkspace._id })
    .then(() => {
      setCreateLoading(false);
      setCreateModalOpen(false);
      getAllFolders();
    })
    .catch(() => {
      setCreateLoading(false);
    })
  }


  function getAllFolders() {
    setFoldersLoading(true);
    allFoldersApi("createdAt", "desc", activeWorkspace._id)
      .then((res) => {
        setAllFolders(res.data.folderArray);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setFoldersLoading(false);
      });
  }


  function handleFolderUpdated(folderId, newName) {
    setAllFolders((prev) =>
      prev.map((f) =>
        f._id === folderId ? { ...f, name: newName } : f
      )
    );
  }
  
  function handleFolderDeleted(folderId) {
    setAllFolders((prev) =>
      prev.filter((f) => f._id !== folderId)
    );
  }

  function getActiveContent() {
    if (activeTab === "allFolders" && userAccess !== constants.REVIEWER) {
      return <div className="flex gap-4 mt-3 flex-wrap">
        {allFolders.map((item) => (
          <Folder
            key={item._id}
            folder={item}
            onClick={() => navigate(PATHS.ADD_PROJECT, { state: item })}
            onRenamed={handleFolderUpdated}
            onDeleted={handleFolderDeleted}
          />
        ))}
      </div>
    }
     else {
      return allFolders.map(folder => {
        return <ProjectAccordion key={folder._id} folder={folder} getAllFolders={getAllFolders}/>
      })
    }
  }


  if (workspaceLoading) {
    return <AppLoader visible message="Loading workspace…" />;
  }

  if (foldersLoading) {
    return <AppLoader visible message="Loading folders…" />;
  }


  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      <DashboardHeader
        minutesUsed={minutesUsed}
        minutesCap={minutesCap}
        usagePct={usagePct}
      />
      {/* Page content */}
      <main className="px-6 md:px-8">
        {/* Title row */}
        <div className="mt-8 flex items-center justify-between">
          <div style={{ fontFamily:"Gilroy-SemiBold", fontSize:24 }}>
            Welcome to {activeWorkspace?.name}'s workspace
          </div>

          {activeTab == "allFolders" ? 
            <div className="hidden md:flex items-center gap-3">
              {userAccess == constants.OWNER && <button
                onClick={() => setInviteModal(true)}
                className="inline-flex items-center cursor-pointer gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
              >
                <InviteIcon className="h-4 w-4" />
                <span>Invite</span>
              </button>}
              {(userAccess == constants.OWNER || userAccess == constants.MEMBER) &&
                <button
                onClick={handleCreate}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#F9EF38] text-black px-4 py-2 hover:opacity-90"
              >
                <PlusThin className="h-4 w-4" />
                <span>Create folder</span>
              </button>}
            </div> :
            <div className="relative">
              <img
                src={filterIcon}
                className="cursor-pointer"
                onClick={() => setShowFilter((v) => !v)}
              />

              {showFilter && (
                <ProjectFilter
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setShowFilter(false)}
                />
              )}
            </div>
          }
        </div>
        {/* Tabs & mobile actions */}
        <div className="mt-6 flex items-center justify-between">
          {/* Segmented tabs */}
            { userAccess != constants.REVIEWER && <div style={{ width:250 }} className="mt-2">
              <SegmentedTabs
                options={[
                  { id: "allFolders", label: "All folders" },
                  { id: "projects", label: "Projects" },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>}
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
        {getActiveContent()}
      </main>
      {/* Bottom-right watermark */}
      <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#101213] px-3 py-2">
        <img src={cutjamm}/>
        <span style={{ fontFamily:'Gilroy-Light' }} className="text-[#fff]">powered by Cutjamm</span>
      </div>
      {/* {inviteModal ? <ShareModal onClose={() => setInviteModal(false)}/> : null} */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        handleCreate={handleCreate}
        loading={createLoading}
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