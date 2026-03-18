import Button from "../UI/Button";
import cancelIcon from "../../assets/svgs/cancel.svg";
import uploadIcon from "../../assets/svgs/upload.svg";
import trashIcon from "../../assets/svgs/trash.svg";
import { useRef, useState } from "react";
import Modal from "react-modal";
import OutlineInput from "../textInputs/OutlineInput";
import { useWorkspace } from "../../context/WorkspaceContext";

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

export function formatShortDuration(secondsInput) {
  if (!secondsInput || secondsInput <= 0) return "0 sec";

  const totalSeconds = Math.round(secondsInput);

  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes} min`;
}

const AddProjectModal = ({ isOpen, onClose, handleCreate, createLoading }) => {
  const [projectName, setProjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { brandingColor } = useWorkspace();

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setVideoDuration(null);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }

    setSelectedFile(file);
    setVideoDuration(null);

    // compute duration using a temporary video element
    const blobUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = blobUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoDuration(formatShortDuration(duration));
      URL.revokeObjectURL(blobUrl);
    };
  };

const handleDrop = (e) => {
  e.preventDefault();
  setDragOver(false);

  const file = e.dataTransfer.files[0];
  handleFileSelect(file);
};

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const onCreateClick = () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }
    // pass both name + video file (can be null)
    handleCreate(projectName.trim(), selectedFile);
  };

  // const disableCreate = !projectName.length || selectedFile == null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={250}
      style={modalStyles}
      shouldCloseOnOverlayClick={true}
    >
      <div
        style={{
          background: "#131313",
          border: "1px solid #262626",
          padding: "30px",
          borderRadius: 30,
        }}
      >
        <div className="head">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                paddingBottom: "4px",
                fontFamily: "Gilroy-SemiBold",
                fontSize: 18,
                marginTop: 5,
              }}
            >
              Add project
            </div>
            <img
              onClick={onClose}
              className="cursor-pointer"
              style={{ marginTop: -30, marginRight: -10 }}
              src={cancelIcon}
              alt=""
            />
          </div>
          <div
            style={{
              fontFamily: "Gilroy-Light",
              fontSize: 14,
            }}
          >
            Give a name for the project and optionally upload the video
          </div>
        </div>

        {/* project name */}
        <div className="mt-3">
          <OutlineInput
            label="Project name *"
            placeholder=""
            name="projectName"
            styles={{ borderColor: "#2B2B2B" }}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        {/* video upload */}
        <div className="mt-3">
          <div
            style={{
              fontFamily: "Gilroy-Light",
              paddingBottom: "8px",
              fontSize: 14,
            }}
          >
            Upload project file (Optional)
          </div>

    {/* hidden file input */}
    <input
      ref={fileInputRef}
      type="file"
      accept="video/*"
      className="hidden"
      onChange={handleInputChange}
    />

    {/* IF NO FILE: show dropzone */}
    {!selectedFile && (
      <div
        style={{
          padding: "24px 0",
          border: dragOver ? "2px solid var(--brand-color)" : "2px dotted gray",
          borderRadius: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: dragOver ? "#181818" : "transparent",
          transition: "border-color 0.15s ease, background 0.15s ease",
        }}
        onClick={handleClickUpload}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <img src={uploadIcon} alt="" />
        <div
          style={{
            marginTop: "8px",
            fontFamily: "Gilroy-Light",
            fontSize: 13,
            color: "#E5E5E5",
          }}
        >
          <span
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              color: "var(--brand-color)",
            }}
          >
            Click to upload
          </span>{" "}
          or drag and drop
        </div>
      </div>
    )}

  {/* IF FILE SELECTED: show blue card like design */}
  {selectedFile && (
    <div
      style={{
        marginTop: 4,
        borderRadius: 24,
        border: "1px solid #2B8AFF",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#121212",
      }}
    >
      <div>
<div
  style={{
    fontFamily: "Gilroy-Light",
    fontSize: 16,
    color: "#FFFFFF",
    maxWidth: "200px",       // 🔑 required
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {selectedFile.name}
</div>
        {videoDuration && (
          <div
            style={{
              marginTop: 4,
              fontFamily: "Gilroy-Light",
              fontSize: 14,
              color: "#BFBFBF",
            }}
          >
            {videoDuration}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleClearFile}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* use your trash icon asset here */}
        <img
          src={trashIcon}
          alt="Remove file"
          style={{ width: 20, height: 20, opacity: 0.6 }}
        />
      </button>
    </div>
  )}
</div>


        {/* actions */}
        <div className="mt-5 flex">
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
            bgColor={brandingColor}
            onClick={onCreateClick}
            loading={createLoading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddProjectModal;
