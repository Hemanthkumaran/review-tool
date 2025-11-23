import { useState } from 'react';

import CreateFolderModal from '../../components/modals/CreateFolderModal';
import cutjamm from '../../assets/svgs/cutjamm.svg';
import ProjectFolder from '../../components/ProjectFolder';
import Folder from '../../components/Folder/Folder';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import LeftArrow from '../../assets/svgs/arrow-left.svg';
import AddProjectModal from '../../components/modals/AddProjectModal';

export default function AddProject({
  workspaceName = "A2Z Studios",
  role = "Owner",
  minutesUsed = 89,
  minutesCap = 500,
  onCreateFolder = () => {},
}) {

  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [data, setData] = useState(null);
  const usagePct = Math.min(100, Math.round((minutesUsed / minutesCap) * 100));
  const navigate = useNavigate();
  const location = useLocation();

    
  function handleCreate(val) {
    setAddProjectOpen(false);
    setData(val);
  }

  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      <header className="flex items-center justify-between px-2 md:px-2">
        {/* Left: workspace pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full bg-[#151618] border border-[#232427] px-3 py-2">
            <LogoGlyph className="h-7 w-7" />
            <span className="text-sm md:text-base font-medium">{workspaceName}</span>
            <span className="rounded-full bg-[#1E1F22] text-[11px] px-2 py-0.5 border border-[#2A2B2F] text-[#BFBFBF]">
              {role}
            </span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Usage pill */}
          <div className="hidden sm:flex items-center gap-3 rounded-full bg-[#151618] border border-[#232427] px-3 py-2">
            <div className="text-xs text-[#BFBFBF] min-w-[84px]">
              {minutesUsed} / {minutesCap} mins
            </div>
            <div className="h-2 w-28 rounded-full bg-[#1E1F22] overflow-hidden">
              <div
                className="h-full bg-[#B33434] rounded-full"
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <button
              className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1E1F22] hover:bg-[#24262A]"
              aria-label="Buy more minutes"
              title="Buy more minutes"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bell */}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#151618] border border-[#232427] hover:bg-[#1A1B1E]"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>

          {/* Avatar */}
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#151618] border border-[#232427] overflow-hidden">
            {/* Replace with your img */}
            <img
              src="https://i.pravatar.cc/80?img=32"
              alt="User"
              className="h-10 w-10 object-cover"
            />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="px-6 md:px-8">
        {/* Title row */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center">
                <img style={{ height:20, width:20 }} src={LeftArrow} />
                <div style={{ height:20, width:0.8,  background:"#202020", margin:"0 10px" }}/>
                <div className="flex items-center">
                <div style={{ fontFamily:"Gilroy-Light", color:"#fff" }}>
                    <span style={{ color:"#9C9C9C" }}>All Folders {" "}</span> / <span>{location.state}</span>
                </div>
                </div>
            </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>
            <button
              onClick={() => setAddProjectOpen(true)}
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

      </main>

      {/* Bottom-right watermark */}
      <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#101213] px-3 py-2">
        <img src={cutjamm}/>
        <span style={{ fontFamily:'Gilroy-Light' }} className="text-[#fff]">powered by Cutjamm</span>
      </div>
      <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        handleCreate={handleCreate}
      />
    </div>
  );
}


function LogoGlyph({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <circle cx="16" cy="16" r="15" stroke="#2F3136" strokeWidth="2" />
      <path d="M16 5l5 8h-10l5-8zm0 22l-5-8h10l-5 8z" fill="#F9EF38" />
    </svg>
  );
}

function ChevronDown({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M5 7l5 6 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Plus({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M10 4v12M4 10h12" stroke="#BFBFBF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusThin({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M10 4v12M4 10h12" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Bell({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 3a6 6 0 00-6 6v3.3l-1.3 2.6A1 1 0 005.6 17h12.8a1 1 0 00.9-1.5L18 12.3V9a6 6 0 00-6-6z" stroke="#BFBFBF" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 19a2.5 2.5 0 005 0" stroke="#BFBFBF" strokeWidth="1.6" strokeLinecap="round" />
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