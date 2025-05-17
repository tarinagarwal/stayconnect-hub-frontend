
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout and UI components
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import SupabaseProvider from './components/SupabaseProvider';
import { Toaster } from './components/ui/toaster';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Review from './pages/Review';
import Booking from './pages/Booking';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

// Dashboard pages
import FinderDashboard from './pages/dashboard/FinderDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ListProperty from './pages/owner/ListProperty';
import EditProperty from './pages/owner/EditProperty';

const App = () => {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SupabaseProvider queryClient={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="search" element={<Search />} />
                <Route path="property/:id" element={<PropertyDetails />} />
                <Route path="review/:propertyId" element={<Review />} />
                <Route path="booking/:propertyId" element={<Booking />} />
                <Route path="messages" element={<Messages />} />

                {/* Finder (normal user) routes */}
                <Route path="dashboard" element={<DashboardLayout />}>
                  <Route index element={<FinderDashboard />} />
                  <Route path="saved" element={<h1>Saved Properties</h1>} />
                  <Route path="bookings" element={<h1>My Bookings</h1>} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="settings" element={<h1>Settings</h1>} />
                </Route>

                {/* Property Owner routes */}
                <Route path="owner" element={<DashboardLayout requiredRole="owner" />}>
                  <Route index element={<OwnerDashboard />} />
                  <Route path="properties" element={<h1>My Properties</h1>} />
                  <Route path="properties/:id/edit" element={<EditProperty />} />
                  <Route path="bookings" element={<h1>Property Bookings</h1>} />
                  <Route path="list-property" element={<ListProperty />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="settings" element={<h1>Settings</h1>} />
                </Route>

                {/* Admin routes */}
                <Route path="admin" element={<DashboardLayout requiredRole="admin" />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<h1>Manage Users</h1>} />
                  <Route path="properties" element={<h1>All Properties</h1>} />
                  <Route path="bookings" element={<h1>All Bookings</h1>} />
                  <Route path="messages" element={<h1>Message Center</h1>} />
                  <Route path="settings" element={<h1>System Settings</h1>} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </SupabaseProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
