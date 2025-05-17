
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '@/services/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Home,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminProperties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: properties, isLoading } = useQuery({
    queryKey: ['allProperties'],
    queryFn: propertiesApi.getAll
  });
  
  // Filter properties based on search term
  const filteredProperties = React.useMemo(() => {
    if (!properties) return [];
    if (!searchTerm.trim()) return properties;
    
    const term = searchTerm.toLowerCase();
    return properties.filter(property => 
      property.title.toLowerCase().includes(term) || 
      property.location.toLowerCase().includes(term) ||
      property.description.toLowerCase().includes(term) ||
      (property.owner?.name && property.owner.name.toLowerCase().includes(term))
    );
  }, [properties, searchTerm]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Property Management</h2>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search properties..."
            className="pl-9 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Home className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    {property.featured && (
                      <Badge className="absolute top-2 right-2">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="pt-3">
                    <h3 className="font-semibold text-lg truncate">{property.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{property.rating ? property.rating.toFixed(1) : 'No ratings'}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(property.price)}/month</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-gray-500">
                        Owner: {property.owner?.name || 'Unknown'}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/property/${property.id}`} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No properties match your search' : 'No properties found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProperties;
