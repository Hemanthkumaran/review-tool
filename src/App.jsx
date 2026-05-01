import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { UploadProvider } from "./context/UploadContext";
import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return <div style={{ position: "relative" }}>
    <AuthProvider>
      <UploadProvider>
        <AppRouter />
      </UploadProvider>
    </AuthProvider>
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar
      closeButton={false}
      draggable={false}
      pauseOnHover
      toastClassName={() => "!bg-transparent !shadow-none !p-0 !mb-3"}
      bodyClassName={() => "!m-0 !p-0"}
      style={{ width: "auto", zIndex: 200000 }}
    />
    </div>;
}

export default App;
