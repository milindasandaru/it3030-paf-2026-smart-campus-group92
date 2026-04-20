import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminPanel } from './pages/AdminPanel';
import { BookingsPage } from './pages/BookingsPage';
import { CreateBookingPage } from './pages/CreateBookingPage';
import { LandingPage } from './pages/LandingPage';
import { LecturerDashboardPage } from './pages/LecturerDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPanel } from './pages/NotificationsPanel';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { AdminResourcesPage } from './pages/AdminResourcesPage';
import { AdminResourceFormPage } from './pages/AdminResourceFormPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { TicketsPage } from './pages/TicketsPage';
import { roleToDashboardPath } from './services/roleRoutingService';

function RoleDashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleToDashboardPath(user.role)} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<RoleDashboardRedirect />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="resources/:id" element={<ResourceDetailPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/new" element={<CreateBookingPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailsPage />} />
          <Route path="notifications" element={<NotificationsPanel />} />

          <Route element={<ProtectedRoute allowedRoles={['LECTURER']} />}>
            <Route path="lecturer/dashboard" element={<LecturerDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="student/dashboard" element={<StudentDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="admin/resources" element={<AdminResourcesPage />} />
            <Route path="admin/resources/new" element={<AdminResourceFormPage />} />
            <Route path="admin/resources/:id/edit" element={<AdminResourceFormPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
