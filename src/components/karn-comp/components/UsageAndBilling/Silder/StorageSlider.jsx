import { useEffect, useState } from "react";
import { Range } from "react-range";
import { useRazorpay } from "../../../../../hooks/useRazorpay";
import { createPaymentOrderApi } from "../../../../../services/api";
import { useWorkspace } from "../../../../../context/WorkspaceContext";
import AppLoader from "../../../../common/AppLoader";
import ConfirmPlanModal from "../../../../modals/ConfirmPlanModal";
import "./StorageSlider.css";

const STEP = 10;
const MIN = 100;
const MAX = 2000;

export default function StorageSlider() {
  const { openCheckout } = useRazorpay();
  const { activeWorkspace, workspacePlan, billingLoading } = useWorkspace();

  const [values, setValues] = useState([MIN]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const subscription = workspacePlan?.subscription;
  
  const baseStorage = subscription?.baseStorageMinutes ?? MIN;
  const additionalStorage = subscription?.additionalStorageMinutes ?? 0;
  const currentTotalStorage = baseStorage + additionalStorage;

  const costPerMinute = workspacePlan?.costPerMinute;
  const basePlanCost = baseStorage * costPerMinute;
  const currentAdditionalCost = additionalStorage * costPerMinute;
  const currentMonthlyTotal = basePlanCost + currentAdditionalCost;

  const selectedStorage = values[0];

  // Prevent sliding below baseStorage (500 min)
  const safeValue = Math.max(selectedStorage, baseStorage);

  // Increase / decrease intent
  const increaseMinutes = Math.max(0, selectedStorage - currentTotalStorage);
  const decreaseMinutes = Math.max(0, currentTotalStorage - selectedStorage);
  const selectedAdditionalMinutes =  additionalStorage + increaseMinutes - decreaseMinutes;

  const safeSelectedAdditionalMinutes = Math.max(0, selectedAdditionalMinutes);
  
  // Pricing (only charge for increase)
  const extraCost = increaseMinutes * costPerMinute;
  const selectedAdditionalCost = safeSelectedAdditionalMinutes * costPerMinute;

  const newMonthlyTotal = basePlanCost + selectedAdditionalCost;

  const currentPercent = ((currentTotalStorage - MIN) / (MAX - MIN)) * 100;
  const selectedPercent = ((selectedStorage - MIN) / (MAX - MIN)) * 100;

  useEffect(() => {
    if (!subscription) return;
    setValues([currentTotalStorage]);
  }, [currentTotalStorage, subscription]);


  const handleUpgrade = async () => {
    if (!activeWorkspace?._id || increaseMinutes === 0) return;

    setLoading(true);

    try {
      console.log({
        activePlan: workspacePlan.subscription.activePlan,
        interval: workspacePlan.subscription.interval,
        additionalStorageMinutes: increaseMinutes,
        purpose: "upgrade",
      }, 'test');
      
      const res = await createPaymentOrderApi(activeWorkspace._id, {
        activePlan: workspacePlan.subscription.activePlan,
        interval: workspacePlan.subscription.interval,
        additionalStorageMinutes: increaseMinutes,
        purpose: "upgrade",
      });
      console.log(res, 'razorpay order');
      
      const order = res.data.razorpay;

      openCheckout({
        orderId: order.orderID,
        amount: order.amount,
        currency: order.currency,
        name: activeWorkspace.name,
        onSuccess: () => window.location.reload(),
      });
    } catch (e) {
      alert("Payment failed");
    }

    setLoading(false);
  };

  if (billingLoading) return <AppLoader />;

  return (
    <div style={{ fontFamily:'Gilroy-Regular' }} className="slider-card">
      <div style={{ fontFamily:'Gilroy-Regular', fontSize:14 }} className="slider-title">
        Use the slider to increase/decrease your storage limit.
      </div>
      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={[safeValue]}
        onChange={(vals) => {
          // Prevent going below base storage (500 min)
          const next = Math.max(vals[0], baseStorage);
          setValues([next]);
        }}
        renderTrack={({ props, children }) => {
          const { ref, style, ...rest } = props;
          return (
            <div
              ref={ref}
              {...rest}
              style={{ ...style, height: 10, position: "relative" }}
              className="slider-track"
            >
              {/* Grey base background */}
              <div className="slider-track-base" />
              
              {/* YELLOW: Current total storage (base + additional = 900 min) */}
              <div
                className="slider-track-default"
                style={{ width: `${currentPercent}%` }}
              />
              
              {/* GREEN: Increase beyond current total (900+ min) */}
              {selectedStorage > currentTotalStorage && (
                <div
                  className="slider-track-upgrade"
                  style={{
                    left: `${currentPercent}%`,
                    width: `${selectedPercent - currentPercent}%`,
                  }}
                />
              )}
              
              {/* RED: Decrease from current total (below 900 min) */}
              {selectedStorage < currentTotalStorage && (
                <div
                  className="slider-track-downgrade"
                  style={{
                    left: `${selectedPercent}%`,
                    width: `${currentPercent - selectedPercent}%`,
                  }}
                />
              )}

              {children}
            </div>
          );
        }}
        renderThumb={({ props }) => (
          <div {...props} className="slider-thumb" />
        )}
      />

      <div className="slider-labels">
        <span>{selectedStorage} min</span>
        <span>{MAX} min</span>
      </div>

      <div className="plan-wrapper">
        <div className="plan-card">
          <div className="plan-row header">
            <span>Total storage</span>
            <span style={{ fontFamily:'Gilroy-SemiBold' }}>{selectedStorage} min</span>
          </div>

          <div className="divider" />

          <div className="plan-row">
            <span>Base plan storage ({baseStorage} min)</span>
            <span>${basePlanCost}</span>
          </div>

          {/* Show current additional storage */}
          <div className="plan-row">
            <span>Current additional storage ({additionalStorage} min)</span>
            <span>${(currentAdditionalCost).toFixed(2)}</span>
          </div>

          {/* Show increase if selected */}
          {increaseMinutes > 0 && (
            <div className="plan-row">
              <span>Additional storage (+{increaseMinutes} min)</span>
              <span>+${extraCost.toFixed(2)}</span>
            </div>
          )}

          {/* Show decrease warning */}
            {decreaseMinutes > 0 && (
              <div className="plan-row" style={{ color: "#ff4d4f" }}>
                <span>Storage decrease ({decreaseMinutes} min)</span>
                <span>
                  -${(decreaseMinutes * costPerMinute).toFixed(2)}
                </span>
              </div>
            )}

          <div className="divider" />

          <div className="plan-row total">
            <span>Your {subscription?.interval} total</span>
            <span className="highlight">
              ${newMonthlyTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="plan-action">
          <button
            disabled={loading}
            onClick={() => setShowConfirm(true)}
            className="change-btn"
            style={{ fontFamily:'Gilroy-SemiBold' }}
          >
             Change plan
          </button>
        </div>
      </div>

      <ConfirmPlanModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        workspacePlan={workspacePlan}
        onConfirm={handleUpgrade}
        currentStorage={currentTotalStorage}
        basePlanStorage={baseStorage}
        basePlanCost={basePlanCost}
        newAdditionalStorage={increaseMinutes}
        newAdditonalCost={extraCost}
        newMonthlyTotal={newMonthlyTotal}
        additionalStorage={additionalStorage}
        currentAdditionalCost={currentAdditionalCost}
        currentMonthlyTotal={currentMonthlyTotal}
      />
    </div>
  );
}