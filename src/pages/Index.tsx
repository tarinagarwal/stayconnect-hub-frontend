
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PropertyList from '@/components/PropertyList';
import { properties, generateSearchUrl } from '@/data/mockData';

const HomeHero = () => {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchInput)}`);
  };

  return (
    <div className="relative bg-gray-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-32 md:py-40 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in">
          Find Your Perfect PG Accommodation
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in">
          Discover comfortable and affordable PG stays in top locations with verified owners
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-in">
          <div className="flex items-center bg-white rounded-full shadow-lg p-2">
            <Search className="h-5 w-5 text-gray-500 ml-3" />
            <Input
              type="text"
              placeholder="Search by location, PG name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-grow border-none focus:ring-0 text-black"
            />
            <Button type="submit" size="lg" className="rounded-full">
              Search PGs
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose StayConnect</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
            <p className="text-gray-600">
              Find your ideal PG accommodation with our intuitive search and filtering system.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
            <p className="text-gray-600">
              All our PG accommodations are verified to ensure quality and safety for our users.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
            <p className="text-gray-600">
              Connect directly with PG owners through our built-in messaging system for quick responses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  // Featured properties (filter properties with featured flag)
  const featuredProperties = properties.filter(property => property.featured);
  
  // Recent properties (just take a few for display)
  const recentProperties = [...properties].sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <HomeHero />
      
      <div className="container mx-auto px-4 py-12">
        <PropertyList properties={featuredProperties} title="Featured PG Accommodations" />
        <PropertyList properties={recentProperties} title="Recently Added" />
      </div>
      
      <FeaturesSection />
      
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Own a PG Property?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            List your property on StayConnect and connect with potential tenants. It's easy, fast, and free!
          </p>
          <Button size="lg" onClick={() => window.location.href = '/owner/list-property'}>
            List Your PG
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
