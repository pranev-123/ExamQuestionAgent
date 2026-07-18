import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const FacultyDashboard = lazy(() => import('./pages/FacultyDashboard'));

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="page-transition"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/student-dashboard" element={<PageTransition><ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute></PageTransition>} />
          <Route path="/faculty-dashboard" element={<PageTransition><ProtectedRoute requiredRole="faculty"><FacultyDashboard /></ProtectedRoute></PageTransition>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
