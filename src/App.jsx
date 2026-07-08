import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Layouts
const CFOLayout = lazy(() => import('./layouts/CFOLayout'));

// CFO Pages
const CFOLogin        = lazy(() => import('./features/finance/pages/CFOLogin'));
const CFODashboard    = lazy(() => import('./features/finance/pages/CFODashboard'));
const Quotations      = lazy(() => import('./features/finance/pages/Quotations'));
const Invoices        = lazy(() => import('./features/finance/pages/Invoices'));
const Payments        = lazy(() => import('./features/finance/pages/Payments'));
const Expenses        = lazy(() => import('./features/finance/pages/Expenses'));
const Payroll         = lazy(() => import('./features/finance/pages/Payroll'));
const Vendors         = lazy(() => import('./features/finance/pages/Vendors'));
const PurchaseOrders  = lazy(() => import('./features/finance/pages/PurchaseOrders'));
const Reports         = lazy(() => import('./features/finance/pages/Reports'));
const FinanceCalendar = lazy(() => import('./features/finance/pages/FinanceCalendar'));
const Documents       = lazy(() => import('./features/finance/pages/Documents'));
const FinanceSettings = lazy(() => import('./features/finance/pages/FinanceSettings'));

// Protected Route — CFO / ADMIN / CEO only
const CFORoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/cfo/login" replace />;
  if (!['CFO', 'ADMIN', 'CEO'].includes(user?.role)) return <Navigate to="/cfo/login" replace />;
  return children;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-950">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/cfo/login" replace />} />

        {/* CFO Login (public) */}
        <Route path="/cfo/login" element={<CFOLogin />} />

        {/* CFO Protected Routes */}
        <Route
          path="/cfo"
          element={
            <CFORoute>
              <CFOLayout />
            </CFORoute>
          }
        >
          <Route index element={<Navigate to="/cfo/dashboard" replace />} />
          <Route path="dashboard"       element={<CFODashboard />} />
          <Route path="quotations"      element={<Quotations />} />
          <Route path="invoices"        element={<Invoices />} />
          <Route path="payments"        element={<Payments />} />
          <Route path="expenses"        element={<Expenses />} />
          <Route path="payroll"         element={<Payroll />} />
          <Route path="vendors"         element={<Vendors />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="reports"         element={<Reports />} />
          <Route path="calendar"        element={<FinanceCalendar />} />
          <Route path="documents"       element={<Documents />} />
          <Route path="settings"        element={<FinanceSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/cfo/login" replace />} />
      </Routes>
    </Suspense>
  );
}
