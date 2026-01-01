import { Navigate } from "react-router-dom";
import { PATHS } from "./paths";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("authToken");
  console.log(token, 'token');
  
  // if already logged in → go to dashboard
  if (token) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  return children;
}
