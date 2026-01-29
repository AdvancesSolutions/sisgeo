import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminOnly } from '@/components/AdminOnly';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Employees } from '@/pages/Employees';
import { Locations } from '@/pages/Locations';
import { Areas } from '@/pages/Areas';
import { Tasks } from '@/pages/Tasks';
import { TaskDetail } from '@/pages/TaskDetail';
import { Validation } from '@/pages/Validation';
import { Materials } from '@/pages/Materials';
import { TimeClock } from '@/pages/TimeClock';
import { Reports } from '@/pages/Reports';
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
            <Route path="employees" element={<AdminOnly><Employees /></AdminOnly>} />
            <Route path="locations" element={<AdminOnly><Locations /></AdminOnly>} />
            <Route path="areas" element={<AdminOnly><Areas /></AdminOnly>} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            <Route path="validation" element={<AdminOnly><Validation /></AdminOnly>} />
            <Route path="materials" element={<AdminOnly><Materials /></AdminOnly>} />
            <Route path="timeclock" element={<TimeClock />} />
            <Route path="reports" element={<AdminOnly><Reports /></AdminOnly>} />
            <Route path="audit" element={<AdminOnly><Audit /></AdminOnly>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
