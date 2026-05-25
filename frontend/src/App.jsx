import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Booking from './pages/Booking'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProviderRegisterPage from './pages/ProviderRegisterPage'
import ProviderProfile from './pages/ProviderProfile'
import Dashboard from './pages/Dashboard'
import MyBookings from './pages/MyBookings'
import ProviderDashboard from './pages/ProviderDashboard'
import AdminDashboard from './pages/AdminDashboard'

function AppContent() {
  const location = useLocation();
  const currentView = location.pathname === '/' ? 'home' : location.pathname.slice(1);
  const hideNavbar = ['/login', '/register', '/provider-register', '/admin-dashboard', '/provider-dashboard'].includes(location.pathname);
  const hideFooter = ['/login', '/register', '/provider-register', '/admin-dashboard', '/provider-dashboard'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar currentView={currentView} />}
      <main className="min-h-screen bg-slate-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/provider/:id" element={<ProviderProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/provider-register" element={<ProviderRegisterPage />} />
          <Route path="/admin" element={<Home />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
