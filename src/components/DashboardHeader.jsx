import arrowDown from '../assets/svgs/arrow-down.svg';
import ownerLogo from '../assets/svgs/owner.svg';


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


function DashboardHeader({ role, minutesUsed, minutesCap, usagePct }) {
  return (
        <header className="flex items-center justify-between px-2 md:px-2">
            {/* Left: workspace pill */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-full bg-[#151618] border border-[#101213] px-3 py-2">
                <img src={ownerLogo}/>
                <span className="text-sm md:text-base font-medium">{JSON.parse(localStorage.getItem('user')).workspaceName}</span>
                <span className="rounded-full bg-[#1E1F22] text-[11px] px-2 py-0.5 border border-[#2A2B2F] text-[#BFBFBF]">
                    {role}
                </span>
                <img src={arrowDown}/>
                </div>
            </div>
            {/* Right cluster */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Usage pill */}
                <div className="hidden sm:flex items-center gap-3 rounded-full bg-[#070707] border border-[#101213] px-3 py-2">
                    <div className="text-xs text-[#BFBFBF] min-w-[84px]">
                    {minutesUsed} / {minutesCap} mins
                    <div className="h-1 w-28 mt-1 rounded-full bg-[#1E1F22] overflow-hidden">
                    <div
                        className="h-full bg-[#820000] rounded-full"
                        style={{ width: `${usagePct}%` }}
                    />
                    </div>
                </div>
                <button
                  className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1F22] hover:bg-[#24262A]"
                  aria-label="Buy more minutes"
                  title="Buy more minutes"
                >
                  <Plus className="h-4 w-4" />
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
  )
}

export default DashboardHeader