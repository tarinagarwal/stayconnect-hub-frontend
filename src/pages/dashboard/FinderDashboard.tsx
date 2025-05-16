
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Home, Star, Calendar, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMockBookings, bookings, Property, properties } from '@/data/mockData';

const FinderDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState<typeof bookings>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      // Get user bookings
      const bookings = getMockBookings(currentUser.id);
      setUserBookings(bookings);
      
      // For saved properties demo, just show 2 random properties
      setSavedProperties(properties.slice(0, 2));
    }
  }, [currentUser]);

  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

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
            <p className="text-3xl font-bold mt-2">{userBookings.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">Saved PGs</span>
            </div>
            <p className="text-3xl font-bold mt-2">{savedProperties.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Unread Messages</span>
            </div>
            <p className="text-3xl font-bold mt-2">2</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="saved">Saved PGs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-4">
          {userBookings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userBookings.map((booking) => (
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
                            <h3 className="text-lg font-semibold">{booking.propertyTitle}</h3>
                            <div className="space-y-2 mt-2">
                              <div className="flex">
                                <span className="font-medium w-24">Check In:</span>
                                <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-24">Check Out:</span>
                                <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium w-24">Amount:</span>
                                <span>{priceFormatter.format(booking.totalPrice)}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => navigate(`/property/${booking.propertyId}`)}>
                            View Property
                          </Button>
                        </div>
                        
                        {booking.status === 'completed' && (
                          <div className="mt-4 pt-4 border-t">
                            <Button size="sm" onClick={() => navigate(`/review/${booking.propertyId}`)}>
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
          {savedProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-full w-full object-cover hover-scale"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">{property.rating.toFixed(1)}</span>
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
