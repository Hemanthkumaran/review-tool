import { Outlet } from "react-router-dom";
import AppLoader from "../../components/common/AppLoader";
import DashboardHeader from "../../components/DashboardHeader";
import { useUser } from "../../context/UserContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useEffect, useState } from "react";
import SubscriptionModal from "../modals/SubscriptionModal";
import { constants } from "../../helpers/enum";

export default function DashboardLayout() {
  const { user, profileLoading } = useUser();

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    loading,
    userAccess,
    subscriptionStatus
  } = useWorkspace();

  const [modalStep, setModalStep] = useState(null);

  const subscription = { status: subscriptionStatus };
  console.log(subscription, 'subs');
  
  useEffect(() => {
    if (!activeWorkspace) return;

    if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
      setModalStep(null);
      return;
    }

    if (
      subscriptionStatus === "none" ||
      subscriptionStatus === "inactive" ||
      subscriptionStatus === "expired"
    ) {
      setModalStep("noPlan");
    }

  }, [activeWorkspace?._id, subscriptionStatus]);



  if (loading && profileLoading) {
    return <AppLoader visible={loading} message="Loading…" />;
  }
  
  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      <DashboardHeader
        user={user}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        subscription={subscription}
        userAccess={userAccess}
      />
        {/* ⭐ modal shown here, not inside page */}
        {modalStep === "noPlan" && (
          <SubscriptionModal
            open={true}
            title={userAccess == constants.OWNER ? "You don't have an active plan" : "No active plan switch workspace"}
            subtitle={userAccess == constants.OWNER ?"Choose a plan to continue using this workspace." : ""}
            buttonTitle="Choose plan"
            onBtnClick={() => setModalStep("choosePlan")}
            showBtn={userAccess == constants.OWNER}
          />
        )}
      <Outlet context={{ modalStep, setModalStep }}/>
    </div>
  );
}
