
import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { id, title, location, price, images, rating } = property;

  // Formatter for Indian Rupee
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  // Get the first image or a placeholder
  const imageUrl = images && images.length > 0 
    ? images[0].url 
    : '/placeholder.svg';

  return (
    <Link to={`/property/${id}`} className="block">
      <Card className="property-card overflow-hidden h-full">
        <div className="property-image relative">
          <img
            src={imageUrl}
            alt={title}
            className="h-48 w-full object-cover hover-scale"
          />
          {property.featured && (
            <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg truncate">{title}</h3>
          </div>
          <div className="text-sm text-gray-500 mt-1">{location}</div>
          <div className="flex items-center mt-2 text-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{rating ? rating.toFixed(1) : 'No ratings'}</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-semibold">{priceFormatter.format(price)}</span>
            <span className="text-gray-500"> /month</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
