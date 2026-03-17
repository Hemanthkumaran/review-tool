import { createPortal } from "react-dom";

export default function FeatureLockedModal({
  open = false,
  onClose = () => {},
  title = "Feature locked",
  subtitle = "",
  buttonTitle = "Activate add-on",
  onBtnClick = () => {},
  ModalImg,
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-[28px] bg-[#0F1012] border border-[#1F1F21] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1A1B1E] flex items-center justify-center text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* Content */}
        <div className="px-8 py-10 text-center">

          {/* Icon circle */}
          <div className="mx-auto mb-4 flex items-center justify-center w-28 h-28 rounded-full">
            {ModalImg}
          </div>

          {/* Title */}
          <div style={{ fontFamily:"Gilroy-Bold" }} className="text-xl text-white mb-3">
            {title}
          </div>

          {/* Subtitle */}
          <p style={{ fontFamily:"Gilroy-Light", fontSize:14 }} className="text-sm text-[#BFBFBF] leading-relaxed mb-8">
            {subtitle}
          </p>

          {/* CTA */}
          <button
            onClick={onBtnClick}
            className="rounded-full bg-[#F9EF38] py-3 px-10 cursor-pointer text-sm font-medium text-black hover:opacity-90"
          >
            {buttonTitle}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}