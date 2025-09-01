// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Gallery from './pages/Gallery.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Orders from './pages/Orders.jsx';
import CheckoutSuccess from './pages/CheckoutSuccess.jsx';
import CheckoutCancel from './pages/CheckoutCancel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Toaster } from 'react-hot-toast';
import Cart from './pages/Cart.jsx';
import MyOrders from './pages/MyOrders.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Account from './pages/Account.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';

// Small wrapper that reads the shared theme and applies app-wide colors
function ThemedShell({ children }) {
  const { isDark } = useTheme();
  return (
    <div className={isDark ? "min-h-screen bg-gray-950 text-gray-100" : "min-h-screen bg-gray-50 text-gray-900"}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedShell>
        <Navbar />
        <main className="px-4">
          <div className="mx-auto w-full max-w-7xl py-6">
            <Routes>
              <Route path="/" element={<Gallery />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/success" element={<CheckoutSuccess />} />
              <Route path="/cancel" element={<CheckoutCancel />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute role="admin">
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/orders/my"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin-login" element={<AdminLogin />} />
            </Routes>
          </div>
        </main>
        <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      </ThemedShell>
    </ThemeProvider>
  );
}


