import { useEffect, useMemo, useState } from "react";
import Select, { components as SelectComponents } from "react-select";
import Modal from "react-modal";


import closeCircle from "../../assets/svgs/close-with-circle.svg"
import RemoveAccessModal from "./RemoveAccessModal";
import { addUserToProjectApi, removeUserFromProjectApi, updateReviewerPasswordApi } from "../../services/api";
import { constants } from "../../helpers/enum";
import PublicLinkAccessCard from "../PublicLinkAccessCard";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../helpers/showToast";
import { useWorkspace } from "../../context/WorkspaceContext";
import { reactSelectStyles, reactSelectStyles2 } from "../../styles/reactSelectStyles";
import { getInitials } from "../../helpers/common";


const CustomMultiValue = (props) => {
  const { data, innerProps, removeProps } = props;

  return (
    <div
      {...innerProps}
      className="flex items-center gap-2 px-2 py-[4px]"
      style={{ background: "#212121", borderRadius: 25 }}
    >
      {data.avatar && (
        <img
          src={data.avatar}
          alt={data.name}
          className="w-5 h-5 rounded-full object-cover"
        />
      )}

      <span
        className="truncate text-white"
        style={{ fontFamily: "Gilroy-Light", fontSize: 12 }}
      >
        {data.email}
      </span>

      {/* this is the ONLY X now */}
      <button
        type="button"
        {...removeProps}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 hover:bg-white/10"
      >
        <span
          style={{ fontFamily: "Gilroy-Light", fontSize: 14 }}
          className="text-white/80 leading-none"
        >
          ×
        </span>
      </button>
    </div>
  );
};

export default function ShareModal({ projectDetail = null, open = true, onClose, permissions, projectAccess, projectID, onRefresh }) {
  const [role, setRole] = useState(null);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [copied, setCopied] = useState(false);

  const { activeWorkspace, ownerWorkspacePlan } = useWorkspace();
  const activePlan = ownerWorkspacePlan?.subscription?.activePlan;
  
  useEffect(() => {
    if (projectDetail?.isPasswordProtected !== undefined) {
      setPasswordRequired(projectDetail.isPasswordProtected);
    }
  }, [projectDetail]);

  const roleOptions = useMemo(() => {
    if (activePlan === "freelancer") {
      return [{ value: "reviewer", label: "Reviewer" }];
    }

    if (activePlan === "team") {
      return [{ value: "reviewer", label: "Reviewer" }, { value: "team", label: "Team member" }];
    }
    if (activePlan === "team_plus") {
      return [
        { value: "collaborator", label: "Collaborator" },
        { value: "reviewer", label: "Reviewer" },
        { value: "team", label: "Team member" }
      ];
    }

    return [];
  }, [activePlan]);


  useEffect(() => {
    if (roleOptions.length > 0) {
      setRole(roleOptions[0]);
    }
  }, [roleOptions]);

  

const handleTogglePassword = async () => {
  if (!passwordRequired) {
    // 🔥 Turning ON → just UI
    setPasswordRequired(true);
    return;
  }

  // 🔥 Turning OFF → call API
  try {
    await updateReviewerPasswordApi(projectID, {
      isPasswordProtected: false,
    });

    setPasswordRequired(false);
    showSuccessToast("Password removed");

    onRefresh();
  } catch (err) {
    console.error(err);
    showErrorToast(getApiErrorMessage(err, "Failed to remove password"));
  }
};
  
const emailOptions = (permissions || [])
  .filter((p) => p.permissionType !== "owner") // 🚫 exclude owner
  .map((p) => ({
    value: p.email,
    label: p.email,
    ...p,
  }));

const handleSavePassword = async (password) => {
  try {
    await updateReviewerPasswordApi(projectID, {
      isPasswordProtected: true,
      reviewerPassword: password,
    });
    onRefresh();
    showSuccessToast("Password saved");
  } catch (err) {
    console.error(err);
    showErrorToast(getApiErrorMessage(err, "Failed to save password"));
  }
};

  const handleShare = async () => {
    try{
      await Promise.all(
        selectedPeople.map((p) =>
          addUserToProjectApi(projectID, p.email)
        )
      );

      setSelectedPeople([]);
      onRefresh?.();
      showSuccessToast("Project access updated");
    } catch(e) {
      showErrorToast(getApiErrorMessage(e, "Failed to share project"));
    }

  };

  async function handleCopy() {
    const url = `${window.location.origin}/video-review/${projectID}?ws=${
      activeWorkspace?._id
    }&color=${encodeURIComponent(
      activeWorkspace?.colourCode || ""
    )}&passwordRequired=${passwordRequired}`;

    try {
      await navigator.clipboard.writeText(url);
      showSuccessToast("Review link copied");
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000); // 2 seconds
    } catch (err) {
      showErrorToast(getApiErrorMessage(err, "Failed to copy review link"));
    }
  }

  const handleRemove = async (email) => {
    try {
      await removeUserFromProjectApi(projectID, email);
      onRefresh?.();
      showSuccessToast("Project access removed");
    } catch (err) {
      showErrorToast(getApiErrorMessage(err, "Failed to remove project access"));
    }
  };

  function handleXBtn(p) {
    if (p.userData.role == "member") {
      handleRemove(p.email);
    } else {
      setRemoveTarget(p.email);
    }
  }
  
  return (
      <Modal
        isOpen={open}
        onRequestClose={onClose}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        className="outline-none"
        aria={{ modal: true }}
      >
      <div onClick={(e) => e.stopPropagation()} className="w-[500px] bg-[#131313] rounded-[32px] border border-[#27272F] shadow-2xl text-gray-100 relative overflow-hidden">
        {/* header */}
        <div className="flex items-start justify-between px-8 pt-6 pb-4">
          <div>
            <div style={{ fontFamily:'Gilroy-SemiBold' }} className="text-[18px] mb-1">
              Share this project
            </div>
            <p style={{ fontFamily:'Gilroy-Light', fontSize:14, width:"90%" }} className="text-[#BFBFBF]">
              Invite a collaborator or reviewer to join in. Users added as Team members will have to access to this project already.
            </p>
          </div>
        </div>
        <img style={{ position:'absolute', right:15, top:15, cursor:'pointer' }} onClick={onClose} src={closeCircle}/>
        {/* Share with + role select */}
        <div className="px-8 pb-3 flex items-center gap-2">
          <span style={{ fontFamily:'Gilroy-Light', fontSize:14 }} className="text-[#fff]">Share with a:</span>
          <div className="w-[135px]">
            <Select
              value={role}
              onChange={setRole}
              options={roleOptions}
              styles={reactSelectStyles}
              isSearchable={false}
              components={{ IndicatorSeparator: () => null }}
            />
          </div>
        </div>
        {/* email input + Share button */}
        {
          // (role?.value === constants.COLLABORATOR && activePlan === "team_plus") ?
          (role?.value === constants.COLLABORATOR || role?.value === 'team') ?
          <div className="px-6 pb-2 flex items-center gap-3">
            <div className="flex-1">
              <Select
                  styles={reactSelectStyles2}
                  value={selectedPeople}
                  onChange={(opts) => setSelectedPeople(opts || [])}
                  options={emailOptions}
                  placeholder="Enter name or email"
                  isMulti
                  menuPlacement="auto"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  components={{
                    MultiValue: CustomMultiValue,
                    DropdownIndicator: () => null,
                    ClearIndicator: () => null,
                    IndicatorSeparator: () => null,
                      MenuList: (props) => (
                      <SelectComponents.MenuList {...props} className="no-scrollbar" />
                    ),
                  }}
                  
                  getOptionLabel={(option) => `${option.name} ${option.email}`}
                  getOptionValue={(option) => option.email}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {option?.profileImage?.url ? <img
            src={option?.profileImage?.url}
            style={{ borderRadius:5 }}
            className="w-8 h-8 object-cover"
          /> : 
          <div style={{ borderRadius:5 }} className="flex items-center justify-center w-8 h-8 bg-[#151618]">{getInitials(option?.name)}</div>}
          <div>
                          <div
                            className="leading-tight text-[13px] text-white"
                            style={{ fontFamily: "Gilroy-Light" }}
                          >
                            {option.name}
                          </div>
                          <div
                            className="text-[11px] text-[#8A8A8A]"
                            style={{ fontFamily: "Gilroy-Light" }}
                          >
                            {option.email}
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-[11px] text-[#C7C7C7]"
                        style={{ fontFamily: "Gilroy-Light" }}
                      >
                        {option.permissionType}
                      </div>
                    </div>
                  )}
                />
            </div>
            <button
              type="button"
              onClick={handleShare}
              style={{ fontFamily:'Gilroy-Light', fontSize:14, opacity: selectedPeople?.length > 0 ? 1 : 0.5 }}
              disabled={selectedPeople?.length > 0 ? false : true}
              className="px-5 py-2 rounded-full bg-[#F9EF38] text-[#000] shadow-sm hover:brightness-105"
            >
              Invite
            </button>
          </div> :
          <PublicLinkAccessCard
            link={`${window.location.origin}/video-review/${projectID.slice(0, 1)}…`}
            passwordRequired={passwordRequired}
            onTogglePassword={handleTogglePassword}
            onCopy={handleCopy}
            copied={copied}
            onSavePassword={handleSavePassword}
          />
        }
        <div className="mx-6 h-px bg-[#26262E]" />

        <div className="px-6 py-3">
          <span style={{ fontFamily:'Gilroy-Light', fontSize:14}}>People with access</span>
          <div className="space-y-2 max-h-60 overflow-auto pb-2 no-scrollbar">
