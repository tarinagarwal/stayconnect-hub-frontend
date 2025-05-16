
import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyListProps {
  properties: Property[] | undefined;
  title?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

const PropertyList: React.FC<PropertyListProps> = ({ 
  properties, 
  title, 
  isLoading = false,
  emptyMessage = "No properties found."
}) => {
  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
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
      ) : properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
};

export default PropertyList;
