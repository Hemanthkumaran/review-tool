import { useEffect, useState } from "react";
import "./WorkspaceSettings.css";
import OutlineInput from "../../../textInputs/OutlineInput";
import lock from "../../assets/icons/lock.svg";
import lockgray from "../../assets/icons/lockgray.svg";
import EditableAvatar from "../../components/EditAvatar/EditableAvatar";
import BrandColorPicker from "../../components/BrandColor/BrandColorPicker";
import Button from "../../../UI/Button";
import { useWorkspace } from "../../../../context/WorkspaceContext";
import { updateWorkspaceApi } from "../../../../services/api";
// import { useRazorpay } from "../../../../hooks/useRazorpay";
import FeatureLockedModal from "../../../modals/FeatureLockedModal";
import { Confetti, FeatureLockIcon } from "../../../../assets/svgs/SvgComponents";

const WorkspaceSettings = ({ onClose }) => {

  const [workspaceName, setWorkspaceName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  const [brandColor, setBrandColor] = useState(null)
  const [successModal, setSuccessModal] = useState(false)

  // const { openCheckout } = useRazorpay();
  const {brandingColor, ownerWorkspace, activeWorkspace, refreshWorkspace } = useWorkspace();
  
  // const subscription = workspacePlan?.subscription;

  // const addOnStatus = subscription?.status;
  

  // 🔁 Prefill data
  useEffect(() => {
    if (!ownerWorkspace) return;
    setBrandColor(ownerWorkspace?.colourCode);
    setWorkspaceName(ownerWorkspace.name || "");
    setLogoUrl(ownerWorkspace.logo?.url || null);
  }, [ownerWorkspace]);

  // const handleUnlockBranding = async () => {
  //   setShowModal(false);
  //   const payload = {
  //     activePlan: subscription?.activePlan,
  //     interval: subscription?.interval,
  //     additionalStorageMinutes: subscription?.additionalStorageMinutes,
  //     purpose: "upgrade",
  //     addons: ["white_label"],
  //   }
  // try {
  //   const res = await createAddonPaymentApi(activeWorkspace._id, payload);
  //   const order = res.data.razorpay;
    
  //   openCheckout({
  //     orderId: order.orderID,
  //     amount: order.amount,
  //     currency: order.currency,
  //     name: activeWorkspace.name,
  //     onSuccess: async () => {
  //       refreshWorkspacePlan(activeWorkspace._id);
  //       setSuccessModal(true);
  //     },
  //     brandingColor: brandingColor
  //   });

  //   } catch (err) {
  //     alert(err.response.data.error)
  //     console.error(err.response.data.error);
  //   }
  // };

  const handleSave = async () => {
    if (!activeWorkspace?._id) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("workspaceName", workspaceName);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (brandColor) {
        formData.append("colourCode", brandColor);
      }

      await updateWorkspaceApi(activeWorkspace._id, formData);

      // 🔥 refresh workspace list + active workspace
      await refreshWorkspace();
    } catch (err) {
      console.error("Failed to update workspace", err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeWorkspace) return null;

  return (
    <div>
      <div className="text-2xl font-bold pb-4 text-[#ffffff]">
        Workspace settings
      </div>

      <div>Edit your workspace name and customize the tool to your brand.</div>
      <br />

      <OutlineInput
        label="Workspace Name"
        placeholder="A2Z Studio"
        value={workspaceName}
        onChange={(e) => setWorkspaceName(e.target.value)}
        styles={{
          border: "2px solid #2a2a2a",
          width: "80%",
          padding: "24px",
          borderRadius:12
        }}
      />


      <br />

      <div style={{ background: "#181818" }} className="w-[80%] cursor-pointer pt-6 pl-6 pb-4 border-[#2a2a2a] border-2 rounded-2xl">
        <div className="flex justify-between mb-4">
          <div>Logo</div>
          {/* <div className="cursor-pointer bg-[yellow] p-1 rounded-md mr-4">
            <img height="20" width="20" src={lock} alt="" />
          </div> */}
        </div>

        <EditableAvatar
          imageUrl={logoUrl}
          onImageSelect={setLogoFile}
        />

        <br />
        <BrandColorPicker brandColor={brandColor} setBrandColor={setBrandColor} />
      </div>

      <div className="domain">
        <div className="domain-head">
          <div className="mr-4">Custom Domain</div>
          <Button
            content="coming soon"
            width="100px"
            bgColor="#323232"
            textColor="#000"
            styles={{ fontSize:11 }}
          />
        </div>

        <div className="relative mt-[-8px]">
          <OutlineInput
            disabled={true}
            placeholder="www.review.A2Zstudio.com"
            styles={{
              border: "2px solid #2a2a2a",
              width: "100%",
              padding: "24px",
              borderRadius: 12
            }}
          />
          <img
            className="absolute bottom-[14px] right-4"
            height="24"
            width="22"
            src={lockgray}
            alt=""
          />
        </div>

        <div className="flex justify-end mt-8">
          <Button
            width="110px"
            content="Cancel"
            textColor="white"
            bgColor="#131313"
            marginRight="8px"
            onClick={onClose}
            styles={{ border:"1px solid #2B2B2B"}}
          />
          <Button
            width="120px"
            content={loading ? "Saving..." : "Save"}
            textColor="black"
            bgColor={brandingColor}
            disabled={workspaceName.length > 2 ? false : true}
            onClick={handleSave}
          />
        </div>
      </div>
      {/* <FeatureLockedModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Feature locked"
        subtitle="Custom branding is part of a $5/month add-on. Once added, you can upload a logo and change accent colors instantly."
        buttonTitle="Activate add-on"
        ModalImg={<FeatureLockIcon />}
        onBtnClick={handleUnlockBranding}
      /> */}
      <FeatureLockedModal
        open={successModal}
        onClose={() => setSuccessModal(false)}
        title="Custom Branding Activated!"
        subtitle="Yayy! Your payment went through. Add your logo and customize the color theme of the tool."
        buttonTitle="Customize UI"
        ModalImg={<Confetti />}
        onBtnClick={() => setSuccessModal(false)}
      />
    </div>
  );
};

export default WorkspaceSettings;