import Button from "../UI/Button";
import Card from "../UI/Card";
import cancelIcon from "../../assets/svgs/cancel.svg";
import uploadIcon from "../../assets/svgs/upload.svg";
import { useState } from "react";
import Modal from "react-modal";
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

const AddProjectModal = (isOpen, onClose, handleCreate) => {

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
            <div style={{ paddingBottom: "4px", fontFamily:'Gilroy-SemiBold', fontSize:18, marginTop:5 }}>Add project</div>
            <img onClick={onClose} className="cursor-pointer" style={{ marginTop:-30, marginRight:-10}} src={cancelIcon} alt="" />
          </div>
          <div style={{ fontFamily:"Gilroy-Light", fontSize:14 }}>Give a name for the project and optionally upload the video</div>
        </div>
        <div className="mt-3">
          <OutlineInput
            label='Project name *'
            placeholder=""
            name="folderName"
            styles={{ borderColor:"#2B2B2B"}}
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>
        {/* upload project file */}
        <div className="mt-3">
          <div style={{ fontFamily:"Gilroy-Light", paddingBottom: "8px", fontSize:14 }}>
            Upload project file (Optional)
          </div>
          <div
            style={{
              padding: "24px 0",
              border: "2px dotted gray",
              borderRadius: "8px",
              display:"flex",
              flexDirection:"column",
              alignItems:"center"
            }}
          >
            <img src={uploadIcon} alt="" />
            <div style={{marginTop:"8px"}}> <a href="#">Click to upload</a> or drag and drop</div>
          </div>
        </div>
        <div className="mt-5">
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
            content="Create project"
            width="180px"
            textColor="black"
            bgColor="yellow"
            onClick={() => handleCreate(folderName)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddProjectModal;
