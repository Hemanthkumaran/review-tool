import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./SubscriptionCard.css";
import { DateFormat } from "../../../../../helpers/common";

export default function SubscriptionCard({
  subscription,
  costPerMinute,
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
  console.log(subscription, 'subscription');
  
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

  const isUsageBlockingDowngrade =
    usedMinutes > totalMinutes;

  return (
    <div className="subscription-card">
      {/* ---------- ROW 1 ---------- */}
      <div className="sub-top-row">
        <div className="sub-plan-left">
          <span className="sub-plan-label">Plan:</span>
          <span className="sub-plan-name">
            {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)}
          </span>
          <span className="sub-status-pill">ACTIVE</span>
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
              {remainingMinutes} minutes remaining
            </p>
            <p className="sub-minutes-used">
              {usedMinutes}/{totalMinutes} minutes used
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

      <div className="sub-divider"></div>

      {/* ---------- FAQ ---------- */}
      <div className="sub-faq-row">
        <span>Questions? Check out&nbsp;</span>
        <button className="sub-faq-link">
          Billing FAQ
        </button>
      </div>
    </div>
  );
}
