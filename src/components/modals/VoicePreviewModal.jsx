import Modal from "react-modal";
import VoiceNotePlayer from "../videoPlayer/VoiceNotePlayer";

export default function VoicePreviewModal({
  isOpen,
  onClose,
  audioUrl
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-[#0f0f0f] rounded-2xl p-6 w-[420px] mx-auto mt-[20vh] outline-none"
      overlayClassName="fixed inset-0 bg-black/70 flex items-start justify-center z-100000"
    >
      <div className="flex justify-between items-center mb-4 ">
        <span className="text-sm text-gray-200 font-medium">
          {/* Voice note preview */}
        </span>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <VoiceNotePlayer src={audioUrl} />
    </Modal>
  );
}