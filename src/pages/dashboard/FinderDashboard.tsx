
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Home, Star, Calendar, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi, savedPropertiesApi, Property } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const FinderDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');

  // Fetch user bookings
  const { 
    data: bookings, 
    isLoading: isLoadingBookings, 
    error: bookingsError 
  } = useQuery({
    queryKey: ['bookings', currentUser?.id],
    queryFn: () => currentUser ? bookingsApi.getByUserId(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });
  
  // Fetch saved properties
  const { 
    data: savedProperties, 
    isLoading: isLoadingSaved, 
    error: savedError
  } = useQuery({
    queryKey: ['savedProperties', currentUser?.id],
    queryFn: () => currentUser ? savedPropertiesApi.getSavedByUserId(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });

  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

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
          Manage your bookings, saved properties, and messages all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Stats */}
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
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">Saved PGs</span>
            </div>
            {isLoadingSaved ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2">{savedProperties?.length || 0}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Unread Messages</span>
            </div>
            <p className="text-3xl font-bold mt-2">0</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="saved">Saved PGs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-4">
          {isLoadingBookings ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bookingsError ? (
            <div className="text-center py-6">
              <p className="text-red-500">Error loading bookings. Please try again.</p>
              <Button onClick={() => setActiveTab('bookings')} className="mt-2">Retry</Button>
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 p-5 md:border-r flex items-center justify-center bg-primary/5">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="md:w-3/4 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{booking.property?.title}</h3>
                            <div className="space-y-2 mt-2">
                              <div className="flex">
                                <span className="font-medium w-24">Check In:</span>
                                <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-24">Check Out:</span>
                                <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-24">Amount:</span>
                                <span>{priceFormatter.format(booking.total_price)}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => navigate(`/property/${booking.property_id}`)}>
                            View Property
                          </Button>
                        </div>
                        
                        {booking.status === 'completed' && (
                          <div className="mt-4 pt-4 border-t">
                            <Button size="sm" onClick={() => navigate(`/review/${booking.property_id}`)}>
                              <Star className="h-4 w-4 mr-2" />
                              Leave a Review
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
              <Button onClick={() => navigate('/search')}>Explore PGs</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="mt-4">
          {isLoadingSaved ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : savedError ? (
            <div className="text-center py-6">
              <p className="text-red-500">Error loading saved properties. Please try again.</p>
              <Button onClick={() => setActiveTab('saved')} className="mt-2">Retry</Button>
            </div>
          ) : savedProperties && savedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={property.images && property.images.length > 0 ? property.images[0].url : '/placeholder.svg'}
                          alt={property.title}
                          className="h-full w-full object-cover hover-scale"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{property.rating?.toFixed(1) || 'No ratings'}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-medium">{priceFormatter.format(property.price)}/month</span>
                          <Button size="sm" onClick={() => navigate(`/property/${property.id}`)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't saved any properties yet.</p>
              <Button onClick={() => navigate('/search')}>Find PGs</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinderDashboard;
