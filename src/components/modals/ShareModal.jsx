// src/components/ShareModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Modal from "react-modal";


import closeCircle from "../../assets/svgs/close-with-circle.svg"
import RemoveAccessModal from "./RemoveAccessModal";
import { addUserToProjectApi, removeUserFromProjectApi, updateReviewerPasswordApi } from "../../services/api";
import { constants } from "../../helpers/enum";
import PublicLinkAccessCard from "../PublicLinkAccessCard";
import { showSuccessToast } from "../../helpers/showToast";
import { useWorkspace } from "../../context/WorkspaceContext";
import { reactSelectStyles, reactSelectStyles2 } from "../../styles/reactSelectStyles";

const ROLE_OPTIONS = [
  { value: "collaborator", label: "Collaborator" },
  { value: "reviewer", label: "Reviewer" },
];



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

export default function ShareModal({ projectDetail = null, open = true, onClose, permissions, projectID, onRefresh }) {
  const [role, setRole] = useState(ROLE_OPTIONS[1]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);

  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    if (projectDetail?.isPasswordProtected !== undefined) {
      setPasswordRequired(projectDetail.isPasswordProtected);
    }
  }, [projectDetail]);

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
    alert("Failed to update");
  }
};
  
const emailOptions = (permissions || [])
  .filter((p) => p.permissionType !== "owner") // 🚫 exclude owner
  .map((p) => ({
    value: p.email,
    label: p.email,
    ...p,
  }));

const filteredSuggestions = useMemo(() => {
  const query = inputValue.toLowerCase();
  if (!query) return [];

  return (permissions || [])
    .filter(
      (p) =>
        p.permissionType !== "owner" && // ✅ exclude owner
        (
          p.email.toLowerCase().includes(query) ||
          (p.name || "").toLowerCase().includes(query) // ✅ optional improvement
        )
    )
    .slice(0, 3);
}, [inputValue, permissions]);

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
    alert("Failed to save password");
  }
};

  const handleShare = async () => {
    await Promise.all(
      selectedPeople.map((p) =>
        addUserToProjectApi(projectID, p.email)
      )
    );

    setSelectedPeople([]);
    onRefresh?.();
  };


  // function handleCopy() {
    
  //   const url = `${window.location.origin}/video-review/${projectID}?ws=${activeWorkspace?._id}&color=${encodeURIComponent(activeWorkspace?.colourCode || "")}`;
  //   navigator.clipboard.writeText(url);
  //   showSuccessToast("Link copied!");
  // }

  function handleCopy() {
    const url = `${window.location.origin}/video-review/${projectID}?ws=${
      activeWorkspace?._id
    }&color=${encodeURIComponent(
      activeWorkspace?.colourCode || ""
    )}&passwordRequired=${passwordRequired}`;

    navigator.clipboard.writeText(url);
    showSuccessToast("Link copied!");
  }

  const handleRemove = async (email) => {
    await removeUserFromProjectApi(projectID, email);
    onRefresh?.();
  };
  
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
              options={ROLE_OPTIONS}
              styles={reactSelectStyles}
              isSearchable={false}
              components={{ IndicatorSeparator: () => null }}
            />
          </div>
        </div>
        {/* email input + Share button */}
        {
          role.value == constants.COLLABORATOR ?
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
                      <components.MenuList {...props} className="no-scrollbar" />
                    ),
                  }}
                  
                  getOptionLabel={(option) => `${option.name} ${option.email}`}
                  getOptionValue={(option) => option.email}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={option.avatar}
                          alt={option.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
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
                        {option.role}
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
            onSavePassword={handleSavePassword}
          />
        }
        {/* suggestions dropdown card */}
        {filteredSuggestions?.length > 0 && (
          <div className="px-6">
            <div className="bg-black rounded-2xl border border-[#222229] mt-2 mb-3 max-h-44 overflow-auto">
              {filteredSuggestions.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-[#15151B] ${
                    idx === 0 ? "rounded-t-2xl" : ""
                  } ${idx === filteredSuggestions?.length - 1 ? "rounded-b-2xl" : ""}`}
                  onClick={() =>
                    setSelectedEmail({ value: p.email, label: p.email })
                  }
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="leading-tight">{p.name}</div>
                      <div className="text-[11px] text-gray-500">
                        {p.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {p.role}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* divider */}
        <div className="mx-6 h-px bg-[#26262E]" />

        {/* current members */}
        <div className="px-6 py-3">
            <span style={{ fontFamily:'Gilroy-Light', fontSize:14}}>People with access</span>
          <div className="space-y-2 max-h-60 overflow-auto pb-2 no-scrollbar">
            {/* <div
                className="flex items-center justify-between text-[13px] mt-3 mb-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={PEOPLE[0].avatar}
                    alt={PEOPLE[0].name}
                    className="w-8 h-8 rounded-sm object-cover"
                  />
                  <div>
                    <div className="leading-tight">{PEOPLE[0].name}</div>
                    <div className="text-[11px] text-gray-500">
                      {PEOPLE[0].email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-300">
                  <span>{'Owner'}</span>
                </div>
              </div> */}
            <div className="space-y-3">
              {permissions
                ?.filter((p) => p.permissionType !== "owner") // 👈 remove owner completely
                .map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between"
                  >
                    <div className="text-xs text-white/50">
                      {p.email}
                    </div>

                    <button
                      onClick={() => setRemoveTarget(p.email)}
                      className="w-7 h-7 cursor-pointer rounded-full bg-[#1E1F22] flex items-center justify-center hover:bg-white/10"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
