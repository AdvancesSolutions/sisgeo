import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Employees } from '@/pages/Employees';
import { Locations } from '@/pages/Locations';
import { Areas } from '@/pages/Areas';
import { Tasks } from '@/pages/Tasks';
import { Validation } from '@/pages/Validation';
import { Materials } from '@/pages/Materials';
import { TimeClock } from '@/pages/TimeClock';
import { Audit } from '@/pages/Audit';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="locations" element={<Locations />} />
            <Route path="areas" element={<Areas />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="validation" element={<Validation />} />
            <Route path="materials" element={<Materials />} />
            <Route path="timeclock" element={<TimeClock />} />
            <Route path="audit" element={<Audit />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
