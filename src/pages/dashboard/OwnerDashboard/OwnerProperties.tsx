
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Home } from 'lucide-react';

const OwnerProperties = ({ 
  ownerProperties, 
  isLoading, 
  propertiesError, 
  navigate 
}: { 
  ownerProperties: any[], 
  isLoading: boolean, 
  propertiesError: any, 
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
  
  if (propertiesError) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">Error loading properties. Please try again.</p>
      </div>
    );
  }
  
  if (ownerProperties && ownerProperties.length > 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {ownerProperties.map((property) => (
          <Card key={property.id}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                  <img
                    src={property.images && property.images.length > 0 ? property.images[0].url : '/placeholder.svg'}
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
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Available
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
    );
  } else {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
        <Button onClick={() => navigate('/owner/list-property')}>
          <Plus className="h-4 w-4 mr-2" />
          List a Property
        </Button>
      </div>
    );
  }
};

// Import missing components
import { MessageCircle, Plus } from 'lucide-react';

export default OwnerProperties;
