// frontend/src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Gallery from "./pages/Gallery.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Orders from "./pages/Orders.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import CheckoutCancel from "./pages/CheckoutCancel.jsx";
import Cart from "./pages/Cart.jsx";                    // ✅
import MyOrders from "./pages/MyOrders.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import Account from "./pages/Account.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import NotFound from "./pages/NotFound.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

/* Theme wrapper */
function ThemedShell({ children }) {
  const { isDark } = useTheme();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg,#F8FAFC)] text-[var(--text,#1A1A1A)]">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedShell>
        <Navbar />

        <main className="px-4 flex-1">
          <div className="mx-auto w-full max-w-7xl py-6">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/success" element={<CheckoutSuccess />} />
              <Route path="/cancel" element={<CheckoutCancel />} />
              <Route path="/cart" element={<Cart />} />   {/* ✅ restored */}

              {/* Admin */}
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
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-product"
                element={
                  <ProtectedRoute role="admin">
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute role="admin">
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated user */}
              <Route
                path="/orders/my"
                element={
                  <ProtectedRoute>
                    <MyOrders />
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

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        <Footer />

        <Toaster
          position="top-center"
          gutter={10}
          containerClassName="!top-4"
          toastOptions={{
            duration: 2500,
            className:
              "rounded-xl border border-[var(--border,#E5E7EB)] bg-[var(--surface,#fff)]/95 " +
              "text-[var(--text,#111)] shadow-sm dark:bg:white/10 dark:text-[var(--text,#F3F4F6)] backdrop-blur-sm",
            success: { iconTheme: { primary: "var(--brand,#2E6F6C)", secondary: "#fff" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
            loading: { iconTheme: { primary: "var(--brand,#2E6F6C)", secondary: "#fff" } },
          }}
        />
      </ThemedShell>
    </ThemeProvider>
  );
}
