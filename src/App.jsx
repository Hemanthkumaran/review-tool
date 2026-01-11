import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return <div style={{ position: "relative" }}>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar
      closeButton={false}
      draggable={false}
      pauseOnHover
      toastClassName={() => "bg-transparent shadow-none"}
    />
    </div>;
}

export default App;
