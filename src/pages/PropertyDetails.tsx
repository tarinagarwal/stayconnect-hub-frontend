
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Star, MapPin, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Property, propertiesApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, currentUser } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();

  // Fetch property data from Supabase
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => id ? propertiesApi.getById(id) : null,
    enabled: !!id
  });

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading property details...</p>
      </div>
    );
  }

  // Show error state if property not found
  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Property not found</h2>
        <p className="mb-6">Sorry, we couldn't find the property you're looking for.</p>
        <Button onClick={() => navigate('/search')}>Explore Other Properties</Button>
      </div>
    );
  }

  // Indian Rupee formatter
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to login first to book this property.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Dates Required",
        description: "Please select move-in and move-out dates.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/booking/${id}`, { 
      state: { 
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString()
      } 
    });
  };
  
  const handleContactOwner = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to login first to contact the owner.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Navigate to messages with this property owner
    navigate(`/messages?owner=${property.owner_id}`);
  };

  // Get the main image URL safely
  const mainImageUrl = property.images && property.images.length > 0 ? 
    property.images[selectedImage]?.url : 
    '/placeholder.svg';

  // Ensure we have a valid reviews array
  const reviews = property.reviews || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Property Title and Basic Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{property.rating ? property.rating.toFixed(1) : "No ratings"} ({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Property Images Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={mainImageUrl}
              alt={`${property.title} - View ${selectedImage + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {property.images && property.images.map((image, index) => (
            <div key={index} 
                className={cn(
                  "cursor-pointer overflow-hidden rounded-lg border-2",
                  selectedImage === index ? "border-primary" : "border-transparent"
                )}
                onClick={() => setSelectedImage(index)}>
              <img
                src={image.url}
                alt={`${property.title} - Thumbnail ${index + 1}`}
                className="h-full w-full object-cover aspect-[3/2]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Property Details and Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{property.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Location</h3>
                <p className="text-gray-700 mb-3">{property.location}</p>
                <div className="rounded-lg overflow-hidden h-64 bg-gray-200">
                  {/* Mock Map Placeholder */}
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400 mr-2" />
                    <span className="text-gray-600">Map view would appear here</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="amenities">
              <h3 className="text-xl font-semibold mb-4">Available Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities && property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity.amenity}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <h3 className="text-xl font-semibold mb-4">Reviews</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          {review.user?.avatar ? (
                            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {review.user?.name?.[0] || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{review.user?.name || 'Anonymous User'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4", 
                              i < review.rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet for this property.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Booking Card */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{priceFormatter.format(property.price)}<span className="text-gray-500 text-sm"> / month</span></h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Move-in Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? (
                          format(checkInDate, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Move-out Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? (
                          format(checkOutDate, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        initialFocus
                        disabled={(date) => 
                          !checkInDate || date < checkInDate
                        }
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={handleBookNow}>
                  Book Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContactOwner}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Owner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
