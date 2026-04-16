import { useWorkspace } from '../context/WorkspaceContext';

export default function WorkspaceDropdown({ workspaces, activeWorkspace, onSelect }) {

  const { brandingColor } = useWorkspace();
  
  return (
    <div
      className="
        absolute z-50 mt-3 w-[360px]
        rounded-[28px]
        bg-[#0C0D0F]
        border border-[#1E1F22]
        p-3
        shadow-[0_20px_60px_rgba(0,0,0,0.7)]
      "
    >
      {workspaces.map((ws) => {
        const isActive = ws._id === activeWorkspace?._id;
        return (
          <div
            key={ws._id}
            onClick={() => onSelect(ws)}
            className={`
              relative flex items-center justify-between
              rounded-[20px]
              px-5 py-4
              cursor-pointer
              transition
              ${isActive ? "bg-[#111214]" : "hover:bg-[#141517]"}
            `}
          >
            {/* Active yellow indicator */}
            {isActive && (
              <div style={{ background:brandingColor }} className="absolute left-0 top-3 bottom-3 w-[4px] rounded-full" />
            )}

            <div className="flex items-center gap-4">
              {/* <div className="h-10 w-10 rounded-full bg-[#1E1F22] flex items-center justify-center">
                <img src={ownerLogo} className="h-5 w-5" />
              </div> */}

              <div className="text-base font-medium">{ws.name}</div>
            </div>

            <span style={{ textTransform:'capitalize' }} className="rounded-full bg-[#1E1F22] px-3 py-1 text-xs border border-[#2A2B2F] text-[#BFBFBF]">
              {ws.permissionType}
            </span>
          </div>
        );
      })}
    </div>
  );
}
