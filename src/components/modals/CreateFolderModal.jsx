// CreateFolderModal.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import Button from "../UI/Button";
import cancelIcon from "../../assets/svgs/cancel.svg";
import OutlineInput from "../textInputs/OutlineInput";


const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 2000,
  },
  content: {
    inset: "50% auto auto 50%",
    transform: "translate(-50%, -50%)",
    padding: 0,
    border: "none",
    background: "transparent",
    overflow: "visible",
  },
};

export default function CreateFolderModal({ isOpen, onClose, handleCreate }) {

  const [folderName, setFolderName] = useState("");

  return (
    <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        closeTimeoutMS={250}
        style={modalStyles}
        shouldCloseOnOverlayClick={true}
    >
      <div style={{ background: "#131313", border:"1px solid #262626", padding:"30px", borderRadius:30 }}>
        <div className="head">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ paddingBottom: "4px", fontFamily:"Gilroy-SemiBold", fontSize:18 }}>Create folder</div>
            <img onClick={onClose} className="cursor-pointer" src={cancelIcon} alt="" />
          </div>
          <div style={{ color:"#BFBFBF", fontSize:14 }}>Create a dedicated workspace for your client.</div>
        </div>
        <div className="mt-3">
            <OutlineInput
              label='Folder name'
              placeholder="Enter folder name"
              name="folderName"
              styles={{ borderColor:"#2B2B2B"}}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
        </div>
        <div className="mt-6">
          <Button
            onClick={onClose}
            content="Cancel"
            width="180px"
            textColor="white"
            bgColor="#131313"
            border="1px solid #2B2B2B"
            marginRight="24px"
          />
          <Button
            content="Create"
            width="180px"
            textColor="black"
            bgColor="yellow"
            onClick={() => handleCreate(folderName)}
          />
        </div>
      </div>
    </Modal>
  );
}
