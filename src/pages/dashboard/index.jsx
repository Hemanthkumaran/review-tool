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

export default function DashboardPage({
  role = "Owner",
  minutesUsed = 89,
  minutesCap = 500,
  onCreateFolder = () => {},
}) {

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("allFolders");
  const [loading, setLoading] = useState(true);

  const usagePct = Math.min(100, Math.round((minutesUsed / minutesCap) * 100));
  const navigate = useNavigate();

  useEffect(() => {
    getAllFolders();
  }, []);

  function handleCreate(name) {
    setCreateLoading(true);
    createFolderApi({ name })
    .then(res => {
      setCreateLoading(false);
      setCreateModalOpen(false);
      getAllFolders();
    })
    .catch(err => {
      setCreateLoading(false);
    })
  }

  function getAllFolders() {
    allFoldersApi()
    .then(res => {
      console.log(res, 'ress');
      setLoading(false);
      setAllFolders(res.data.folderArray);
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
          <div style={{ fontFamily:"Gilroy-SemiBold", fontSize:24 }}>
            Welcome to {JSON.parse(localStorage.getItem('user')).workspaceName}’s workspace
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#F9EF38] text-black px-4 py-2 hover:opacity-90"
            >
              <PlusThin className="h-4 w-4" />
              <span>Create folder</span>
            </button>
          </div>
        </div>

        {/* Tabs & mobile actions */}
        <div className="mt-6 flex items-center justify-between">
          {/* Segmented tabs */}
            <div style={{ width:250 }} className="mt-2">
              <SegmentedTabs
                options={[
                  { id: "allFolders", label: "All folders" },
                  { id: "projects", label: "Projects" },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>
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
        { allFolders.length ?
            <div className='flex gap-6 mt-3'>
              {allFolders.map(item => {
                return <Folder 
                  key={item._id}
                  onClick={() => navigate(PATHS.ADD_PROJECT, { state: item })} 
                  folderName={item.name}
                />
              })}
            </div> :
          <EmptyState/> }
      </main>

      {/* Bottom-right watermark */}
      <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#101213] px-3 py-2">
        <img src={cutjamm}/>
        <span style={{ fontFamily:'Gilroy-Light' }} className="text-[#fff]">powered by Cutjamm</span>
      </div>
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        handleCreate={handleCreate}
        loading={createLoading}
      />
    </div>
  );
}

function EmptyState() {
  return <section className="relative mt-16 h-[48vh] md:h-[56vh] rounded-3xl">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#7E7E7E] text-base md:text-lg">There are no folders here</p>
        <p className="text-[#7E7E7E] text-sm md:text-base mt-1">
          Please create a new folder to get started
        </p>
      </div>
    </div>
  </section>
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