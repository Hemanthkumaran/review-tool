import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import AppLoader from "../../components/common/AppLoader";
import DashboardHeader from "../../components/DashboardHeader";
import { useUser } from "../../context/UserContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useEffect, useState } from "react";
import SubscriptionModal from "../modals/SubscriptionModal";
import { constants } from "../../helpers/enum";
import { ActivateIcon, FeatureLockIcon, LockIcon, PaymentFailureIcon, ResumeSubIcon } from "../../assets/svgs/SvgComponents";
import { usePageTitle } from "../../hooks/usePageTitle";

const BLOCKED_SUBSCRIPTION_STATUSES = ["none", "inactive", "expired", "locked"];
const BLOCKED_MODAL_STEPS = ["trialStarted", "welcomeAboard", "choosePlan"];

export default function DashboardLayout() {
  const { user, profileLoading } = useUser();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    loading,
    setLoading,
    userAccess,
    subscriptionStatus,
    workspacePlan,
    trialUsed,
    workspaceAccessDenied,
    goToMyWorkspace,
  } = useWorkspace();
  
  const [modalStep, setModalStep] = useState(null);
  const folderName = searchParams.get("folderName");
  const pageTitle =
    location.pathname === "/dashboard/add-project"
      ? folderName || "Projects"
      : activeWorkspace?.name || "Dashboard";
  usePageTitle(pageTitle);

  // ✅ Stable ready state (prevents flicker)
  const isWorkspaceReady =
    activeWorkspace &&
    subscriptionStatus !== undefined &&
    userAccess !== undefined;

  const isOwner = userAccess === constants.OWNER;
  const isBlockedSubscription =
    BLOCKED_SUBSCRIPTION_STATUSES.includes(subscriptionStatus);
  const isTrialEndedForOwner =
    isOwner &&
    trialUsed &&
    isBlockedSubscription;

  useEffect(() => {
    if (!isWorkspaceReady) return;

    // 🚫 DO NOT override success modals
    if (BLOCKED_MODAL_STEPS.includes(modalStep)) return;

    if (workspaceAccessDenied) {
      setModalStep("accessUnavailable");
      return;
    }

    if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
      setModalStep(null);
    } else if (isBlockedSubscription) {
      setModalStep(
        isOwner
          ? trialUsed
            ? "trialEnded"
            : "activateWorkspace"
          : "inactiveWorkspace"
      );
    }
  }, [
    isWorkspaceReady,
    workspaceAccessDenied,
    subscriptionStatus,
    isBlockedSubscription,
    isOwner,
    trialUsed,
    modalStep,
  ]);

  const blockingModalConfig = {
    trialEnded: {
      title: "Your 14-day free trial has ended",
      subtitle: "Pick a plan to continue using your workspace.",
      ModalImg: <PaymentFailureIcon />,
      buttonTitle: "See options",
      onBtnClick: () => setModalStep("choosePlan"),
      maxWidthClassName: "max-w-[560px]",
      topRightBadge: (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F9EF38]">
          <LockIcon />
        </span>
      ),
    },
    activateWorkspace: {
      title: "Activate your workspace!",
      subtitle:
        "Select a 14-day free trial plan so we can set up your workspace for use.",
      ModalImg: <ActivateIcon />,
      buttonTitle: "See options",
      onBtnClick: () => setModalStep("choosePlan"),
      maxWidthClassName: "max-w-md",
    },
    inactiveWorkspace: {
      title: "This workspace is inactive",
      subtitle: "Please contact the workspace owner to restore access.",
      ModalImg: <ResumeSubIcon />,
      buttonTitle: "Go to my workspace",
      onBtnClick: goToMyWorkspace,
      maxWidthClassName: "max-w-md",
    },
    accessUnavailable: {
      title: "Oops! Access unavailable to this workspace",
      subtitle: "Contact the admin if this seems incorrect.",
      ModalImg: <FeatureLockIcon />,
      buttonTitle: "Go to my workspace",
      onBtnClick: goToMyWorkspace,
      maxWidthClassName: "max-w-md",
    },
  }[modalStep];

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
      {blockingModalConfig && (
        <SubscriptionModal
          open={true}
          title={blockingModalConfig.title}
          subtitle={blockingModalConfig.subtitle}
          ModalImg={blockingModalConfig.ModalImg}
          buttonTitle={blockingModalConfig.buttonTitle}
          onBtnClick={blockingModalConfig.onBtnClick}
          showBtn={true}
          maxWidthClassName={blockingModalConfig.maxWidthClassName}
          topRightBadge={blockingModalConfig.topRightBadge}
        />
      )}

      <Outlet context={{ modalStep, setModalStep, isTrialEndedForOwner }} />
    </div>
  );
}
