import React, { useEffect, useState } from "react";
import "./WorkspaceSettings.css";
import OutlineInput from "../../../textInputs/OutlineInput";
import lock from "../../assets/icons/lock.svg";
import lockgray from "../../assets/icons/lockgray.svg";
import EditableAvatar from "../../components/EditAvatar/EditableAvatar";
import BrandColorPicker from "../../components/BrandColor/BrandColorPicker";
import Button from "../../../UI/Button";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import { updateWorkspaceApi } from "../../../../services/api";

const WorkspaceSettings = () => {
  const {
    activeWorkspace,
    refreshWorkspace,
  } = useWorkspace();

  const [workspaceName, setWorkspaceName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log(activeWorkspace, 'activeWorkspace');
  
  // 🔁 Prefill data
  useEffect(() => {
    if (!activeWorkspace) return;

    setWorkspaceName(activeWorkspace.name || "");
    setLogoUrl(activeWorkspace.logo?.url || null);
  }, [activeWorkspace]);

  const handleSave = async () => {
    if (!activeWorkspace?._id) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("workspaceName", workspaceName);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await updateWorkspaceApi(activeWorkspace._id, formData);

      // 🔥 refresh workspace list + active workspace
      await refreshWorkspace();
    } catch (err) {
      console.error("Failed to update workspace", err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <div>
      <div className="text-2xl font-bold pb-4 text-[#ffffff]">
        Workspace settings
      </div>

      <div>Edit your workspace name and customize the tool to your brand.</div>
      <br />

<OutlineInput
  label="Workspace Name"
  placeholder="A2Z Studio"
  value={workspaceName}
  onChange={(e) => setWorkspaceName(e.target.value)}
  styles={{
    border: "2px solid #2a2a2a",
    width: "80%",
    padding: "24px",
  }}
/>


      <br />

      <div className="w-[80%] pt-6 pl-6 pb-4 border-[#2a2a2a] border-2 rounded-lg bg-[#131313]">
        <div className="flex justify-between mb-4">
          <div>Logo</div>
          <div className="bg-[yellow] p-1 rounded-md mr-4">
            <img height="20" width="20" src={lock} alt="" />
          </div>
        </div>

        <EditableAvatar
          imageUrl={logoUrl}
          onImageSelect={setLogoFile}
        />

        <br />
        <BrandColorPicker />
      </div>

      <div className="domain">
        <div className="domain-head">
          <div className="mr-4">Custom Domain</div>
          <Button
            content="coming soon"
            width="150px"
            bgColor="yellow"
            textColor="black"
          />
        </div>

        <div className="relative mt-[-8px]">
          <OutlineInput
            placeholder="www.review.A2Zstudio.com"
            styles={{
              border: "2px solid #2a2a2a",
              width: "100%",
              padding: "24px",
            }}
          />
          <img
            className="absolute bottom-[14px] right-4"
            height="24"
            width="22"
            src={lockgray}
            alt=""
          />
        </div>

        <div className="flex justify-end mt-8">
          <Button
            width="120px"
            content="Cancel"
            textColor="white"
            bgColor="black"
            marginRight="8px"
            onClick={() => {
              setWorkspaceName(activeWorkspace.workspaceName || "");
              setLogoFile(null);
              setLogoUrl(activeWorkspace.logo?.url || null);
            }}
          />
          <Button
            width="120px"
            content={loading ? "Saving..." : "Save"}
            textColor="black"
            bgColor="yellow"
            disabled={loading}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;