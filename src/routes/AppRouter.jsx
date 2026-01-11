import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { PATHS } from "./paths";

import CreateAccount from "../pages/onboarding";
import Dashboard from "../pages/dashboard";
import AddProject from "../pages/dashboard/AddProject";
import VideoReview from "../pages/video-review";
import ChoosePlan from "../pages/chooseplan";
import FreeTrialModal from "../components/modals/FreetrialModal";
import ReviewerRoute from "./ReviewerRoute";

const NotFound = () => <div className="p-8">404 - Not Found</div>;

const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: (
      <PublicRoute>
        <CreateAccount />
      </PublicRoute>
    ),
  },
  {
    path: PATHS.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
        {/* <ChoosePlan/> */}
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.ADD_PROJECT,
    element: (
      <ProtectedRoute>
        <AddProject />
      </ProtectedRoute>
    ),
  },
  {
    path: PATHS.VIDEO_REVIEW,
    element: (
      <ReviewerRoute>
        <VideoReview />
        </ReviewerRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
