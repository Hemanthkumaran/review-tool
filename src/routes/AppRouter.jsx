// src/routes/AppRouter.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { PATHS } from './paths';

// Lazy-load pages (optional but recommended)
import CreateAccount from '../pages/onboarding';
const SignIn = () => <div className="p-8">Sign In (placeholder)</div>;
import Dashboard from '../pages/dashboard';
import AddProject from '../pages/dashboard/AddProject';
import VideoReview from '../pages/video-review';
import SettingsLayout from '../components/src/Layout/Settings/SettingsLayout';
import ProjectAccordion from '../components/src/components/Accordion/Accordion';
const NotFound = () => <div className="p-8">404 - Not Found</div>;

const router = createBrowserRouter([
  { path: PATHS.ROOT, element: <CreateAccount /> },
  { path: PATHS.SIGN_IN, element: <SignIn /> },
  {
    path: PATHS.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
        <SettingsLayout/>
        <ProjectAccordion/>
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
      <ProtectedRoute>
        <VideoReview/>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
