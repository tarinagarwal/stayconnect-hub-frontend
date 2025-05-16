
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Layouts
import Layout from "@/components/Layout";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Search from "@/pages/Search";
import PropertyDetails from "@/pages/PropertyDetails";
import Booking from "@/pages/Booking";
import Messages from "@/pages/Messages";
import Review from "@/pages/Review";

// Dashboard pages
import FinderDashboard from "@/pages/dashboard/FinderDashboard";
import OwnerDashboard from "@/pages/dashboard/OwnerDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";

// Owner pages
import ListProperty from "@/pages/owner/ListProperty";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main Layout Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/property/:id/book" element={<Booking />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/favorites" element={<Messages />} />
              <Route path="/review/:id" element={<Review />} />
            </Route>
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Finder Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout requiredRole="finder" />}>
              <Route index element={<FinderDashboard />} />
              <Route path="saved" element={<div>Saved Properties</div>} />
              <Route path="bookings" element={<div>Bookings</div>} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<div>Settings</div>} />
            </Route>
            
            {/* Owner Dashboard Routes */}
            <Route path="/owner" element={<DashboardLayout requiredRole="owner" />}>
              <Route index element={<OwnerDashboard />} />
              <Route path="properties" element={<div>My Properties</div>} />
              <Route path="bookings" element={<div>Property Bookings</div>} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<div>Account Settings</div>} />
            </Route>
            
            {/* Property Listing Route */}
            <Route path="/owner/list-property" element={<ListProperty />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<DashboardLayout requiredRole="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<div>Manage Users</div>} />
              <Route path="properties" element={<div>Manage Properties</div>} />
              <Route path="messages" element={<Messages />} />
              <Route path="bookings" element={<div>All Bookings</div>} />
              <Route path="settings" element={<div>Admin Settings</div>} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
