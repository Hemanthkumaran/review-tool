import { Outlet } from "react-router-dom";
import AppLoader from "../../components/common/AppLoader";
import DashboardHeader from "../../components/DashboardHeader";
import { useUser } from "../../context/UserContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useEffect, useState } from "react";
import SubscriptionModal from "../modals/SubscriptionModal";
import { constants } from "../../helpers/enum";
import { ActivateIcon, Confetti, LockIcon, PaymentFailureIcon } from "../../assets/svgs/SvgComponents";

const BLOCKED_SUBSCRIPTION_STATUSES = ["none", "inactive", "expired", "locked"];
const BLOCKED_MODAL_STEPS = ["trialStarted", "welcomeAboard", "choosePlan"];

export default function DashboardLayout() {
  const { user, profileLoading } = useUser();

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    loading,
    setLoading,
    userAccess,
    subscriptionStatus,
    workspacePlan,
    trialUsed
  } = useWorkspace();

  const [modalStep, setModalStep] = useState(null);

  // ✅ Stable ready state (prevents flicker)
  const isWorkspaceReady =
    activeWorkspace &&
    subscriptionStatus !== undefined &&
    userAccess !== undefined;

  const isTrialEndedForOwner =
    userAccess === constants.OWNER &&
    trialUsed &&
    BLOCKED_SUBSCRIPTION_STATUSES.includes(subscriptionStatus);

  useEffect(() => {
    if (!isWorkspaceReady) return;

    // 🚫 DO NOT override success modals
    if (BLOCKED_MODAL_STEPS.includes(modalStep)) return;

    if (
      subscriptionStatus === "active" ||
      subscriptionStatus === "trialing"
    ) {
      setModalStep(null);
    } else if (BLOCKED_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)) {
      setModalStep("noPlan");
    }
  }, [isWorkspaceReady, subscriptionStatus, modalStep]);

  // ✅ Loader FIRST (prevents UI flicker)
  if (loading || profileLoading || !isWorkspaceReady) {
    return <AppLoader visible={true} message="Loading…" />;
  }

  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
      <DashboardHeader
        user={user}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        workspacePlan={workspacePlan}
        userAccess={userAccess}
        setLoading={setLoading}
        trialUsed={trialUsed}
      />

      {/* ✅ Modal (now stable, no flicker) */}
      {modalStep === "noPlan" && (
        <SubscriptionModal
          open={true}
          title={
            isTrialEndedForOwner
              ? "Your 7-day free trial has ended"
              : userAccess === constants.OWNER
              ? trialUsed
                ? "You don't have an active plan"
                : "Activate your workspace"
              : "No active plan switch workspace"
          }
          subtitle={
            isTrialEndedForOwner
              ? "Pick a plan to continue using your workspace."
              : userAccess === constants.OWNER
              ? trialUsed
                ? "Choose a plan to continue using this workspace."
                : "Select a 7-day free trial plan so we can set up your workspace for use."
              : ""
          }
          ModalImg={
            isTrialEndedForOwner
              ? <PaymentFailureIcon />
              : userAccess === constants.OWNER
              ? <ActivateIcon />
              : <Confetti />
          }
          buttonTitle={isTrialEndedForOwner ? "See options" : "Choose plan"}
          onBtnClick={() => setModalStep("choosePlan")}
          showBtn={userAccess === constants.OWNER}
          maxWidthClassName={isTrialEndedForOwner ? "max-w-[720px]" : "max-w-md"}
          topRightBadge={
            isTrialEndedForOwner ? (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F9EF38]">
                <LockIcon />
              </span>
            ) : null
          }
        />
      )}

      <Outlet context={{ modalStep, setModalStep }} />
    </div>
  );
}
