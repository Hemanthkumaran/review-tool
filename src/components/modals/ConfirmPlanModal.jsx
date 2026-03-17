import Modal from "react-modal";

import confirmPlanSvg from '../../assets/svgs/confirm-plan.svg';
import "./modal.css";

export default function ConfirmPlanModal({
  workspacePlan,
  isOpen,
  onClose,
  onConfirm,
  currentMonthlyTotal,
  basePlanStorage,
  basePlanCost,
  currentAdditionalCost,
  additionalStorage,
  newAdditonalCost,
  newAdditionalStorage,
  newMonthlyTotal,
  decreaseMinutes,
  costPerMinute
}) {
  
  const payNow = newAdditonalCost > 0;


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="confirm-modal"
      overlayClassName="confirm-overlay"
      shouldCloseOnOverlayClick
    >
      {/* Close */}
      <button className="close-btn" onClick={onClose}>✕</button>
      <div className="flex-column justify-items-center">
        <img src={confirmPlanSvg}/>
        <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:18, marginTop:15 }}>Confirm your plan change</div>
      </div>
      

      {/* Current Plan */}
      <div className="section">
        <div style={{ fontFamily:'Gilroy-Medium', marginTop:10, marginBottom:10 }}>Current plan</div>
        <div className="plan-c-card">
          <div style={{ color:"#BFBFBF", fontSize:14 }} className="flex justify-between mb-4">
            <div>
              <span style={{ textTransform:'capitalize'}}>{workspacePlan?.subscription?.activePlan} plan </span>
              <span>({" " + basePlanStorage + " " + 'mins' + " "}) </span>
            </div>
            <div>{`$ ${basePlanCost}/mo`}</div>
          </div>
          <div style={{ color:"#BFBFBF", fontSize:14 }} className="flex justify-between mb-4">
            <div>
              <span style={{ textTransform:'capitalize'}}>{`Additional Storage Cost (${additionalStorage}  mins)`} </span>
            </div>
            <div>{`$ ${currentAdditionalCost}/mo`}</div>
          </div>
          <div style={{ height:1, backgroundColor:"#2B2B2B", marginBottom:10 }}/>
          <div className="flex justify-between">
            <div style={{ color:"#BFBFBF", fontFamily:'Gilroy-Bold' }}>Total monthly cost</div>
            <div>${currentMonthlyTotal}/month</div>
          </div>
        </div>
      </div>

      {/* New Plan */}
      <div className="section">
        <div style={{ fontFamily:'Gilroy-Medium', marginTop:10, marginBottom:10 }}>New plan</div>
        <div style={{ border:"1px solid #F9EF38" }} className="plan-c-card">
          <div style={{ color:"#BFBFBF", fontSize:14, marginTop:5 }} className="flex justify-between mb-4">
            <div>
              <span style={{ textTransform:'capitalize'}}>{workspacePlan?.subscription?.activePlan} plan </span>
              <span>({" " + workspacePlan?.subscription?.baseStorageMinutes + " " + 'mins' + " "}) </span>
            </div>
            <div>{`$ ${workspacePlan?.subscription?.baseStorageMinutes * workspacePlan?.costPerMinute}/mo`}</div>
          </div>
          <div style={{ color:"#BFBFBF", fontSize:14 }} className="flex justify-between mb-4">
            <div>
              <span style={{ textTransform:'capitalize'}}>{`Current Additional Storage Cost (${additionalStorage}  mins)`} </span>
            </div>
            <div>{`$ ${currentAdditionalCost}/mo`}</div>
          </div>
          {newAdditionalStorage > 0 && (
            <div className="plan-row">
              <span>Additional storage (+{newAdditionalStorage} min)</span>
              <span>+${newAdditonalCost.toFixed(2)}</span>
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
          <div style={{ height:1, backgroundColor:"#2B2B2B", marginBottom:10 }}/>
          <div className="flex justify-between">
            <div style={{ color:"#BFBFBF", fontFamily:'Gilroy-Bold' }}>Total monthly cost (from next billing cycle)</div>
            <div>${newMonthlyTotal}/month</div>
          </div>
        </div>
      </div>

      {/* Charge note */}
      <p className="note">
        {/* You will only be charged ${extraCost} this time. */}
        Changes will be reflected from next billing cycle
      </p>

      {/* Actions */}
      <div className="actions">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
<button className="confirm-btn" onClick={onConfirm}>
  {payNow
    ? `Pay $${newAdditonalCost.toFixed(2)} to upgrade`
    : "Confirm changes"}
</button>
      </div>
    </Modal>
  );
}