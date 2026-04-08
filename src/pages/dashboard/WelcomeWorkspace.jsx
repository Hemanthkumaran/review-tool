import { useState } from 'react';

import CreateFolderModal from '../../components/modals/CreateFolderModal';
import cutjamm from '../../assets/svgs/cutjamm.svg';
import Folder from '../../components/Folder/Folder';
import { PATHS } from '../../routes/paths';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { allFoldersApi, createFolderApi } from '../../services/api';
import { useEffect } from 'react';
import SegmentedTabs from '../../components/SegmentedTabs';
import ProjectAccordion from '../../components/karn-comp/components/Accordion/Accordion';
import { useWorkspace } from '../../context/WorkspaceContext';
import { constants } from '../../helpers/enum';
import filterIcon from "../../assets/svgs/filter.svg";
import ProjectFilter from '../../components/ProjectFilter';
import ChoosePlanModal from '../../pages/chooseplan';
import Spinner from '../../components/common/Spinner';
import ShareModal from '../../components/modals/ShareModal';
import SubscriptionModal from '../../components/modals/SubscriptionModal';
import { ResumeSubIcon } from '../../assets/svgs/SvgComponents';
import SettingsModal from '../../components/karn-comp/Layout/Settings/SettingsModal';
import * as Accordion from "@radix-ui/react-accordion";

