import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import TechnicianMobile from "./pages/TechnicianMobile";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Validation from "./pages/Validation";
import Employees from "./pages/Employees";
import TimeClock from "./pages/TimeClock";
import Materials from "./pages/Materials";
import Locations from "./pages/Locations";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import SettingsPage from "./pages/Settings";
import Architecture from "./pages/Architecture";
import KnowledgeBase from "./pages/KnowledgeBase";
import IncidentReport from "./pages/IncidentReport";
import CustomerPortal from "./pages/CustomerPortal";
import TeamManagement from "./pages/TeamManagement";
import NotificationSettings from "./pages/NotificationSettings";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/mobile" element={<TechnicianMobile />} />
            <Route path="/" element={<Index />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/incident" element={<IncidentReport />} />

            {/* Tasks — managers & admins manage, technicians view own */}
            <Route path="/tasks" element={<ProtectedRoute permissions={["manage_tasks", "view_own_tasks"]}><Tasks /></ProtectedRoute>} />

            {/* Validation — managers & admins only */}
            <Route path="/validation" element={<ProtectedRoute permission="validate_tasks"><Validation /></ProtectedRoute>} />

            {/* Employees — managers & admins */}
            <Route path="/employees" element={<ProtectedRoute permission="manage_employees"><Employees /></ProtectedRoute>} />

            {/* Time Clock — managers manage, technicians check in */}
            <Route path="/timeclock" element={<ProtectedRoute permissions={["manage_timeclock", "checkin_checkout"]}><TimeClock /></ProtectedRoute>} />

            {/* Locations — managers & admins */}
            <Route path="/locations" element={<ProtectedRoute permissions={["manage_tasks", "view_all_units"]}><Locations /></ProtectedRoute>} />

            {/* Materials — managers manage, technicians request */}
            <Route path="/materials" element={<ProtectedRoute permissions={["manage_materials", "request_materials"]}><Materials /></ProtectedRoute>} />

            {/* Reports — managers & admins */}
            <Route path="/reports" element={<ProtectedRoute permissions={["view_reports", "view_all_units"]}><Reports /></ProtectedRoute>} />

            {/* Admin — super admin only (Torre de Controle) */}
            <Route path="/admin" element={<ProtectedRoute permission="manage_settings"><AdminSettings /></ProtectedRoute>} />

            {/* Audit — super admin only */}
            <Route path="/audit" element={<ProtectedRoute permission="view_audit"><Audit /></ProtectedRoute>} />

            {/* Settings — admins & managers */}
            <Route path="/settings" element={<ProtectedRoute permissions={["manage_settings", "manage_employees"]}><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/team" element={<ProtectedRoute permission="manage_employees"><TeamManagement /></ProtectedRoute>} />
            <Route path="/settings/notifications" element={<ProtectedRoute permissions={["manage_settings", "manage_employees"]}><NotificationSettings /></ProtectedRoute>} />

            {/* Architecture — super admin only */}
            <Route path="/architecture" element={<ProtectedRoute permission="manage_settings"><Architecture /></ProtectedRoute>} />

            {/* Customer Portal — managers & admins */}
            <Route path="/portal" element={<ProtectedRoute permissions={["manage_tasks", "view_all_units"]}><CustomerPortal /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
