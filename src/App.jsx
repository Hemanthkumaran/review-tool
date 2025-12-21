import "./App.css";
import FeatureLockedModal from "./components/karn-comp/components/WorkSpaceModal/FeatureLockedModal";
import WorkSpaceModal from "./components/karn-comp/components/WorkSpaceModal/WorkSpaceModal";
import SettingsLayout from "./components/karn-comp/Layout/Settings/SettingsLayout";
import AppRouter from "./routes/AppRouter";

function App() {
  return <div style={{ position: "relative" }}>
    {/* <AppRouter /> */}

   <SettingsLayout />
    </div>;
}

export default App;
