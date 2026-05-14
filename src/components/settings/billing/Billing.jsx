import { useState } from "react";
import StorageSlider from "./StorageSlider";
import SubscriptionCard from "./SubscriptionCard";
import close from "../../../assets/svgs/close.svg";
import "./Billing.css";
import Button from "../../UI/Button";
import { useWorkspace } from "../../../context/WorkspaceContext";
import ChoosePlanModal from "../../../pages/chooseplan";
import { reactivateSubscriptionApi } from "../../../services/api";
import { getApiErrorMessage, showErrorToast, showSuccessToast } from "../../../helpers/showToast";
import SubscriptionModal from "../../modals/SubscriptionModal";


const Billing = () => {

  const {
    activeWorkspace,
    ownerWorkspacePlan,
    billingLoading,
    ownerWorkspace,
    refreshWorkspace,
    refreshOwnerWorkspacePlan,
    refreshWorkspacePlan,
    setOwnerWorkspacePlan,
    setWorkspacePlan,
    trialUsed,
  } = useWorkspace();

  const [isOpen, setIsOpen] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [isReactivateSuccessOpen, setIsReactivateSuccessOpen] = useState(false);
  
  if (billingLoading) return null;

  const subscription = ownerWorkspacePlan?.subscription;
  if (!subscription) return null;
  const isScheduledCancellation = Boolean(subscription.scheduledCancellation);

  const handlePlanAction = async () => {
    if (!isScheduledCancellation) {
      setIsOpen(true);
      return;
    }

    if (!ownerWorkspace?._id || reactivateLoading) return;

    try {
      setReactivateLoading(true);
      const res = await reactivateSubscriptionApi(ownerWorkspace._id);
      const updatedSubscription = res?.data?.subscription;

      if (updatedSubscription) {
        setOwnerWorkspacePlan((prev) =>
          prev
            ? { ...prev, subscription: { ...prev.subscription, ...updatedSubscription } }
            : prev
        );

        if (activeWorkspace?._id === ownerWorkspace._id) {
          setWorkspacePlan((prev) =>
            prev
              ? { ...prev, subscription: { ...prev.subscription, ...updatedSubscription } }
              : prev
          );
        }
      }

      setIsReactivateSuccessOpen(true);
      showSuccessToast(res?.data?.message || "Plan reactivated successfully");
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "We couldn't reactivate your plan. Please try again."));
    } finally {
      setReactivateLoading(false);
    }
  };

  const handleCloseReactivateSuccess = async () => {
    setIsReactivateSuccessOpen(false);
    await refreshOwnerWorkspacePlan();

    if (activeWorkspace?._id === ownerWorkspace?._id) {
      await refreshWorkspacePlan(activeWorkspace._id);
    }
  };
  
  return (
    <>
      {/* usage and billing */}
      <div className="bill-header">
        <div className="bill-header-main">
          <div>Plan & Billing</div>
          <img width="26px" src={close} alt="" />
        </div>

        <div style={{ fontSize: "14px" }}>
          View your current plan, payment details, and storage/minutes used.
        </div>

        <div className="subscription-header">
          <div className="text-[18px]">Subscription</div>
          <button
            type="button"
            onClick={handlePlanAction}
            disabled={reactivateLoading}
            className="border-0 bg-transparent p-0 text-[16px] text-yellow-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isScheduledCancellation
              ? reactivateLoading
              ? "Reactivating..."
              : "Reactivate Plan"
              : "Change Plan"}
          </button>
        </div>
      </div>

      {/* subscription */}
      <div>
        <SubscriptionCard
          subscription={subscription}
          ownerWorkspace={ownerWorkspace}
          costPerMinute={ownerWorkspacePlan.costPerMinute}
          refreshWorkspace={refreshWorkspace}
          refreshWorkspacePlan={refreshOwnerWorkspacePlan}
        />

        <div style={{ margin: "24px 0 0 0" }}>
          <Button
            padding="6px 12px"
            textColor="#fff"
            bgColor="#131313"
            border="2px solid #2a2a2a"
            marginRight="10px"
            width="fit-content"
            content="View Invoices"
          />
          <Button
            padding="6px 12px"
            textColor="#fff"
            bgColor="#131313"
            border="2px solid #2a2a2a"
            width="fit-content"
            content="Update billing details"
          />
        </div>
      </div>
      <ChoosePlanModal
        open={isOpen && !isScheduledCancellation}
        onClose={() => setIsOpen(false)}
        setChosenPlan={() => refreshOwnerWorkspacePlan()}
        onSuccess={() => {
          setIsOpen(false);
        }}
        trialUsed={trialUsed}
        forcePaidActivation={trialUsed}
        buttonLabel={!trialUsed ? "Start free trial" : "Subscribe"}
        showClose={true}
        showPaymentSuccessModal={true}
        subscriptionOverride={subscription}
      />
      <SubscriptionModal
        open={isReactivateSuccessOpen}
        onClose={handleCloseReactivateSuccess}
        title="Plan reactivated successfully"
        subtitle="Your subscription has been reactivated successfully."
        buttonTitle="Okay"
        onBtnClick={handleCloseReactivateSuccess}
      />
    </>
  );
};


export default Billing;
