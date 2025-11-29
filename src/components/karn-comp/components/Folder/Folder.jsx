import React from "react";
import "./Folder.css";
import folderImg from "../../assets/icons/folder.svg";
import videoIcon from "../../assets/icons/video.svg";
import timerIcon from "../../assets/icons/timer.svg";
import dot from "../../assets/icons/dot.svg";

const Folder = () => {
  return (
    <div className="main-box">
      <img className="full-box" src={folderImg} alt="" />
      <div className="small-box"></div>
      <div className="text-box">
        <div className="text-box-title">ABC Projects</div>
        <div className="text-box-content">
          <div style={{ display: "flex", alignItems: "center" , marginRight:"4px"}} >
            <img
              style={{ paddingRight: "6px" }}
              height="16px"
              width="16px"
              src={videoIcon}
              alt=""
            />
            <div>6 Projects</div>
          </div>
          <img style={{margin: "0px 6px"}} src={dot} alt="" />
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
            <div>5 mins</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
