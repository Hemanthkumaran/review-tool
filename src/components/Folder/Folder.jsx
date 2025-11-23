import React from "react";
import "./Folder.css";
import folderImg from "../../assets/svgs/folder.svg";
import videoIcon from "../../assets/svgs/video.svg";
import timerIcon from "../../assets/svgs/timer.svg";
import dot from "../../assets/svgs/dot.svg";

const Folder = ({ folderName }) => {
  return (
    <div className="main-box">
      <img className="full-box" src={folderImg} alt="" />
      <div className="small-box"></div>
      <div className="text-box">
        <div className="text-box-title">{folderName}</div>
        <div className="text-box-content">
          <div style={{ display: "flex", alignItems: "center" , marginRight:"4px"}} >
            <img
              style={{ paddingRight: "6px" }}
              height="16px"
              width="16px"
              src={videoIcon}
              alt=""
            />
            <div style={{ color:"#999999" }}>6 Projects</div>
          </div>
          <img style={{margin: "0px 6px", color:"#999999" }} src={dot} alt="" />
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>
              <img
                style={{ paddingRight: "6px" }}
                height="16px"
                width="16px"
                src={timerIcon}
                alt=""
              />
            </div>
            <div style={{ color:"#999999" }}>5 mins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
