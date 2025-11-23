import React from "react";
import "./ACard.css";
import messageIcon from "../../assets/icons/message.svg"
import dot from "../../assets/icons/dot.svg";

export default function ACard() {
  return (
    <div className="card">
      {/* Thumbnail */}
      <div className="card-img">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80"
          alt="placeholder"
        />

        <span className="version-badge">v2</span>
        <span className="time-badge">01:03</span>
      </div>

      {/* Title */}
      <h3 className="card-title">Logo introduction video</h3>

      {/* Meta row */}
      <div className="card-meta">
        <span className="meta-date">11 Sep 2025, 2:07pm</span>
        <img src={dot} style={{margin:"0 8px"}} alt="" />
        <div className="meta-comments">
          <img src={messageIcon} alt="" />
          <span>6</span>
        </div>
      </div>

      {/* Avatars */}
      <div className="avatar-row">
        <img className="avatar" src="https://i.pravatar.cc/40?img=11" alt="" />
        <img className="avatar" src="https://i.pravatar.cc/40?img=12" alt="" />
        <img className="avatar" src="https://i.pravatar.cc/40?img=13" alt="" />
        <img className="avatar" src="https://i.pravatar.cc/40?img=14" alt="" />

        <div className="add-avatar">+</div>

        <div className="client-toggle">
          <span>Client</span>
          <label className="switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Dropdown */}
      <div className="dropdown-wrapper">
        <select className="card-select">
          <option>Internal review</option>
          <option>In progress</option>
          <option>Completed</option>
        </select>
        <span className="select-arrow"></span>
      </div>
    </div>
  );
}
