import StorageSlider from "../../components/UsageAndBilling/Silder/StorageSlider";

export const Usage = () => {
  return (
    <div>
      <div className="billing-footer">
        <div style={{ fontFamily:'Gilroy-SemiBold', fontSize:18 }}>Usage</div>
        <div style={{ fontFamily:'Gilroy-Light', fontSize:14, marginTop:8 }}>Review your current usage and manage extras as needed.</div>
        <div style={{ fontFamily:'Gilroy-SemiBold', marginTop:25, marginBottom:15 }}>Adjust storage</div>
        <StorageSlider />
      </div>
    </div>
  );
};
