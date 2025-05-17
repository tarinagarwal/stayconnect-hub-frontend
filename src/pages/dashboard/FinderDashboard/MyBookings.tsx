
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const MyBookings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['userBookings', currentUser?.id],
    queryFn: () => currentUser ? bookingsApi.getByUserId(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });

  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <Skeleton className="md:w-1/3 h-48" />
                <div className="md:w-2/3 p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load bookings. Please try again later.",
      variant: "destructive"
    });
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load bookings.</p>
        <Button onClick={() => navigate(0)} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
        <Button onClick={() => navigate('/search')}>
          Find a Property
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={booking.property?.images && booking.property.images.length > 0 
                      ? booking.property.images[0].url 
                      : '/placeholder.svg'}
                    alt={booking.property?.title || 'Property'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.property?.title || 'Property'}</h3>
                      <p className="text-sm text-gray-600 mt-1">{booking.property?.location || 'Location not available'}</p>
                      
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="mt-3 font-medium">{priceFormatter.format(booking.total_price)}</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      
                      <div className="mt-4 flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/property/${booking.property_id}`)}
                        >
                          <Home className="h-4 w-4 mr-1" />
                          View Property
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
