
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PropertyList from '@/components/PropertyList';
import { Property, properties } from '@/data/mockData';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // All available amenities from properties
  const allAmenities = Array.from(
    new Set(properties.flatMap(property => property.amenities))
  ).sort();

  useEffect(() => {
    // Initialize from URL params
    const queryParam = searchParams.get('query') || '';
    setSearchQuery(queryParam);
    
    // Simulate API call delay
    setLoading(true);
    const timer = setTimeout(() => {
      filterProperties();
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filterProperties = () => {
    let results = [...properties];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        property =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by price range
    results = results.filter(
      property => property.price >= priceRange[0] && property.price <= priceRange[1]
    );
    
    // Filter by amenities
    if (selectedAmenities.length > 0) {
      results = results.filter(property =>
        selectedAmenities.every(amenity => property.amenities.includes(amenity))
      );
    }
    
    // Sort results
    switch (sortBy) {
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default recommended sorting (no specific sort)
        break;
    }
    
    setFilteredProperties(results);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    filterProperties();
    
    // Update URL params
    setSearchParams({ query: searchQuery });
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyFilters = () => {
    filterProperties();
  };

  // Indian Rupee formatter
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            
            <div className="space-y-4">
              {/* Price Range Filter */}
              <div>
                <Label className="block mb-2">Price Range</Label>
                <div className="px-2">
                  <Slider
                    defaultValue={[priceRange[0], priceRange[1]]}
                    max={30000}
                    step={1000}
                    minStepsBetweenThumbs={1}
                    onValueChange={handlePriceChange}
                    className="my-6"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{priceFormatter.format(priceRange[0])}</span>
                    <span>{priceFormatter.format(priceRange[1])}</span>
                  </div>
                </div>
              </div>
              
              {/* Amenities Filter */}
              <div>
                <Label className="block mb-2">Amenities</Label>
                <div className="space-y-2 max-h-52 overflow-y-auto px-1">
                  {allAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <label
                        htmlFor={`amenity-${amenity}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Apply Filters Button */}
              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Search and Sort Bar */}
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <Input
                placeholder="Search by location, PG name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
            
            <div className="flex justify-between items-center">
              <p className="text-sm">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Sort by:</span>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setTimeout(filterProperties, 0);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* No Results */}
              {filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                  <p className="text-gray-500">Try adjusting your search filters</p>
                </div>
              ) : (
                /* Property Results */
                <PropertyList properties={filteredProperties} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
