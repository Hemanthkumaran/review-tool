import { createPortal } from "react-dom";
import { Confetti } from "../../assets/svgs/SvgComponents";

export default function SubscriptionModal({
  open = false,
  onClose = () => {},
  title = "",
  subtitle = "",
  buttonTitle = "",
  ModalImg = <Confetti/>,
  onBtnClick,
  showBtn = true
}) {
  
  if (!open) return null;

  return createPortal(
    <div
      // className="fixed inset-0 z-50 flex items-center justify-center p-4"
      className="fixed left-0 right-0 bottom-0 top-[72px] z-40 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute left-0 right-0 bottom-0 top-[72px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-[20px] bg-[#131313] text-white border border-[#24262A] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* subtle inner glow / vignette */}
        <div className="cursor-pointer absolute inset-0 rounded-[20px] bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(255,255,255,0.06),rgba(0,0,0,0)_55%)]" />
        {/* Close button */}
        {/* <button
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer absolute right-3.5 top-3.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#202226] text-white/70 hover:text-white"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button> */}
        {/* Content */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          {/* Icon badge */}
          <div className="mx-auto mb-5 flex items-center justify-center">
            {ModalImg}
          </div>
          {/* Title */}
          <h2 style={{ fontFamily:"Gilroy-SemiBold", fontSize:18  }} className="text-lg sm:text-xl font-semibold">
            {title}
          </h2>
          {/* Subtitle */}
          <p style={{ marginTop:-10 }} className="text-sm text-[#BFBFBF]">
            {subtitle}
          </p>
          {/* CTA */}
          {showBtn && <button
            onClick={onBtnClick}
            className="mt-6 w-full cursor-pointer rounded-full bg-[var(--brand-color)] px-6 py-3 text-sm font-medium text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F9EF38]/40"
          >
            {buttonTitle}
          </button>}
        </div>
      </div>
    </div>,
    document.body
  );
}
