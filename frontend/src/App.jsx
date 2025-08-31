// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Gallery from './pages/Gallery.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Orders from './pages/Orders.jsx';
import CheckoutSuccess from './pages/CheckoutSuccess.jsx';
import CheckoutCancel from './pages/CheckoutCancel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from 'react-hot-toast';
import Cart from './pages/Cart.jsx';


export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="px-4">
        <div className="mx-auto w-full max-w-7xl py-6">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/success" element={<CheckoutSuccess />} />
            <Route path="/cancel" element={<CheckoutCancel />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </main>

      {/* Global toaster (render once, outside routing/container) */}
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
    </div>
  );
}

