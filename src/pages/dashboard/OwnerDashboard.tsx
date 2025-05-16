
import React, { useEffect, useState } from 'react';
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
import { getMockOwnerProperties, properties, bookings } from '@/data/mockData';

const OwnerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [ownerProperties, setOwnerProperties] = useState<typeof properties>([]);
  
  useEffect(() => {
    if (currentUser) {
      const userProperties = getMockOwnerProperties(currentUser.id);
      setOwnerProperties(userProperties);
    }
  }, [currentUser]);

  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  // Calculate total revenue (simplified)
  const totalRevenue = bookings
    .filter(booking => {
      const property = properties.find(p => p.id === booking.propertyId);
      return property && property.ownerId === currentUser?.id;
    })
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

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
            <p className="text-3xl font-bold mt-2">{ownerProperties.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Bookings</span>
            </div>
            <p className="text-3xl font-bold mt-2">3</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Messages</span>
            </div>
            <p className="text-3xl font-bold mt-2">2</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Revenue</span>
            </div>
            <p className="text-3xl font-bold mt-2">{priceFormatter.format(totalRevenue)}</p>
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
          {ownerProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {ownerProperties.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 md:h-auto">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{property.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{property.location}</p>
                            <div className="mt-2 flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{property.rating.toFixed(1)} ({property.reviews.length} reviews)</span>
                            </div>
                            <p className="mt-3 font-medium">{priceFormatter.format(property.price)}/month</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-4 md:mt-0">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/property/${property.id}`)}>
                              View
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/owner/properties/${property.id}/edit`)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              property.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {property.available ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/owner/messages')}>
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Messages
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
              <Button onClick={() => navigate('/owner/list-property')}>
                <Plus className="h-4 w-4 mr-2" />
                List a Property
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {bookings.slice(0, 2).map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.propertyTitle}</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>Booked by: {booking.userName}</p>
                        <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                        <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="text-right">
                        <span className="font-medium">{priceFormatter.format(booking.totalPrice)}</span>
                        <span className={`block mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerDashboard;
