import { useState } from "react";

export default function GuestIdentityModal({
  open,
  onClose,
  onContinue,
  error = "",
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[520px] rounded-[28px] bg-[#050506] border border-[#24262A] shadow-[0_30px_120px_rgba(0,0,0,0.9)] px-8 pt-7 pb-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#111214] hover:bg-white/10 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-[22px] font-medium text-white">
          Tell us who you are
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
          We use your name to show who left the comment and your email to notify
          you of replies.
        </p>

        {/* Name */}
        <div className="mt-6">
          <label className="block text-sm mb-2 text-white/80">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full h-[48px] rounded-2xl bg-[#0F1011] border border-[#1F2023] px-4 text-sm outline-none placeholder-white/30 focus:border-white/30"
          />
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className="block text-sm mb-2 text-white/80">
            Email ID
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email id"
            className="w-full h-[48px] rounded-2xl bg-[#0F1011] border border-[#1F2023] px-4 text-sm outline-none placeholder-white/30 focus:border-white/30"
          />
        </div>

        {/* Password */}
        {/* <div className="mt-4">
          <label className="block text-sm mb-2 text-white/80">
            Please enter the password shared with you
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className={`
                w-full h-[48px] rounded-2xl bg-[#0F1011]
                border px-4 pr-12 text-sm outline-none
                placeholder-white/30
                ${error ? "border-red-500/60" : "border-[#1F2023]"}
                focus:border-white/30
              `}
            />

            <button
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[13px] text-red-400">
              {error}
            </p>
          )}
        </div> */}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="
              flex-1 h-[48px] rounded-full
              border border-[#2A2B2F]
              text-white/60 hover:bg-white/5
            "
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onContinue({ name, email, password })
            }
            className="
              flex-1 h-[48px] rounded-full
              bg-[#F9EF38] text-black font-medium
              hover:brightness-95
            "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
