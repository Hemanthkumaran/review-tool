import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import ReviewerRoute from "./ReviewerRoute";
import { PATHS } from "./paths";

import CreateAccount from "../pages/onboarding";
import VideoReview from "../pages/video-review";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import WelcomeWorkspace from "../pages/dashboard/WelcomeWorkspace";
import AddProject from "../pages/dashboard/AddProject";

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
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <WelcomeWorkspace />,
      },
      {
        path: PATHS.ADD_PROJECT,
        element: <AddProject />,
      },
    ],
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