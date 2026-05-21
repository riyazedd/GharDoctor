import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Booking from './pages/Booking'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProviderProfile from './pages/ProviderProfile'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const location = useLocation();
  const currentView = location.pathname === '/' ? 'home' : location.pathname.slice(1);
  const hideNavbar = ['/login', '/register'].includes(location.pathname);

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
          <Route path="/bookings" element={<Home />} />
          <Route path="/admin" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      <Footer />
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
