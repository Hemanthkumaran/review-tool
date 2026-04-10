import { useEffect, useState } from "react";
import PasswordInput from "../textInputs/PasswordInput";

export default function GuestIdentityModal({
  open,
  onClose,
  onContinue,
  error = "",
  step = "identity",
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isPasswordStep = step === "password";

  useEffect(() => {
    setErrors({
      name: "",
      email: "",
      password: "",
    });
  }, [step, open]);

  useEffect(() => {
    setServerError(error);
  }, [error]);

  if (!open) return null;

  const validate = () => {
    const newErrors = {};

    if (isPasswordStep) {
      if (!password.trim()) {
        newErrors.password = "Password is required";
      }
    } else {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    if (isPasswordStep) {
      onContinue({ password: password.trim() });
      return;
    }

    onContinue({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[520px] rounded-[28px] bg-[#050506] border border-[#24262A] shadow-[0_30px_120px_rgba(0,0,0,0.9)] px-8 pt-7 pb-6">

        {!isPasswordStep && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#111214] hover:bg-white/10 flex items-center justify-center"
          >
            ✕
          </button>
        )}

        <h2 className="text-[22px] font-medium text-white">
          {isPasswordStep
            ? "This document is now password-protected."
            : "Tell us who you are"}
        </h2>

        <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
          {isPasswordStep
            ? ""
            : "We use your name to show who left the comment and your email to notify you of replies."}
        </p>

        {isPasswordStep ? (
          <div className="mt-6">
            <PasswordInput
              label="Please enter the password shared with you"
              placeholder="Enter password"
              name="reviewer-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (serverError) {
                  setServerError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleContinue();
                }
              }}
              labelClassName="text-white/80 font-normal"
              inputClassName="bg-[#0F1011] text-sm text-white placeholder-white/30 focus:border-white/30 border-[#1F2023]"
              inputStyle={{ height: 48, borderRadius: 16 }}
              hasError={!!errors.password || !!serverError}
            />

            {(errors.password || serverError) && (
              <p className="mt-2 text-[13px] text-red-400">
                {errors.password || serverError}
              </p>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-4">
          {!isPasswordStep && (
            <button
              onClick={onClose}
              className="flex-1 h-[48px] rounded-full border border-[#2A2B2F] text-white/60 hover:bg-white/5"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleContinue}
            className={`h-[48px] rounded-full bg-[#F9EF38] text-black font-medium hover:brightness-95 ${
              isPasswordStep ? "w-full" : "flex-1"
            }`}
          >
            {isPasswordStep ? "Unlock" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
