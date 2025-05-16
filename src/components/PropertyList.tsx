
import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '@/data/mockData';

interface PropertyListProps {
  properties: Property[];
  title?: string;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, title }) => {
  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
};

export default PropertyList;
