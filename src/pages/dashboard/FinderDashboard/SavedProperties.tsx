
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { savedPropertiesApi } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SavedProperties = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: savedProperties, isLoading, error } = useQuery({
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
      description: "Failed to load saved properties. Please try again later.",
      variant: "destructive"
    });
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load saved properties.</p>
        <Button onClick={() => navigate(0)} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!savedProperties || savedProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven't saved any properties yet.</p>
        <Button onClick={() => navigate('/search')}>
          <Home className="mr-2 h-4 w-4" />
          Find Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Saved Properties</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {savedProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={property.images && property.images.length > 0 
                      ? property.images[0].url 
                      : '/placeholder.svg'}
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
                        <span>{property.rating ? property.rating.toFixed(1) : 'No ratings'}</span>
                      </div>
                      
                      <p className="mt-3 font-medium">{priceFormatter.format(property.price)}/month</p>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/booking/${property.id}`)}
                      >
                        Book Now
                      </Button>
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

export default SavedProperties;
