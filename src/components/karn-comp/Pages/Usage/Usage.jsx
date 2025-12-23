import StorageSlider from "../../components/UsageAndBilling/Silder/StorageSlider";

export const Usage = () => {
  return (
    <div>
      {/* storage */}
      <div className="billing-footer">
        <div>Storage management</div>
        <br />
        <StorageSlider />
      </div>
    </div>
  );
};
