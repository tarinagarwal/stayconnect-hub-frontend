
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EditProperty = () => {
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [featured, setFeatured] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Fetch property data
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          amenities:property_amenities(*),
          images:property_images(*)
        `)
        .eq('id', propertyId)
        .single();
      
      if (propertyError) throw propertyError;
      return propertyData;
    },
    enabled: !!propertyId
  });
  
  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (updatedProperty: any) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updatedProperty)
        .eq('id', propertyId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      toast({
        title: 'Success',
        description: 'Property updated successfully',
      });
    },
  });
  
  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
      navigate('/owner');
    },
  });
  
  // Add amenity mutation
  const addAmenityMutation = useMutation({
    mutationFn: async (amenity: string) => {
      const { data, error } = await supabase
        .from('property_amenities')
        .insert([
          { property_id: propertyId, amenity }
        ]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      setNewAmenity('');
      toast({
        title: 'Success',
        description: 'Amenity added',
      });
    },
  });
  
  // Delete amenity mutation
  const deleteAmenityMutation = useMutation({
    mutationFn: async (amenityId: string) => {
      const { error } = await supabase
        .from('property_amenities')
        .delete()
        .eq('id', amenityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast({
        title: 'Success',
        description: 'Amenity removed',
      });
    },
  });
  
  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast({
        title: 'Success',
        description: 'Image removed',
      });
    },
  });
  
  // Initialize form with property data
  useEffect(() => {
    if (property) {
      setTitle(property.title);
      setDescription(property.description);
      setLocation(property.location);
      setPrice(property.price);
      setFeatured(property.featured || false);
      setAmenities(property.amenities?.map(a => a.amenity) || []);
    }
  }, [property]);
  
  // Check if user is the owner
  useEffect(() => {
    if (property && currentUser && property.owner_id !== currentUser.id) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this property",
        variant: "destructive",
      });
      navigate('/owner');
    }
  }, [property, currentUser, navigate, toast]);
  
  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update a property",
        variant: "destructive",
      });
      return;
    }
    
    updatePropertyMutation.mutate({
      title,
      description,
      location,
      price,
      featured,
    });
  };
  
  const handleDeleteProperty = () => {
    if (window.confirm('Are you sure you want to delete this property? This cannot be undone.')) {
      deletePropertyMutation.mutate();
    }
  };
  
  const handleAddAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmenity.trim()) {
      addAmenityMutation.mutate(newAmenity.trim());
    }
  };
  
  const handleRemoveAmenity = (amenityId: string) => {
    deleteAmenityMutation.mutate(amenityId);
  };
  
  const handleRemoveImage = (imageId: string) => {
    deleteImageMutation.mutate(imageId);
  };
  
  const handleImageUpload = async () => {
    if (!imageFiles.length || !currentUser) return;
    
    setUploading(true);
    try {
      for (const file of imageFiles) {
        // Generate a unique file name to avoid collisions
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        
        // Upload to Supabase Storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('property_images')
          .upload(fileName, file);
        
        if (fileError) throw fileError;
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('property_images')
          .getPublicUrl(fileName);
        
        // Add to property_images table
        const { error: dbError } = await supabase
          .from('property_images')
          .insert([
            { 
              property_id: propertyId,
              url: urlData.publicUrl
            }
          ]);
        
        if (dbError) throw dbError;
      }
      
      setImageFiles([]);
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
        <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or you don't have permission to edit it.</p>
        <Button onClick={() => navigate('/owner')}>Go Back to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProperty} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Monthly Rent (INR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                      required
                      min={0}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={featured}
                      onCheckedChange={(checked) => setFeatured(!!checked)}
                    />
                    <Label htmlFor="featured">Mark as Featured Property</Label>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteProperty}
                    disabled={deletePropertyMutation.isPending}
                  >
                    {deletePropertyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Property
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={updatePropertyMutation.isPending}
                  >
                    {updatePropertyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Amenities and Images */}
        <div className="space-y-6">
          {/* Amenities */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>
              
              <div className="space-y-4">
                <form onSubmit={handleAddAmenity} className="flex space-x-2">
                  <Input
                    placeholder="Add new amenity"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={addAmenityMutation.isPending || !newAmenity}
                  >
                    {addAmenityMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </form>
                
                <div className="space-y-2">
                  {property.amenities?.map((amenity) => (
                    <div key={amenity.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{amenity.amenity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAmenity(amenity.id)}
                        disabled={deleteAmenityMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {property.amenities?.length === 0 && (
                    <p className="text-sm text-gray-500">No amenities added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Images */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Property Images</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {property.images?.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Property"
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveImage(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {property.images?.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-2">No images added yet</p>
                )}
              </div>
              
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                />
                <Button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploading || imageFiles.length === 0}
                  className="w-full"
                >
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
