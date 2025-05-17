
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  Calendar,
  MessageCircle,
  Star,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { propertiesApi, bookingsApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import OwnerProperties from './OwnerDashboard/OwnerProperties';

const OwnerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Fetch owner properties
  const { 
    data: ownerProperties, 
    isLoading: isLoadingProperties,
    error: propertiesError
  } = useQuery({
    queryKey: ['ownerProperties', currentUser?.id],
    queryFn: () => currentUser ? propertiesApi.getByOwnerId(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });
  
  // Fetch bookings for owner properties
  const { 
    data: bookings, 
    isLoading: isLoadingBookings,
    error: bookingsError
  } = useQuery({
    queryKey: ['ownerBookings', currentUser?.id],
    queryFn: () => currentUser ? bookingsApi.getByPropertyOwnerId(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });

  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  // Calculate total revenue
  const totalRevenue = bookings 
    ? bookings.reduce((sum, booking) => sum + booking.total_price, 0) 
    : 0;

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You need to be logged in to view your dashboard.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Log in</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome, {currentUser?.name}</h2>
        <p className="text-gray-600">
          Manage your properties, bookings, and messages from your dashboard.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="font-medium">Properties</span>
            </div>
            {isLoadingProperties ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{ownerProperties?.length || 0}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Bookings</span>
            </div>
            {isLoadingBookings ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{bookings?.length || 0}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Messages</span>
            </div>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Revenue</span>
            </div>
            {isLoadingBookings ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{priceFormatter.format(totalRevenue)}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={() => navigate('/owner/list-property')}>
          <Plus className="h-4 w-4 mr-2" />
          List New Property
        </Button>
      </div>
      
      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="mt-4">
          <OwnerProperties 
            ownerProperties={ownerProperties} 
            isLoading={isLoadingProperties}
            propertiesError={propertiesError}
            navigate={navigate}
          />
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-4">
          <OwnerBookings 
            bookings={bookings} 
            isLoading={isLoadingBookings}
            bookingsError={bookingsError}
            navigate={navigate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// OwnerBookings component
const OwnerBookings = ({ 
  bookings, 
  isLoading, 
  bookingsError, 
  navigate 
}: { 
  bookings: any[], 
  isLoading: boolean, 
  bookingsError: any, 
  navigate: Function 
}) => {
  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (bookingsError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Error loading bookings. Please try again.</p>
      </div>
    );
  } 
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You have no bookings yet.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">{booking.property?.title}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Booked by: {booking.user?.name}</p>
                  <p>Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <span className="font-medium">{priceFormatter.format(booking.total_price)}</span>
                  <span className={`block mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/owner/bookings')}
                    >
                      Manage Bookings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OwnerDashboard;
