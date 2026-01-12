import React, { useState } from "react";
import { Range } from "react-range";
import "./StorageSlider.css";
import { useRazorpay } from "../../../../../hooks/useRazorpay";

const STEP = 10;
const MIN = 500;
const MAX = 2000;

export default function StorageSlider() {
  const [values, setValues] = useState([900]); // Default mid-range
  const { openCheckout } = useRazorpay();
  const [loading, setLoading] = useState(false);


  const handleUpgrade = async () => {
    setLoading(true);

    try {
      // const order = await createUpgradeOrder(plan);

      openCheckout({
        // orderId: order.orderId,
        // amount: order.amount,
        // currency: order.currency,
        // name: user.name,
        // email: user.email,
        // onSuccess: () => {
        //   alert("Payment successful");
        //   window.location.reload();
        // }
      });
    } catch (e) {
      alert(e, "Payment failed");
    }

    setLoading(false);
  };

  
  return (
    <div className="slider-card">
      <p className="slider-title">
        Adjust your total storage. Changes will apply on your next billing date.
      </p>

      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={(vals) => setValues(vals)}
        renderTrack={({ props, children }) => (
          <div {...props} className="slider-track" style={props.style}>
            <div
              className="slider-track-filled"
              style={{ width: `${((values[0] - MIN) / (MAX - MIN)) * 100}%` }}
            />
            <div className="slider-track-empty" />
            {children}
          </div>
        )}
        renderThumb={({ props }) => <div {...props} className="slider-thumb" />}
      />

      <div className="slider-labels">
        <span>{MIN} min</span>
        <span>{MAX} min</span>
      </div>
        {/* plan wrapper */}
      <div className="plan-wrapper">
        <div className="plan-card">
          {/* Header */}
          <div className="plan-row header">
            <span>Total storage</span>
            <span className="strong">900 min</span>
          </div>

          <div className="divider" />

          {/* Details */}
          <div className="plan-row">
            <span>Base plan (500 min)</span>
            <span>$25</span>
          </div>

          <div className="plan-row">
            <span>Additional storage (400 min)</span>
            <span>$20</span>
          </div>

          <div className="divider" />

          {/* Total */}
          <div className="plan-row total">
            <span>New monthly total</span>
            <span className="highlight">$45</span>
          </div>
        </div>

        {/* Action */}
        <div className="plan-action">
          <button onClick={handleUpgrade} className="change-btn">Change plan</button>
        </div>
      </div>
    </div>
  );
}
