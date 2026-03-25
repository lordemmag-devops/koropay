import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverManagement from './pages/admin/DriverManagement';
import AgentManagement from './pages/admin/AgentManagement';
import DriverDetail from './pages/admin/DriverDetail';
import AgentDetail from './pages/admin/AgentDetail';
import Transactions from './pages/admin/Transactions';
import LevySettings from './pages/admin/LevySettings';

// Driver pages
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import TripPage from './pages/Trip';
import Earnings from './pages/Earnings';
import Levies from './pages/Levies';
import USSDSimulator from './pages/USSDSimulator';

// Agent pages
import AgentDashboard from './pages/agent/AgentDashboard';
import LevyHistory from './pages/agent/LevyHistory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/drivers" element={<DriverManagement />} />
            <Route path="/admin/drivers/:id" element={<DriverDetail />} />
            <Route path="/admin/agents" element={<AgentManagement />} />
            <Route path="/admin/agents/:id" element={<AgentDetail />} />
            <Route path="/admin/transactions" element={<Transactions />} />
            <Route path="/admin/levy-settings" element={<LevySettings />} />
          </Route>

          {/* Driver routes */}
          <Route element={<Layout />}>
            <Route path="/driver/dashboard" element={<Dashboard />} />
            <Route path="/driver/routes" element={<RoutesPage />} />
            <Route path="/driver/trip" element={<TripPage />} />
            <Route path="/driver/earnings" element={<Earnings />} />
            <Route path="/driver/levies" element={<Levies />} />
            <Route path="/driver/ussd" element={<USSDSimulator />} />
          </Route>

          {/* Agent routes */}
          <Route element={<Layout />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/history" element={<LevyHistory />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
