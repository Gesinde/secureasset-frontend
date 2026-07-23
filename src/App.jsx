import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AddAsset from './pages/AddAsset';
import AssetDetail from './pages/AssetDetail';
import Verify from './pages/Verify';
import PublicAsset from './pages/PublicAsset';
import Maintenance from './pages/Maintenance';
import Security from './pages/Security';
import AuditLog from './pages/AuditLog';
import Scan from './pages/Scan';
import ProtectedRoute from './components/ProtectedRoute';
import Transfers from './pages/Transfers';
import EditAsset from './pages/EditAsset';
import UserManagement from './pages/UserManagement';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:id" element={<Verify />} />
        <Route path="/public/asset/:id" element={<PublicAsset />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Assets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/new"
          element={
            <ProtectedRoute>
              <AddAsset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/:id"
          element={
            <ProtectedRoute>
              <AssetDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/:id/edit"
          element={
            <ProtectedRoute>
              <EditAsset />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <Security />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <AuditLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <Scan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers"
          element={
            <ProtectedRoute>
              <Transfers />
           </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
