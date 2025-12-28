import Modal from "react-modal";
import { Confetti } from "../../assets/svgs/SvgComponents";

export default function RemoveAccessModal({
  open = false,
  onClose = () => {},
  title,
  description,
  buttonText,
  handleRemove,
}) {
  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      overlayClassName="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60"
      className="outline-none"
      aria={{
        modal: true,
      }}
    >
      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-[20px] bg-[#131313] text-white border border-[#24262A] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* subtle inner glow / vignette */}
        <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(255,255,255,0.06),rgba(0,0,0,0)_55%)]" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute z-10 cursor-pointer right-3.5 top-3.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#202226] text-white/70 hover:text-white"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          {/* Title */}
          <h2
            style={{ fontFamily: "Gilroy-SemiBold", fontSize: 18 }}
            className="mt-5 text-lg sm:text-xl font-semibold"
          >
            {title}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "Gilroy-Light",
              width: "75%",
              margin: "10px auto",
            }}
            className="text-sm text-[#BFBFBF]"
          >
            {description}
          </p>

          {/* CTA */}
          <button
            onClick={handleRemove}
            style={{ width: 210 }}
            className="cursor-pointer mt-6 rounded-full bg-[#F9EF38] py-3 text-sm font-medium text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F9EF38]/40"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
