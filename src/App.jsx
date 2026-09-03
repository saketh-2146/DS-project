import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import WaitingList from './pages/WaitingList';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import DataStructures from './pages/DataStructures';
import Login from './pages/Login';
import Register from './pages/Register';
import { useApp } from './context/AppContext';
import { isFirebaseConfigured } from './utils/firebase';

function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppLoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  const { isLoading } = useApp();

  if (isLoading) return <AppLoadingScreen />;

  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/events"          element={<Events />} />
          <Route path="/events/:id"      element={<EventDetails />} />
          <Route path="/book/:id"        element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/my-bookings"     element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/waiting-list"    element={<ProtectedRoute><WaitingList /></ProtectedRoute>} />
          <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"           element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/data-structures" element={<DataStructures />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
    </>
  );
}

