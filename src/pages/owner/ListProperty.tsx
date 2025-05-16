
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { propertiesApi } from '@/services/api';

const ListProperty = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Amenities state
  const amenitiesList = [
    'Wi-Fi', 'Air conditioning', 'TV', 'Kitchen', 'Washing Machine',
    'Refrigerator', 'Microwave', 'Gym', 'Swimming Pool', 'Security',
    'Parking', 'Laundry', 'Power Backup', 'Meals Included', 'Game Room'
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    
    setImages(prev => [...prev, imageUrl]);
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs for the images
      const fileUrls = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...fileUrls]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim() || !description.trim() || !location.trim() || !price.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (images.length === 0) {
      toast({
        title: "Images Required",
        description: "Please add at least one image of your property.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedAmenities.length === 0) {
      toast({
        title: "Amenities Required",
        description: "Please select at least one amenity.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to list a property.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create property
      const property = await propertiesApi.create({
        owner_id: currentUser.id,
        title,
        description,
        location,
        price: parseInt(price),
        featured: false
      });
      
      // Upload images
      const imagePromises = uploadedFiles.map(file => 
        propertiesApi.uploadImage(file, currentUser.id)
      );
      
      // For externally added image URLs
      const externalImageUrls = images.filter(img => !img.startsWith('blob:'));
      
      // Wait for all image uploads to complete
      const uploadedImageUrls = await Promise.all(imagePromises);
      const allImageUrls = [...uploadedImageUrls, ...externalImageUrls];
      
      // Add images to property
      const imagePromises2 = allImageUrls.map((url, index) => 
        propertiesApi.addImage(property.id, url, index)
      );
      
      // Add amenities to property
      const amenityPromises = selectedAmenities.map(amenity => 
        propertiesApi.addAmenity(property.id, amenity)
      );
      
      // Wait for all operations to complete
      await Promise.all([...imagePromises2, ...amenityPromises]);
      
      toast({
        title: "Property Listed",
        description: "Your property has been listed successfully!"
      });
      
      // Redirect to owner dashboard
      navigate('/owner');
    } catch (error) {
      console.error('Error listing property:', error);
      toast({
        title: "Error",
        description: "There was an error listing your property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>List Your PG Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="title">Property Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Spacious 2BHK with Balcony"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Property Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your property in detail..."
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Koramangala, Bangalore"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Monthly Rent (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g., 15000"
                        min="1000"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Property Images</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label htmlFor="images">Upload Images</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="pt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload multiple images of your property.
                      </p>
                    </div>
                    
                    <p className="text-sm font-medium">OR</p>
                    
                    <div className="flex gap-2">
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                        className="flex-grow"
                      />
                      <Button type="button" onClick={handleAddImage}>
                        Add Image
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Add at least one image of your property. You can add up to 5 images.
                  </p>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Property ${index + 1}`}
                            className="aspect-[4/3] w-full rounded-md object-cover"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => handleRemoveImage(index)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Listing Property...' : 'List Property'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListProperty;
