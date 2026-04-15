import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AdminPanel } from './pages/AdminPanel';
import { BookingsPage } from './pages/BookingsPage';
import { CreateBookingPage } from './pages/CreateBookingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPanel } from './pages/NotificationsPanel';
import { ResourcesPage } from './pages/ResourcesPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { TicketsPage } from './pages/TicketsPage';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/new" element={<CreateBookingPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailsPage />} />
        <Route path="notifications" element={<NotificationsPanel />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
