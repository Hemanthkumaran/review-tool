import StorageSlider from "../../components/UsageAndBilling/Silder/StorageSlider";
import SubscriptionCard from "../../components/UsageAndBilling/SubsrciptionCard/SubscriptionCard";
import close from "../../assets/icons/close.svg";
import "./UsageBilling.css";
import Button from "../../UI/Button";
const UsageBilling = () => {
  return (
    <>
      {/* usage and billing */}
      <div className="bill-header">
        <div className="bill-header-main">
          <div>Usage and Billing</div>
          <img width="26px" src={close} alt="" />
        </div>
        <div style={{ fontSize: "14px" }}>
          Lorem ipsum dolor sint, esse vero corrupti, modi illum culpa
          laboriosam, voluptatum reiciendis alias! Quis quos quia maiores!
          Repellat, id officia?
        </div>
      </div>
      <br />
      {/* subscription */}
      <div>
        <SubscriptionCard />
        <div style={{ margin: "24px 0 0 0" }}>
          <Button
            padding="8px 18px"
            textColor="#fff"
            bgColor="black"
            border="2px solid #2a2a2a"
            marginRight="10px"
            width="fit-content"
            content="View Invoices"
          />
          <Button
            padding="8px 18px"
            textColor="#fff"
            bgColor="black"
            border="2px solid #2a2a2a"
            width="fit-content"
            content="Update billing details"
          />
        </div>
      </div>
      <br />
      <br />
      {/* storage */}
      <div className="billing-footer">
        <div>Storage management</div>
        <br />
        <StorageSlider />
      </div>
    </>
  );
};

export default UsageBilling;
