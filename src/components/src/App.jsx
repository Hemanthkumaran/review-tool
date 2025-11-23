import { useState } from "react";
import AddProject from "./components/AddProject/AddProject";
import CreateFolder from "./components/CreateFolder/CreateFolder";
import Folder from "./components/Folder/Folder";
import ProjectFolder from "./components/ProjectFolder/ProjectFolder";
import  Accordion from "./components/Accordion/Accordion"
import SubscriptionCard from "./components/UsageAndBilling/SubsrciptionCard/SubscriptionCard";
import StorageSlider from "./components/UsageAndBilling/Silder/StorageSlider";
import SettingsLayout from "./Layout/Settings/SettingsLayout";



function App() {

  return (
    <div >
      {/* <Folder />
      <CreateFolder />
      <div style={{ margin: "20px 0" }}>hello</div>
      <AddProject />
      <div style={{ margin: "20px 0" }}>hello</div>
      <ProjectFolder />
      <ACard />*/ }
      <Accordion/> 
      {/* <SubscriptionCard/> */}
      <SettingsLayout/>
    </div>
  );
}

export default App;
