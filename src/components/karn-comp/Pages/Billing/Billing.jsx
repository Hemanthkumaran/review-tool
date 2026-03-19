import StorageSlider from "../../components/UsageAndBilling/Silder/StorageSlider";
import SubscriptionCard from "../../components/UsageAndBilling/SubsrciptionCard/SubscriptionCard";
import close from "../../assets/icons/close.svg";
import "./Billing.css";
import Button from "../../UI/Button";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import ChoosePlanModal from "../../../../pages/chooseplan";
import { useState } from "react";


const Billing = () => {

  const { ownerWorkspacePlan, billingLoading, ownerWorkspace, refreshWorkspace, refreshOwnerWorkspacePlan, trialUsed } = useWorkspace();

  const [chosenPlan, setChosenPlan] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  if (billingLoading) return null;

  const subscription = ownerWorkspacePlan?.subscription;
  if (!subscription) return null;
  
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
          <div onClick={() => setIsOpen(true)} className="text-[16px] text-yellow-200 cursor-pointer">
            Change Plan
          </div>
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
        open={isOpen}
        onClose={() => setIsOpen(false)}
        setChosenPlan={(plan) => {
          setChosenPlan(plan);
        }}
        onSuccess={() => {
        }}
        trialUsed={trialUsed}
        buttonLabel={!trialUsed ? "Start free trial" : "Subscribe"}
        showClose={true}
      />
    </>
  );
};


export default Billing;
