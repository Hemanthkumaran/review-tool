import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./SubscriptionCard.css";

export default function SubscriptionCard() {
  const totalMinutes = 700;
  const usedMinutes = 600;
  const remainingMinutes = totalMinutes - usedMinutes;

  const percentage = (usedMinutes / totalMinutes) * 100;

  return (
    <div className="subscription-card">
      {/* ---------- ROW 1: PLAN + END DATE ---------- */}
      <div className="sub-top-row">
        <div className="sub-plan-left">
          <span className="sub-plan-label">Plan name:</span>
          <span className="sub-plan-name">Team</span>
          <span className="sub-status-pill">ACTIVE</span>
        </div>

        <div className="sub-end-right">
          <span className="sub-end-label">Subscription end date:</span>
          <span className="sub-end-pill">29 Sep 2025</span>
        </div>
      </div>

      {/* ---------- ROW 2: CIRCLE + MINUTES + PRICE ---------- */}
      <div className="sub-main-row">
        <div className="sub-minutes-left">
          <div className="sub-circle">
            <CircularProgressbar
              value={percentage}
              strokeWidth={10}
              styles={buildStyles({
                pathColor: "#FFE94A",
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
          <p className="sub-price-amount">$50</p>
          <p className="sub-price-caption">Billed monthly</p>
        </div>
      </div>

      {/* ---------- DIVIDER ---------- */}
      <div className="sub-divider"></div>

      {/* ---------- ACTIVE ADD-ONS ---------- */}
      <div className="sub-addons-title">Active Add-ons</div>

      <div className="sub-addon-row">
        <span className="sub-addon-name">Custom UI Branding</span>

        <div className="sub-addon-price">
          <span className="addon-cost">$15</span>
          <span className="addon-per">/month</span>

          <button className="addon-remove-btn">×</button>
        </div>
      </div>

      {/* ---------- DIVIDER ---------- */}
      <div className="sub-divider"></div>

      {/* ---------- FAQ FOOTER ---------- */}
      <div className="sub-faq-row">
        <span>Questions? Check out&nbsp;</span>
        <button className="sub-faq-link">Billing FAQ</button>
      </div>
    </div>
  );
}
