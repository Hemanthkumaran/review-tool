import { Dialog } from "@headlessui/react";
import { useState } from "react";

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "DELETE",
  confirmLabel = "Delete permanently",
  onConfirm,
}) {
  const [value, setValue] = useState("");

  const canDelete = value === confirmText;

  return (
    <Dialog open={open} onClose={onOpenChange} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="
            w-full max-w-lg
            rounded-3xl
            bg-[#0B0B0C]
            border border-[#202124]
            p-6
            shadow-[0_30px_80px_rgba(0,0,0,0.8)]
          "
        >
          <Dialog.Title className="text-xl text-white mb-2">
            {title}
          </Dialog.Title>

          <p className="text-sm text-gray-400 mb-6">
            {description}
          </p>

          <p className="text-sm mb-2 text-gray-300">
            Type “{confirmText}” to confirm
          </p>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type confirmation"
            className="
              w-full
              bg-[#111216]
              border border-[#2A2B2F]
              rounded-xl
              px-4 py-3
              text-white
              outline-none
              mb-6
            "
          />

          <div className="flex justify-between gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="
                flex-1
                rounded-full
                border border-[#2A2B2F]
                px-6 py-3
                text-gray-300
                hover:bg-white/5
                cursor-pointer
              "
            >
              Cancel
            </button>

            <button
              disabled={!canDelete}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="
              cursor-pointer
                flex-1
                rounded-full
                bg-[#FF3030]
                px-6 py-3
                text-white
                font-medium
                disabled:opacity-40
              "
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
