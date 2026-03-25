import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// Admin pages (lazy)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DriverManagement = lazy(() => import('./pages/admin/DriverManagement'));
const AgentManagement = lazy(() => import('./pages/admin/AgentManagement'));
const DriverDetail = lazy(() => import('./pages/admin/DriverDetail'));
const AgentDetail = lazy(() => import('./pages/admin/AgentDetail'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const LevySettings = lazy(() => import('./pages/admin/LevySettings'));

// Driver pages (lazy)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoutesPage = lazy(() => import('./pages/Routes'));
const TripPage = lazy(() => import('./pages/Trip'));
const Earnings = lazy(() => import('./pages/Earnings'));
const Levies = lazy(() => import('./pages/Levies'));
const USSDSimulator = lazy(() => import('./pages/USSDSimulator'));

// Agent pages (lazy)
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const LevyHistory = lazy(() => import('./pages/agent/LevyHistory'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                {/* Admin */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/drivers" element={<DriverManagement />} />
                <Route path="/admin/drivers/:id" element={<DriverDetail />} />
                <Route path="/admin/agents" element={<AgentManagement />} />
                <Route path="/admin/agents/:id" element={<AgentDetail />} />
                <Route path="/admin/transactions" element={<Transactions />} />
                <Route path="/admin/levy-settings" element={<LevySettings />} />

                {/* Driver */}
                <Route path="/driver/dashboard" element={<Dashboard />} />
                <Route path="/driver/routes" element={<RoutesPage />} />
                <Route path="/driver/trip" element={<TripPage />} />
                <Route path="/driver/earnings" element={<Earnings />} />
                <Route path="/driver/levies" element={<Levies />} />
                <Route path="/driver/ussd" element={<USSDSimulator />} />

                {/* Agent */}
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/agent/history" element={<LevyHistory />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
