
// src/pages/Index.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import PropertyList from "@/components/PropertyList";
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '@/services/api';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch featured properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: propertiesApi.getAll,
  });

  // Filter featured properties only
  const featuredProperties = properties?.filter(p => p.featured).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Apartment interior"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect PG Accommodation
            </h1>
            <p className="text-xl mb-8">
              Discover comfortable and affordable paying guest accommodations in top locations
            </p>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 justify-center">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search by location, area..."
                  className="pl-9 bg-white text-black h-12 rounded-md w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>

            {!isAuthenticated && (
              <div className="mt-8 space-x-4">
                <Button asChild variant="outline" className="bg-white text-primary hover:bg-gray-100">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Create an account</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <div className="container mx-auto px-4 py-12">
        <PropertyList 
          title="Featured Properties" 
          properties={featuredProperties} 
          isLoading={isLoading}
          emptyMessage="No featured properties available at the moment."
        />
      </div>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How StayConnect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Search</h3>
              <p className="text-gray-600">
                Easily search for PG accommodations based on location, budget, and amenities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Compare</h3>
              <p className="text-gray-600">
                Compare different PGs based on ratings, reviews, and available facilities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Book</h3>
              <p className="text-gray-600">
                Book your perfect PG accommodation instantly and move in without any hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For PG Owners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-white rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-10 md:p-16">
                <h2 className="text-3xl font-bold mb-6">Are you a PG Owner?</h2>
                <p className="text-lg mb-8">
                  List your property on StayConnect and reach thousands of potential tenants. 
                  Manage bookings, payments, and communication all in one place.
                </p>
                <Button asChild variant="secondary" size="lg">
                  <Link to={isAuthenticated ? "/owner/list-property" : "/signup"}>
                    {isAuthenticated ? "List Your Property" : "Register as Owner"}
                  </Link>
                </Button>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1073&q=80" 
                  alt="Property owner" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mb-4 text-gray-600">
                    "StayConnect made finding a PG so easy! I found a great place near my office within my budget. The booking process was smooth and hassle-free."
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <p className="font-semibold">John Doe</p>
                      <p className="text-sm text-gray-500">Delhi, India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-10 md:p-16 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect PG?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who found their ideal PG accommodation through StayConnect.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link to="/search">Start Searching</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
