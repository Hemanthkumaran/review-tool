import Modal from "react-modal";

export default function DeleteCommentModal({
  title = "Delete this comment?",
  description = "This comment will be removed permanently.",
  confirmText = "Delete",
  open,
  onCancel,
  onConfirm,
  loading = false,
}) {
  return (
    <Modal
      isOpen={open}
      onRequestClose={onCancel}
      shouldCloseOnOverlayClick={!loading}
      shouldCloseOnEsc={!loading}
      overlayClassName="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      className="outline-none"
    >
      <div className="w-full max-w-[520px] rounded-[28px] bg-[#0B0C0E] p-8 relative">
        {/* Close */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-5 top-5 w-10 h-10 rounded-full bg-[#1A1B1D] flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-40"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-[26px] font-semibold text-white">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-gray-400">
          {description}
        </p>

        {/* Actions */}
        <div className="mt-10 flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1 py-4 rounded-full
              border border-[#2A2B2F]
              text-gray-300 hover:bg-[#141516]
              disabled:opacity-40
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1 py-4 rounded-full
              bg-[#EF4444] text-white font-medium
              disabled:opacity-50
            "
          >
            {loading ? "Deleting…" : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
