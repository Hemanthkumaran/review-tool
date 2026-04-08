import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./SubscriptionCard.css";
import { DateFormat } from "../../../../../helpers/common";
import { CancelRedCircle } from "../../../../../assets/svgs/SvgComponents";
import { cancelAddonApi } from "../../../../../services/api";
import RemoveAccessModal from "../../../../modals/RemoveAccessModal";

export default function SubscriptionCard({
  subscription,
  costPerMinute,
  ownerWorkspace,
  refreshWorkspace,
  refreshWorkspacePlan,
  minutesUsed
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

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const totalMinutes =
    baseStorageMinutes + additionalStorageMinutes;

  const usedMinutes = storageMinutesUsed;

  const remainingMinutes = Math.max(
    totalMinutes - usedMinutes,
    0
  );

  const percentage =
    totalMinutes === 0
      ? 0
      : (usedMinutes / totalMinutes) * 100;

  const handleCancelAddon = async () => {
    setLoading(true);
    await cancelAddonApi(ownerWorkspace._id);
    await refreshWorkspace();
    await refreshWorkspacePlan(ownerWorkspace._id);
    setLoading(true);
    setIsOpen(false);
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
        <div style={{ color:"#C4C4C4", fontSize:12, marginTop:20, cursor:'pointer' }}>Cancel subscription</div>
        <div style={{ background:"#C4C4C4", height:0.5, marginTop:-1 }}/>

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

      {/* <div className="sub-divider"></div> */}

      {/* <div>
        <div className="sub-addon-name mb-2">
          Active Add-ons
        </div>
        { subscription?.addons.length ?
        subscription?.addons?.map(item => {
          if (item.status == "active") {
            return <div className="flex align-center">
              <div id={item._id} style={{ fontFamily:'Gilroy-Regular', color:"#BFBFBF", fontSize:16, marginRight:10 }}>{`Custom UI Branding - $ ${item.amount}/month`}</div>
              <div onClick={() => setIsOpen(true)} style={{cursor:'pointer'}}><CancelRedCircle/></div>
            </div>
          }
        }) :
        <div style={{ fontSize:16 }} className="sub-addon-name mb-2">
          None
        </div>
      }
      </div> */}
      {/* <div className="sub-divider"></div> */}

      {/* ---------- FAQ ---------- */}
      <div className="sub-faq-row">
        <span>Questions? Check out&nbsp;</span>
        <button className="sub-faq-link">
          Billing FAQ
        </button>
      </div>
      <RemoveAccessModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Remove Addon"
          description="Following addon will be removed from the plan"
          buttonText={loading ? "Removing..." : "Remove Addon"}
          handleRemove={handleCancelAddon}
        />
    </div>
  );
}