<div className="space-y-3 mt-3">
  {projectAccess?.map((p) => {
    // const role =
    //   p.permissionType === "owner"
    //     ? "Owner"
    //     : p.permissionType === "member"
    //     ? "Team member"
    //     : "Collaborator";

    return (
      <div
        key={p._id}
        className="flex items-center justify-between"
      >
        {/* LEFT: Avatar + Name + Email */}
        <div className="flex items-center gap-3">
          {p?.userData?.profileImage?.url ? <img
            src={p?.userData?.profileImage?.url}
            style={{ borderRadius:5 }}
            className="w-8 h-8 object-cover"
          /> : 
          <div style={{ borderRadius:5 }} className="flex items-center justify-center w-8 h-8 bg-[#151618]">{getInitials(p?.userData?.firstName)}</div>}
          <div>
            <div className="text-[13px] text-white leading-tight">
              {p?.userData?.firstName || "Pending"}
            </div>
            <div className="text-[11px] text-[#8A8A8A]">
              {p?.userData?.email}
            </div>
          </div>
        </div>

        {/* RIGHT: Role + Remove */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#C7C7C7]">
            {p?.userData?.role}
          </span>

          <button
            onClick={() => handleXBtn(p)}
            className="w-7 h-7 cursor-pointer rounded-full bg-[#1E1F22] flex items-center justify-center hover:bg-white/10"
          >
            ×
          </button>
        </div>
      </div>
    );
  })}
</div>
            <RemoveAccessModal
              open={!!removeTarget}
              onClose={() => setRemoveTarget(null)}
              title={`Remove ${removeTarget} from this project?`}
              description="They'll no longer be able to view or work on this project."
              buttonText="Remove access"
              handleRemove={async () => {
                await handleRemove(removeTarget);
                setRemoveTarget(null);
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
