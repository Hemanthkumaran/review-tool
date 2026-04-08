import React, { useState } from "react";
import Modal from "react-modal";
import ToggleButton from "../../components/buttons/ToggleButton";
import { useWorkspace } from "../../context/WorkspaceContext";
import { createPaymentOrderApi, startTrialApi } from "../../services/api";
import SubscriptionModal from "../../components/modals/SubscriptionModal";
import { useRazorpay } from "../../hooks/useRazorpay";
import { Tooltip } from "react-tooltip";

const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    zIndex: 100000,
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

const PLAN_MEMBER_LIMITS = {
  freelancer: 1,
  team: 5,
  team_plus: 10,
};

const PLAN_ORDER = {
  freelancer: 1,
  team: 2,
  team_plus: 3,
};

export default function ChoosePlanModal({ open, onClose, setChosenPlan, onSuccess, buttonLabel, trialUsed, additionalStorageMinutes = 0, showClose = false }) {
  const { activeWorkspace, workspaceUsers, refreshWorkspacePlan, workspacePlan, brandingColor } = useWorkspace();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { openCheckout } = useRazorpay();

  const priceFreelancer = isAnnual ? 6 : 7;
  const priceTeam = isAnnual ? 20 : 25;
  const priceAgency = isAnnual ? 36 : 45;

  const memberCount = workspaceUsers?.permissions?.length || 1;
  console.log(workspaceUsers, 'workspaceUsers');
  
  const subscription = activeWorkspace?.subscription || workspacePlan?.subscription;

  const minutesUsed = subscription?.storageMinutesUsed || 0;

  const totalMinutesAllowed =
    (subscription?.baseStorageMinutes || 0) +
    (subscription?.additionalStorageMinutes || 0);

  const currentPlan = subscription?.activePlan;
console.log(workspacePlan?.subscription, 'currentPlan');

  // const canSwitchTo = (planKey) => {
  //   const limit = PLAN_LIMITS[planKey];
  //   return minutesUsed <= limit;
  // };

const canSwitchTo = (planKey) => {
  const limit = PLAN_MEMBER_LIMITS[planKey];
  return memberCount <= limit;
};


const isTrialing = subscription?.status === "trialing";

const getPlanState = (planKey) => {
  const isCurrent = currentPlan === planKey;

  const overLimit = !canSwitchTo(planKey);

  // 🔴 Trial override
  if (isTrialing) {
    return {
      isCurrent,
      overLimit,
      buttonLabel: "Upgrade",
      disabled: false,
    };
  }

  return {
    isCurrent,
    overLimit,
    buttonLabel: overLimit
      ? "Over limits"
      : !trialUsed
      ? "Start free trial"
      : isCurrent
      ? "Continue with Current Plan"
      : "Switch Plan",
    disabled: overLimit,
  };
};

  const handleChoosePlan = async (planKey) => {
    if (!activeWorkspace?._id) return;

    const isCurrent = currentPlan === planKey;
    const overLimit = !canSwitchTo(planKey); // ✅ ADD THIS

    // 🛑 BLOCK: Over limit should never proceed
    if (overLimit) {
      return;
    }

    if (isCurrent) {
      onClose?.();
      return;
    }

    try {
      setLoadingPlan(planKey);

      // 🟢 CASE 1 — FREE TRIAL AVAILABLE
      if (!trialUsed) {

        await startTrialApi(activeWorkspace._id, {
          activePlan: planKey,
          interval: isAnnual ? "yearly" : "monthly",
        });

        setChosenPlan(planKey);
        onSuccess();

        await refreshWorkspacePlan(activeWorkspace._id);
        return;
      }

      // 🔵 CASE 2 — TRIAL ALREADY USED → PAYMENT FLOW

      const res = await createPaymentOrderApi(activeWorkspace._id, {
        activePlan: planKey,
        interval: isAnnual ? "yearly" : "monthly",
        purpose: "subscribe",
        additionalStorageMinutes: additionalStorageMinutes
      });

      const order = res.data.razorpay;

      openCheckout({
        orderId: order.orderID,
        amount: order.amount,
        currency: order.currency,
        name: activeWorkspace.name,
        brandingColor: brandingColor,
        onSuccess: async () => {
          await refreshWorkspacePlan(activeWorkspace._id);
          setChosenPlan(planKey);
          onSuccess();
        },
      });

    } catch (err) {
      console.error("Plan selection failed", err);
      alert("Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  // const handleChoosePlan = async (planKey) => {
  //   if (!activeWorkspace?._id) return;

  //   try {
  //     setLoadingPlan(planKey);
  //     await startTrialApi(activeWorkspace._id, {
  //       activePlan: planKey,
  //       interval: isAnnual ? "yearly" : "monthly",
  //     });
  //     setChosenPlan(planKey);
  //     onSuccess();
  //     await refreshWorkspacePlan(activeWorkspace._id);

  //   } catch (err) {
  //     console.error("Failed to start trial", err);
  //   } finally {
  //     setLoadingPlan(null);
  //   }
  // };

const isCurrent = currentPlan === "freelancer";
const overLimit = !canSwitchTo("freelancer");

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
        {showClose && (
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white/70 hover:text-white transition"
          >
            ✕
          </button>
        )}

        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-black/10" />

        {/* Header */}
        <div className="text-center">
          <h1 style={{ fontFamily: "Gilroy-SemiBold", fontSize: 24 }}>
            { trialUsed ? "Choose a plan that fits your workflow" : "Choose how you'd like to start" }
          </h1>
          <p style={{ fontSize: 12 }}>
             { trialUsed ? null : "Try any plan for 7 days with no card required." }
          </p>
        </div>

        {/* Toggle */}
        <div className={`flex items-center ${trialUsed ? 'justify-center' : 'justify-end'} mt-2`}>
          <div
            style={{
              fontFamily: "Gilroy-Light",
              color: "#A1A1A1",
              marginRight: 10,
            }}
          >
            {trialUsed ? 'Annual (20% off)' : 'Annual'}
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
            brandingColor={brandingColor}
            planKey="freelancer"
            title="Freelancer"
            price={priceFreelancer}
            period={isAnnual ? "month, billed annually" : "month"}
            features={[
              { text: "1 user", enabled: true },
              { text: "100 mins of storage + Storage addons", enabled: true },
            ]}
            buttonLabel={getPlanState("freelancer").buttonLabel}
            disabled={getPlanState("freelancer").disabled}
            onClick={() => handleChoosePlan("freelancer")}
            highlight={false}
          />
          <PricingCard
            planKey="team"
            title="Team"
            price={priceTeam}
            brandingColor={brandingColor}
            period={isAnnual ? "month, billed annually" : "month"}
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
            buttonLabel={getPlanState("team").buttonLabel}
            disabled={getPlanState("team").disabled}
            onClick={() => handleChoosePlan("team")}
            highlight
          />

          <PricingCard
          brandingColor={brandingColor}
            planKey="team_plus"
            title="Team Plus"
            price={priceAgency}
            period={isAnnual ? "month, billed annually" : "month"}
            features={[
              { text: "Upto 10 team members", enabled: true },
              { text: "Unlimited Collaborators ( Freelancers )", enabled: true },
              { text: "1000 mins of storage + Storage addons", enabled: true },
              { text: "Custom UI branding (Paid addon)", enabled: true },
            ]}
            onClick={() => handleChoosePlan("team_plus")}
            buttonLabel={getPlanState("team_plus").buttonLabel}
            disabled={getPlanState("team_plus").disabled}
            highlight
          />
        </div>

        {/* Footer note */}
        {
          workspacePlan?.subscription?.status === "trialing" ? null :
          <div className="flex justify-center mt-6 text-xs">
            <span style={{ fontFamily: "Gilroy-Bold", marginRight: 4 }}>
              Note:
            </span>
            Billing details will be requested after 7 days.
          </div>
        }
        
      </div>
    </Modal>
  );
}


function PricingCard({ title,
  price,
  period,
  features,
  buttonLabel,
  highlight,
  brandingColor,
  disabled,
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
            <span className="text-[var(--brand-color)] text-4xl font-semibold">${price}</span>
            <span className="text-sm text-[#bfbfbf]">/ {period}</span>
          </div>
          {/* Divider */}
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#2a2b2f] to-transparent" />
          {/* Included */}
          <div className="mt-4 text-white/90 text-sm">Everything in Team, but :</div>

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
                data-tooltip-id={`tooltip-${title}`}
                data-tooltip-content={
                  buttonLabel === "Over limits"
                    ? "You currently have more team members or storage than this plan allows for"
                    : ""
                }
                onClick={onClick}
                style={
                  buttonLabel === "Over limits"
                    ? { background: "#323232", color:"#fff" }
                    : !disabled
                    ? { background: brandingColor }
                    : {}
                }
                className={`w-full sm:w-auto px-8 py-3 rounded-full font-medium transition
                  ${disabled
                    ? "bg-[#2a2a2a] text-gray-400 cursor-not-allowed"
                    : "text-black hover:opacity-90 cursor-pointer"
                  }`}
              >
                {loading ? "Starting..." : buttonLabel}
              </button>
              {buttonLabel === "Over limits" && (
                <Tooltip
                  id={`tooltip-${title}`}
                  place="top"
                  style={{
                    backgroundColor: "#2a2a2a",
                    color: "#fff",
                    borderRadius: "8px",
                    maxWidth: "250px", 
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                />
              )}
              {/* {disabled && buttonLabel === "Over limits" && (
                  <div className="mt-3 text-xs text-gray-400 text-center">
                    You currently have more storage usage than this plan allows
                  </div>
                )} */}
            </div>
        </div>
      </div>
    </div>
  );
}

/* Icons */
function IconCheck() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-color)]">
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