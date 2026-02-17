import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";
import closeIcon from "../../assets/svgs/close-with-circle.svg";
import {
  addUserToProjectApi,
  removeUserFromProjectApi,
} from "../../services/api";
import RemoveAccessModal from "./RemoveAccessModal";

export default function AssignEditorsModal({
  open,
  onClose,
  permissions = [],
  projectID,
  onRefresh,
  projectAccess
}) {
  const people = useMemo(() => mapPermissions(permissions), [permissions]);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    if (!showDropdown) return;

    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const filtered = useMemo(() => {
    if (!query) return people;
    const q = query.toLowerCase();
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [query, people]);

  const toggle = (person) => {
    setSelected((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  };

  const handleAssign = async () => {
    await Promise.all(
      selected.map((p) =>
        addUserToProjectApi(projectID, p.email)
      )
    );

    setSelected([]);
    setQuery("");
    setShowDropdown(false);
    onRefresh?.();
  };

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
      overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      className="outline-none"
    >
      <div
        className="relative w-[520px] rounded-[28px] bg-[#050506] border border-[#24262A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-3">
          <h2 className="text-[18px] font-medium">
            Assign member
          </h2>
          <p className="text-[13px] text-[#A1A1A1] mt-1">
            Select one or more editors who should work on this
            project.
          </p>
        </div>

        <img
          src={closeIcon}
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer"
        />

        {/* Search */}
        <div className="px-6 mt-6 relative" ref={dropdownRef}>
          <div className="rounded-2xl border border-[#1E1F22] bg-[#0F1011] p-2">
            {/* Selected chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {selected.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-[#1B1C1E] rounded-full px-3 py-1 text-[12px]"
                >
                  <img
                    src={p.avatar}
                    className="w-4 h-4 rounded-full"
                  />
                  <span>{p.email}</span>
                  <button
                    onClick={() => toggle(p)}
                    className="cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              value={query}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className="w-full bg-transparent outline-none text-sm text-white placeholder-[#6B6B6B]"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
          {/* Dropdown */}
          {showDropdown && (
            <div style={{ width:"92%"}} className="absolute left-5 right-0 top-full mt-2 z-50">
              <div className="max-h-56 overflow-auto no-scrollbar rounded-2xl border border-[#1F2023] bg-black shadow-xl">
                {filtered.map((p) => {
                  const active = selected.some(
                    (s) => s.id === p.id
                  );
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#141517]
                        ${active ? "bg-[#141517]" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          className="w-9 h-9 rounded-md"
                        />
                        <div>
                          <div className="text-[13px]">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-[#8A8A8A]">
                            {p.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#BFBFBF]">
                        {p.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* People with access */}
        <div className="px-7 mt-4">
          <h4 className="text-sm mb-3 text-white/80">
            People assigned to this project
          </h4>
          <div className="space-y-3">
            {projectAccess.map((p) => {
              return <>
                <div
                  key={p._id}
                  className="flex items-center justify-between"
                >
                  <div className="text-xs text-white/50">
                    {p.email}
                  </div>

                  {p.role !== "Owner" && (
                    <button
                      onClick={() => setRemoveTarget(p.email)}
                      className="w-7 h-7 cursor-pointer rounded-full bg-[#1E1F22] flex items-center justify-center hover:bg-white/10"
                    >
                      ×
                    </button>
                  )}
                </div>
              </>
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

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end cursor-pointer">
          <button
            onClick={handleAssign}
            disabled={!selected.length}
            className="px-8 py-2 rounded-full bg-[#F9EF38] text-black font-medium disabled:opacity-40"
          >
            Assign
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* helpers */
function mapPermissions(permissions = []) {
  return permissions
    .filter(p => p.permissionType !== "owner")   // ⭐ remove owner
    .map((p) => ({
      id: p._id,
      name: p.name || p.email?.split("@")[0],
      email: p.email,
      role:
        p.permissionType === "member"
          ? "Team member"
          : "Collaborator",
      avatar: `https://i.pravatar.cc/64?u=${p.email}`,
    }));
}

