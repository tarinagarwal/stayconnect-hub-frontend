
import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { UserRole, useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  SidebarProvider, 
  Sidebar,
  SidebarContent, 
  SidebarHeader, 
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { 
  Home, 
  User, 
  MessageCircle, 
  Heart, 
  Calendar, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  requiredRole?: UserRole;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ requiredRole }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if wrong role
  if (requiredRole && currentUser.role !== requiredRole) {
    const redirectPath = currentUser.role === 'admin' 
      ? '/admin' 
      : currentUser.role === 'owner' 
        ? '/owner' 
        : '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Different menu items based on user role
  const getMenuItems = () => {
    switch(currentUser.role) {
      case 'admin':
        return [
          { icon: Home, label: 'Overview', path: '/admin' },
          { icon: User, label: 'Users', path: '/admin/users' },
          { icon: Home, label: 'Properties', path: '/admin/properties' },
          { icon: MessageCircle, label: 'Messages', path: '/admin/messages' },
          { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
          { icon: Settings, label: 'Settings', path: '/admin/settings' },
        ];
      case 'owner':
        return [
          { icon: Home, label: 'Overview', path: '/owner' },
          { icon: Home, label: 'My Properties', path: '/owner/properties' },
          { icon: Calendar, label: 'Bookings', path: '/owner/bookings' },
          { icon: MessageCircle, label: 'Messages', path: '/owner/messages' },
          { icon: Settings, label: 'Settings', path: '/owner/settings' },
        ];
      case 'finder':
      default:
        return [
          { icon: Home, label: 'Overview', path: '/dashboard' },
          { icon: Heart, label: 'Saved PGs', path: '/dashboard/saved' },
          { icon: Calendar, label: 'My Bookings', path: '/dashboard/bookings' },
          { icon: MessageCircle, label: 'Messages', path: '/dashboard/messages' },
          { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
        ];
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="flex justify-center py-6 border-b">
            <div className="flex items-center space-x-2 text-xl font-bold text-primary">
              <Home className="h-6 w-6" />
              <span>StayConnect</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getMenuItems().map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate(item.path)}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* User Profile Section */}
            <div className="mt-auto pt-4">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    {currentUser?.avatar && <AvatarImage src={currentUser.avatar} />}
                    <AvatarFallback>
                      {currentUser?.name ? getInitials(currentUser.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start mt-2"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <SidebarTrigger className="flex md:hidden" />
            <h1 className="text-2xl font-bold">
              {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'owner' ? 'Owner' : ''} Dashboard
            </h1>
            <div></div> {/* Placeholder for right content alignment */}
          </div>
          
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
