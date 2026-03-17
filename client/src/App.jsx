import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import HomeRedirect from './routes/HomeRedirect';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Alarms from './pages/Alarms';
import Commissioning from './pages/Commissioning';
import Configuration from './pages/Configuration';
import Reports from './pages/Reports';
import NetworkMap from './pages/NetworkMap';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomeRedirect />} />
                <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Dashboard /></ProtectedRoute>} />
                <Route path="sites" element={<ProtectedRoute allowedRoles={['Admin', 'Field Engineer', 'Manager']}><Sites /></ProtectedRoute>} />
                <Route path="commissioning" element={<ProtectedRoute allowedRoles={['Admin', 'Field Engineer']}><Commissioning /></ProtectedRoute>} />
                <Route path="configuration" element={<ProtectedRoute allowedRoles={['Admin', 'Field Engineer', 'Manager']}><Configuration /></ProtectedRoute>} />
                <Route path="alarms" element={<ProtectedRoute allowedRoles={['Admin', 'NOC Engineer']}><Alarms /></ProtectedRoute>} />
                <Route path="reports" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Reports /></ProtectedRoute>} />
                <Route path="network-map" element={<ProtectedRoute allowedRoles={['Admin', 'Field Engineer', 'NOC Engineer', 'Manager']}><NetworkMap /></ProtectedRoute>} />
              </Route>
            </Routes>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
