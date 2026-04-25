import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./SubscriptionCard.css";
import { DateFormat } from "../../../helpers/common";
import { cancelAddonApi, cancelSubscriptionApi } from "../../../services/api";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../../helpers/showToast";
import RemoveAccessModal from "../../modals/RemoveAccessModal";
import SubscriptionModal from "../../modals/SubscriptionModal";

export default function SubscriptionCard({
  subscription,
  costPerMinute,
  ownerWorkspace,
  refreshWorkspace,
  refreshWorkspacePlan,
}) {
  const {
    activePlan,
    interval,
    baseStorageMinutes,
    additionalStorageMinutes,
    storageMinutesUsed,
    subscriptionEndAt,
    totalAmount,
  } = subscription;

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelSuccessOpen, setIsCancelSuccessOpen] = useState(false);
  const [addonLoading, setAddonLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const totalMinutes = baseStorageMinutes + additionalStorageMinutes;

  const usedMinutes = storageMinutesUsed;

  const remainingMinutes = Math.max(totalMinutes - usedMinutes, 0);

  const percentage = totalMinutes === 0 ? 0 : (usedMinutes / totalMinutes) * 100;

  const handleCancelAddon = async () => {
    if (addonLoading || !ownerWorkspace?._id) return;

    try {
      setAddonLoading(true);
      await cancelAddonApi(ownerWorkspace._id);
      await refreshWorkspace();
      await refreshWorkspacePlan(ownerWorkspace._id);
      setIsAddonModalOpen(false);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "We couldn't remove the add-on. Please try again."));
    } finally {
      setAddonLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (cancelLoading || !ownerWorkspace?._id) return;

    try {
      setCancelLoading(true);
      const res = await cancelSubscriptionApi(ownerWorkspace._id);
      setIsCancelModalOpen(false);
      setIsCancelSuccessOpen(true);
      showSuccessToast(res?.data?.message || "Subscription cancelled successfully");
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "We couldn't cancel the subscription. Please try again."));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseCancelSuccess = async () => {
    setIsCancelSuccessOpen(false);
    await refreshWorkspace();
    await refreshWorkspacePlan(ownerWorkspace._id);
  };

  return (
    <div className="subscription-card">
      {/* ---------- ROW 1 ---------- */}
      <div className="sub-top-row">
        <div className="sub-plan-left">
          <span className="sub-plan-label">Plan:</span>
          <span className="sub-plan-name">
            {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)}
          </span>
          <span className="sub-status-pill">{subscription.status == "trialing" ? "Free trial" : subscription.status}</span>
        </div>

        <div className="sub-end-right">
          <span className="sub-end-label">
            Subscription end date:
          </span>
          <span className="sub-end-pill">
            {DateFormat(subscriptionEndAt)}
          </span>
        </div>
      </div>

      {/* ---------- ROW 2 ---------- */}
      <div className="sub-main-row">
        <div className="sub-minutes-left">
          <div className="sub-circle">
            <CircularProgressbar
              value={percentage}
              strokeWidth={8}
              styles={buildStyles({
                pathColor: "#24B491",
                trailColor: "#2B2B2B",
                strokeLinecap: "round",
              })}
            />
          </div>
          <div className="sub-minutes-text">
            <p className="sub-minutes-remaining">
              {(remainingMinutes).toFixed(2)} minutes remaining
            </p>
            <p className="sub-minutes-used">
              {usedMinutes.toFixed(2)}/{Math.round(totalMinutes)} minutes used
            </p>
          </div>
        </div>

        <div className="sub-price">
          <p className="sub-price-amount">
            ${totalAmount}
          </p>
          <p className="sub-price-caption">
            Billed {interval}
          </p>
          <button
            type="button"
            className="sub-cancel-btn"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={cancelLoading}
          >
            {cancelLoading ? "Cancelling subscription..." : "Cancel subscription"}
          </button>
          <div className="sub-cancel-divider" />

        </div>
      </div>

      {/* ---------- WARNING ---------- */}
      {/* {isUsageBlockingDowngrade && (
        <div className="mt-4">
          <UsageLimitWarning currentUsage={usedMinutes} />
        </div>
      )} */}

      {/* ---------- DIVIDER ---------- */}
      <div className="sub-divider"></div>

      {/* ---------- ADDONS ---------- */}
      {additionalStorageMinutes > 0 && (
        <div className="sub-addon-row">
          <span className="sub-addon-name">
            Additional Storage ({additionalStorageMinutes} min)
          </span>
          <div className="sub-addon-price">
            <span className="addon-cost">
              ${(additionalStorageMinutes * costPerMinute).toFixed(2)}
            </span>
            <span className="addon-per">/month</span>
          </div>
        </div>
      )}

      <div className="sub-faq-row">
        <span>Questions? Check out&nbsp;</span>
        <button className="sub-faq-link">
          Billing FAQ
        </button>
      </div>
      <RemoveAccessModal
        open={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        title="Remove Addon"
        description="Following addon will be removed from the plan"
        buttonText={addonLoading ? "Removing..." : "Remove Addon"}
        handleRemove={handleCancelAddon}
      />
      <RemoveAccessModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Subscription"
        description="Your current subscription will be cancelled for this workspace."
        buttonText={cancelLoading ? "Cancelling..." : "Cancel Subscription"}
        handleRemove={handleCancelSubscription}
      />
      <SubscriptionModal
        open={isCancelSuccessOpen}
        onClose={handleCloseCancelSuccess}
        title="Subscription cancelled successfully"
        subtitle="Your workspace subscription has been cancelled."
        buttonTitle="Okay"
        onBtnClick={handleCloseCancelSuccess}
      />
    </div>
  );
}
