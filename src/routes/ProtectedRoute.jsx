// src/routes/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.replace('/'); // or '/signin'
    return null;
  }
  return children;
}
