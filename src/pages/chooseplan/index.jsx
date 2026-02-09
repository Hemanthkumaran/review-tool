import React, { useState } from "react";
import Modal from "react-modal";
import ToggleButton from "../../components/buttons/ToggleButton";
import { useWorkspace } from "../../context/WorkspaceContext";
import { startTrialApi } from "../../services/api";
import SubscriptionModal from "../../components/modals/SubscriptionModal";

const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    zIndex: 50,
  },
  content: {
    inset: "50% auto auto 50%",
    transform: "translate(-50%, -50%)",
    padding: 0,
    border: "none",
    background: "transparent",
    overflow: "visible",
    maxWidth: "1100px",
    width: "100%",
  },
};

export default function ChoosePlanModal({ open, onClose, setChosenPlan, buttonLabel }) {
  const { activeWorkspace, refreshWorkspacePlan } = useWorkspace();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);


  const priceTeam = isAnnual ? 25 : 250;
  const priceAgency = isAnnual ? 50 : 500;

  const handleStartTrial = async (planKey) => {
    if (!activeWorkspace?._id) return;

    try {
      setLoadingPlan(planKey);
      await startTrialApi(activeWorkspace._id, {
        activePlan: planKey,
        interval: isAnnual ? "yearly" : "monthly",
      });
      setChosenPlan(planKey);
      onClose();
      await refreshWorkspacePlan(activeWorkspace._id);

    } catch (err) {
      console.error("Failed to start trial", err);
    } finally {
      setLoadingPlan(null);
    }
  };


  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      style={modalStyles}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
    >
      <div className="relative min-h-[80vh] w-full p-6 bg-[#0f0f0f] rounded-[28px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          ✕
        </button>

        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-black/10" />

        {/* Header */}
        <div className="text-center">
          <h1 style={{ fontFamily: "Gilroy-SemiBold", fontSize: 24 }}>
            Choose how you'd like to start
          </h1>
          <p style={{ fontSize: 12 }}>
            Try any plan for 7 days with no card required.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-end mt-6">
          <div
            style={{
              fontFamily: "Gilroy-Light",
              color: "#A1A1A1",
              marginRight: 10,
            }}
          >
            Annual
          </div>
          <ToggleButton
            checked={isAnnual}
            onChange={() => setIsAnnual((prev) => !prev)}
            size="sm"
          />
        </div>

        {/* Pricing cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard
            title="Freelancer"
            price={priceTeam}
            period={isAnnual ? "year" : "month"}
            features={[
              { text: "1 user", enabled: true },
              { text: "100 mins of storage + Storage addons", enabled: true },
            ]}
            buttonLabel={buttonLabel}
            onClick={() => handleStartTrial("freelancer")}
            highlight={false}
          />

          <PricingCard
            title="Team"
            price={priceAgency}
            period={isAnnual ? "year" : "month"}
            features={[
              { text: "Upto 5 team members", enabled: true },
              { text: "500 mins of storage + Storage addons", enabled: true },
              { text: "Unlimited folders & projects", enabled: true },
              { text: "Unlimited reviewers", enabled: true },
              { text: "Voice notes in comments", enabled: true },
              { text: "Secure link sharing", enabled: true },
              { text: "Internal notes", enabled: true },
              { text: "Version management", enabled: true },
            ]}
            buttonLabel={buttonLabel}
            onClick={() => handleStartTrial("team")}
            highlight
          />

          <PricingCard
            title="Team Plus"
            price={priceAgency}
            period={isAnnual ? "year" : "month"}
            features={[
              { text: "Upto 10 team members", enabled: true },
              { text: "Unlimited Collaborators ( Freelancers )", enabled: true },
              { text: "1000 mins of storage + Storage addons", enabled: true },
              { text: "Custom UI branding (Paid addon)", enabled: true },
            ]}
            onClick={() => handleStartTrial("team_plus")}
            buttonLabel={buttonLabel}
            highlight
          />
        </div>

        {/* Footer note */}
        <div className="flex justify-center mt-6 text-xs">
          <span style={{ fontFamily: "Gilroy-Bold", marginRight: 4 }}>
            Note:
          </span>
          Billing details will be requested after 7 days.
        </div>
      </div>
    </Modal>
  );
}


function PricingCard({   title,
  price,
  period,
  features,
  buttonLabel,
  highlight,
  onClick,
  loading, }) {
  return (
    <div className="relative">
      {/* Card */}
      <div className="relative h-full overflow-hidden rounded-[24px] border border-[#2a2b2f] bg-[#131313] px-6 py-4 flex flex-col">
        {/* Gloss / soft spotlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px]
            bg-[radial-gradient(120%_60%_at_30%_0%,rgba(255,255,255,0.08),rgba(0,0,0,0)_50%)]" />
        <div className="relative flex flex-col h-full">
          {/* Title */}
          <div style={{ fontFamily:'Gilroy-Light', fontSize:24, textAlign:'center' }}>{title}</div>
          {/* Price */}
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-[#F9EF38] text-4xl font-semibold">${price}</span>
            <span className="text-sm text-[#bfbfbf]">/ {period}</span>
          </div>
          {/* Divider */}
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#2a2b2f] to-transparent" />
          {/* Included */}
          <div className="mt-4 text-white/90 text-sm">Everythign in Team, but :</div>

          <ul className="mt-3 space-y-3 mb-4">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {f.enabled ? <IconCheck /> : <IconCross />}
                <span className={`text-sm ${f.enabled ? "text-[#bfbfbf]" : "text-[#6b6b6b]"}`}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
          {/* Button */}
            <div className="mt-10 mt-auto flex justify-center ">
              <button
                disabled={loading}
                onClick={onClick}
                className={`w-full sm:w-auto px-8 py-3 rounded-full font-medium transition
                  ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                  bg-[#F9EF38] text-black hover:opacity-90`}
              >
                {loading ? "Starting..." : buttonLabel}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}

/* Icons */
function IconCheck() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F9EF38]">
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <path d="M5 10l3 3 7-7" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IconCross() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2b2c31]">
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <path d="M6 6l8 8M14 6l-8 8" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}