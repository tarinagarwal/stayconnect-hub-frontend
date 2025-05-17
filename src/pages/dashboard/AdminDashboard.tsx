
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { usersApi, propertiesApi, bookingsApi } from '@/services/api';
import { MapPin, Home, User, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: usersApi.getAllUsers
  });

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['allProperties'],
    queryFn: propertiesApi.getAll
  });

  // User roles data for chart
  const userRolesData = React.useMemo(() => {
    if (!users) return [];
    
    const roleCount: Record<string, number> = {};
    users.forEach(user => {
      const role = user.role;
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    return Object.entries(roleCount).map(([name, value]) => ({ name, value }));
  }, [users]);

  // Most recent properties
  const recentProperties = React.useMemo(() => {
    if (!properties) return [];
    
    return [...properties]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [properties]);

  // Count users by role
  const userCounts = React.useMemo(() => {
    if (!users) return { total: 0, finder: 0, owner: 0, admin: 0 };
    
    const counts = {
      total: users.length,
      finder: users.filter(user => user.role === 'finder').length,
      owner: users.filter(user => user.role === 'owner').length,
      admin: users.filter(user => user.role === 'admin').length
    };
    
    return counts;
  }, [users]);

  if (usersLoading || propertiesLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{userCounts.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <h3 className="text-2xl font-bold">{properties?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Property Owners</p>
                <h3 className="text-2xl font-bold">{userCounts.owner}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Finder Users</p>
                <h3 className="text-2xl font-bold">{userCounts.finder}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userRolesData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Properties</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/properties">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center space-x-3 border-b pb-3 last:border-0">
                  <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{property.title}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" /> 
                      {property.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      }).format(property.price)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(property.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {recentProperties.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No properties found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/admin/users">
              <User className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/properties">
              <Home className="mr-2 h-4 w-4" />
              View Properties
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/admin/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              View Bookings
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/admin/messages">
              <MessageCircle className="mr-2 h-4 w-4" />
              View Messages
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