export default function WelcomeWorkspace({
  onCreateFolder = () => {},
}) {

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("allFolders");
  const { activeWorkspace, brandingColor, loading: workspaceLoading, userAccess, billingLoading, setSubscriptionStatus, trialUsed, setTrialUsed } = useWorkspace();
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [chosenPlan, setChosenPlan] = useState(null);
  const [openFolders, setOpenFolders] = useState([]);

  const [filters, setFilters] = useState({
    assignment: null,
    status: []
  });
  // const [modalStep, setModalStep] = useState(null);
  const navigate = useNavigate();
  const { modalStep, setModalStep } = useOutletContext();

  
  useEffect(() => {
    if (workspaceLoading) return;
    if (!activeWorkspace?._id) return;

    getAllFolders();

  }, [workspaceLoading, activeWorkspace?._id, filters]);

  useEffect(() => {
    if (brandingColor) {
      document.documentElement.style.setProperty(
        "--brand-color",
        brandingColor
      );
    }
  }, [brandingColor]);


  useEffect(() => {
    if (activeTab !== "projects") {
      setFilters({
        assignment: null,
        status: []
      });
    }
  }, [activeTab]);

  function handleCreate() {
    setCreateLoading(true);
    createFolderApi({ name: 'Untitled', workspaceID: activeWorkspace._id })
    .then(() => {
      setCreateLoading(false);
      setCreateModalOpen(false);
      getAllFolders();
    })
    .catch(() => {
      setCreateLoading(false);
    })
  }

  
 function getAllFolders(isAfterCheckout = false) {
  setFoldersLoading(true);

  allFoldersApi("createdAt", "desc", activeWorkspace._id, filters)
    .then((res) => {
      const status = res.data.subscriptionStatus;
      setSubscriptionStatus(status);
      setTrialUsed(res.data.trialUsed);
      setAllFolders(res.data.folderArray);

      // ⭐ AFTER CHECKOUT SUCCESS
      if (isAfterCheckout) {
        if (status === "trialing") setModalStep("trialStarted");
        else if (status === "active") setModalStep("welcomeAboard");
        return;
      }

      // ⭐ NORMAL WORKSPACE SWITCH / LOAD
      if (status === "none" || status === "inactive" || status === "expired") {
        setModalStep("noPlan");
      } else {
        setModalStep(null);
      }
    })
    .catch(console.error)
    .finally(() => setFoldersLoading(false));
}

  
  function handleFolderUpdated(folderId, newName) {
    setAllFolders((prev) =>
      prev.map((f) =>
        f._id === folderId ? { ...f, name: newName } : f
      )
    );
  }
  
  function handleFolderDeleted(folderId) {
    setAllFolders((prev) =>
      prev.filter((f) => f._id !== folderId)
    );
  }

  function getActiveContent() {
    if (activeTab === "allFolders" && userAccess !== constants.REVIEWER) {
      if (allFolders.length == 0) {
        return <div style={{ color:"#5C5C5C" }} className="flex items-center justify-center mt-20">
          <div className="text-center text-[#5C5C5C]">
            <div>There are no folders here</div>
            <div>Please create a new folder to get started</div>
          </div>
        </div>
      }
      return <div className="flex gap-4 mt-3 flex-wrap">
        {allFolders.map((item) => (
          <Folder
            key={item._id}
            folder={item}
            noOfProjects={item.projects.length}
            onClick={() => navigate(`${PATHS.ADD_PROJECT}?ws=${activeWorkspace?._id}&folder=${item._id}&folderName=${item.name}`)}
            onRenamed={handleFolderUpdated}
            onDeleted={handleFolderDeleted}
          />
        ))}
      </div>
    }
     else {
      if (allFolders.length == 0) {
        return <div style={{ color:"#5C5C5C" }} className="flex items-center justify-center mt-20">
          <div className="text-center text-[#5C5C5C]">
            <div>There are no projects here</div>
          </div>
        </div>
      }
      return <Accordion.Root
          type="multiple"
          value={openFolders}
          onValueChange={setOpenFolders}
          className="accordion-root"
        >
          {allFolders.map(folder => (
            <ProjectAccordion
              key={folder._id}
              folder={folder}
              getAllFolders={getAllFolders}
            />
          ))}
        </Accordion.Root>
    }
  }
  const isLocked = modalStep === "noPlan";
  const isLoading = workspaceLoading || foldersLoading || billingLoading;
  console.log(modalStep, 'modalStep');
  
  // if (isLocked) {
  //   return <div style={{ top:"8%" }} className="absolute inset-0 z-40 backdrop-blur-sm  pointer-events-none" />
  // }
  return (
    <div className="min-h-screen w-full text-white px-4 mt-4">
        {/* 🔴 Blur overlay */}
  {isLocked && (
    <div style={{ top:"8%" }} className="absolute  inset-0 z-40 backdrop-blur-sm bg-black/50 pointer-events-none" />
  )}
      <main className="px-6 md:px-8">
        <div className="mt-8 h-[45px] flex items-center justify-between">
          <div style={{ fontFamily:"Gilroy-SemiBold", fontSize:24 }}>
            Welcome to {activeWorkspace?.name}'s workspace
          </div>
          {activeTab == "allFolders" ? 
            <div className="hidden md:flex items-center gap-3">
              {userAccess == constants.OWNER && <button
                onClick={() => setIsSettingModalOpen(true)}
                className="inline-flex items-center cursor-pointer gap-2 rounded-full bg-[#151618] border border-[#232427] px-4 py-2 hover:bg-[#1A1B1E]"
              >
                <InviteIcon className="h-4 w-4" />
                <span>Invite</span>
              </button>}
              {(userAccess == constants.OWNER || userAccess == constants.MEMBER) &&
                <button
                onClick={handleCreate}
                style={{ background: brandingColor }}
                className={`cursor-pointer inline-flex items-center gap-2 rounded-full text-black px-4 py-2 hover:opacity-90`}
              >
                <PlusThin className="h-4 w-4" />
                <span>Create folder</span>
              </button>}
            </div> :
            <div className="relative">
              <img
                src={filterIcon}
                className="cursor-pointer"
                onClick={() => setShowFilter((v) => !v)}
              />
              {showFilter && (
                <ProjectFilter
                  filters={filters}
                  onChange={setFilters}
                  onClose={() => setShowFilter(false)}
                />
              )}
            </div>
          }
        </div>
        <div className="mt-6 flex items-center justify-between">
            {userAccess != constants.REVIEWER && <div style={{ width:250 }} className="mt-2">
              <SegmentedTabs
                options={[
                  { id: "allFolders", label: "All folders" },
                  { id: "projects", label: "Projects" },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsSettingModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#151618] border border-[#232427] px-3 py-2 hover:bg-[#1A1B1E]"
            >
              <InviteIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>
            <button
              onClick={onCreateFolder}
              className="inline-flex items-center gap-2 rounded-full bg-[#F9EF38] text-black px-3 py-2 hover:opacity-90"
            >
              <PlusThin className="h-4 w-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
        {
          isLoading ?
          <div className='flex items-center justify-center mt-30'>
            <Spinner size={46} color={brandingColor} />
          </div> :
          getActiveContent()
        }
      </main>
      {/* <div className="fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#101213] px-3 py-2">
        <img src={cutjamm}/>
        <span style={{ fontFamily:'Gilroy-Light' }} className="text-[#fff]">powered by Cutjamm</span>
      </div> */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        handleCreate={handleCreate}
        loading={createLoading}
      />
      <ChoosePlanModal
        open={modalStep == "choosePlan"}
        setChosenPlan={(plan) => {
          setChosenPlan(plan);
          setModalStep(null)
        }}
        // onSuccess={() => {
        //     setModalStep("trialStarted");
        //     getAllFolders(); // refresh status
        // }}
        onSuccess={() => {
          getAllFolders(true);   // pass flag to detect post-payment
        }}
        trialUsed={trialUsed}
        buttonLabel={!trialUsed ? "Start free trial" : "Subscribe"}
      />
      {modalStep === "activate" && (
        <SubscriptionModal
          open={true}
          title="Activate your workspace!"
          subtitle="Select a 7-day free trial plan so we can set up your workspace for use."
          buttonTitle="See options"
          onBtnClick={() => setModalStep("choosePlan")}
          ModalImg={<ResumeSubIcon/>}
        />
      )}
      {/* {modalStep === "noPlan" && (
        <SubscriptionModal
          open={true}
          title="You don't have an active plan"
          subtitle="Choose a plan to continue using your workspace."
          buttonTitle="Choose plan"
          onBtnClick={() => setModalStep("choosePlan")}
        />
      )} */}
      {modalStep === "trialStarted" && (
        <SubscriptionModal
          open={true}
          title={`Welcome to your ${chosenPlan ?? "new"} trial`}
          subtitle="Your free trial is active. Feel free to try every feature and see what works best for you."
          buttonTitle="Go to dashboard"
          onBtnClick={() => setModalStep(null)}
        />
      )}
      {modalStep === "welcomeAboard" && (
        <SubscriptionModal
          open={true}
          title="Welcome aboard!"
          subtitle="Your subscription is active. Enjoy your workspace. You can manage your billing details under Settings → Billing"
          buttonTitle="Get started"
          onBtnClick={() => setModalStep(null)}
        />
      )}
        {/* SETTINGS MODAL */}
          <SettingsModal
            isOpen={isSettingModalOpen}
            onClose={() => setIsSettingModalOpen(false)}
            activeScreen={"users"}
            loading={createLoading}
            activeWorkspace={activeWorkspace}
          />
    </div>
  );
}

function PlusThin({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M10 4v12M4 10h12" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InviteIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z" stroke="#BFBFBF" strokeWidth="1.6"/>
      <path d="M3 21c1.7-3.3 5-5.5 9-5.5s7.3 2.2 9 5.5" stroke="#BFBFBF" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}