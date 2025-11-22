// src/routes/AppRouter.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { PATHS } from './paths';

// Lazy-load pages (optional but recommended)
import CreateAccount from '../pages/onboarding';
const SignIn = () => <div className="p-8">Sign In (placeholder)</div>;
import Dashboard from '../pages/dashboard';
const NotFound = () => <div className="p-8">404 - Not Found</div>;

const router = createBrowserRouter([
  { path: PATHS.ROOT, element: <CreateAccount /> },
  { path: PATHS.SIGN_IN, element: <SignIn /> },
  {
    path: PATHS.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
