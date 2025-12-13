import { useEffect, useRef } from "react";

import headsetIcon from '../assets/svgs/headset.svg';
import logoutIcon from '../assets/svgs/logout.svg';
import requestIcon from '../assets/svgs/request.svg';
import settingsIcon from '../assets/svgs/settings.svg';
import ticketIcon from '../assets/svgs/ticket.svg';

export default function ProfileMenu({ onClose }) {
  const menuRef = useRef(null);

  // click outside
  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const Item = ({ icon, label, danger }) => (
    <button
      className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left
        ${danger ? "text-red-400 hover:bg-red-500/10" : "text-[#C3C3C3] hover:bg-white/5"}
      `}
    >
      <span className="w-5 h-5 flex items-center justify-center opacity-80">
        {icon}
      </span>
      {label}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="
        absolute right-0 top-[52px] w-[260px]
        rounded-2xl bg-[#0B0B0C]
        border border-[#202124]
        shadow-[0_12px_40px_rgba(0,0,0,0.6)]
        backdrop-blur-xl
        z-50
      "
    >
      <div className="py-2">
        <Item label="Settings" icon={<img src={settingsIcon}/>} />
        <div style={{ background:"#2B2B2B", height:1 }} />
        <Item label="Raise a ticket" icon={<img src={ticketIcon}/>} />
        <Item label="Submit feature request" icon={<img src={requestIcon}/>} />
        <Item label="Talk to founders" icon={<img src={headsetIcon}/>} />
        <div style={{ background:"#2B2B2B", height:1 }} />
        <Item label="Log out" icon={<img src={logoutIcon}/>} />
      </div>
    </div>
  );
}
