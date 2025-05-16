
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Layout = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  // Check if the user is on the home page
  const isHomePage = location.pathname === '/';

  // If the user is authenticated and on the home page, redirect them to their dashboard
  if (isAuthenticated && currentUser && isHomePage) {
    const redirectPath = currentUser.role === 'admin' ? '/admin' : 
                        currentUser.role === 'owner' ? '/owner' : 
                        '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
