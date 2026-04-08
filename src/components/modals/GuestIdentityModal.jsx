import { useState } from "react";

export default function GuestIdentityModal({
  open,
  onClose,
  onContinue,
  error = "",
  requirePassword = false,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!open) return null;

  // ✅ validators
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name is too short";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (requirePassword && !password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    onContinue({ name, email, password });
  };

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

        <h2 className="text-[22px] font-medium text-white">
          Tell us who you are
        </h2>

        <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
          We use your name to show who left the comment and your email to notify
          you of replies.
        </p>

        {/* Name */}
        <div className="mt-6">
          <label className="block text-sm mb-2 text-white/80">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className={`w-full h-[48px] rounded-2xl bg-[#0F1011] px-4 text-sm outline-none placeholder-white/30 focus:border-white/30 border ${
              errors.name ? "border-red-500/60" : "border-[#1F2023]"
            }`}
          />
          {errors.name && (
            <p className="mt-2 text-[13px] text-red-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className="block text-sm mb-2 text-white/80">Email ID</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email id"
            type="email"
            className={`w-full h-[48px] rounded-2xl bg-[#0F1011] px-4 text-sm outline-none placeholder-white/30 focus:border-white/30 border ${
              errors.email ? "border-red-500/60" : "border-[#1F2023]"
            }`}
          />
          {errors.email && (
            <p className="mt-2 text-[13px] text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {requirePassword && (
          <div className="mt-4">
            <label className="block text-sm mb-2 text-white/80">
              Password
            </label>

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              type="password"
              className={`w-full h-[48px] rounded-2xl bg-[#0F1011] px-4 text-sm outline-none placeholder-white/30 focus:border-white/30 border ${
                errors.password ? "border-red-500/60" : "border-[#1F2023]"
              }`}
            />

            {errors.password && (
              <p className="mt-2 text-[13px] text-red-400">
                {errors.password}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 h-[48px] rounded-full border border-[#2A2B2F] text-white/60 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            onClick={handleContinue}
            className="flex-1 h-[48px] rounded-full bg-[#F9EF38] text-black font-medium hover:brightness-95"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}