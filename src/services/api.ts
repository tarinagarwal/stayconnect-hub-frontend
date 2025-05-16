// Just updating the Property interface in api.ts to fix the type error
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/context/AuthContext';

// Types for our API
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
  };
  images?: PropertyImage[];
  amenities?: PropertyAmenity[];
  rating?: number;
  reviews?: Review[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  position: number;
}

export interface PropertyAmenity {
  id: string;
  property_id: string;
  amenity: string;
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  property?: Property;
  user?: User;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  user?: User;
}

export interface Conversation {
  id: string;
  created_at: string;
  participants: User[];
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
}

// Properties API
export const propertiesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(*),
        images:property_images(*),
        amenities:property_amenities(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    // Calculate ratings for each property
    const propertiesWithRating = await Promise.all(
      (data || []).map(async (property) => {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('property_id', property.id);
        
        const rating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        return { ...property, rating };
      })
    );
    
    return propertiesWithRating;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles(*),
        images:property_images(*),
        amenities:property_amenities(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    // Get reviews for the property
    const { data: reviews } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('property_id', id)
      .order('created_at', { ascending: false });

    // Calculate average rating
    const rating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return { ...data, reviews, rating };
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        images:property_images(*),
        amenities:property_amenities(*)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    const propertiesWithRating = await Promise.all(
      (data || []).map(async (property) => {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('property_id', property.id);
        
        const rating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        return { ...property, rating };
      })
    );
    
    return propertiesWithRating;
  },

  async create(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'owner' | 'images' | 'amenities' | 'rating'>) {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, propertyData: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  },

  async addImage(propertyId: string, imageUrl: string, position: number = 0) {
    const { data, error } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        url: imageUrl,
        position
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteImage(imageId: string) {
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId);

    if (error) throw new Error(error.message);
    return true;
  },

  async addAmenity(propertyId: string, amenity: string) {
    const { data, error } = await supabase
      .from('property_amenities')
      .insert({
        property_id: propertyId,
        amenity
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteAmenity(amenityId: string) {
    const { error } = await supabase
      .from('property_amenities')
      .delete()
      .eq('id', amenityId);

    if (error) throw new Error(error.message);
    return true;
  },

  async uploadImage(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('property_images')
      .upload(filePath, file);

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from('property_images')
      .getPublicUrl(filePath);

    return publicUrl;
  }
};

// Bookings API
export const bookingsApi = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getByPropertyId(propertyId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getByPropertyOwnerId(ownerId: string) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('owner_id', ownerId);

    if (!properties || properties.length === 0) return [];

    const propertyIds = properties.map(p => p.id);
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties(*),
        user:profiles(*)
      `)
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async create(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'property' | 'user'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateStatus(id: string, status: Booking['status']) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
};

// Reviews API
export const reviewsApi = {
  async getByPropertyId(propertyId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        property:properties(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async create(reviewData: Omit<Review, 'id' | 'created_at' | 'user'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, reviewData: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
};

// Messages API
export const messagesApi = {
  async getConversations(userId: string) {
    // Get all conversations the user is part of
    const { data: participations, error } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    if (!participations || participations.length === 0) return [];

    const conversationIds = participations.map(p => p.conversation_id);
    
    // Get conversations with participants
    const { data: conversations } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user:profiles(*)
        )
      `)
      .in('id', conversationIds)
      .order('created_at', { ascending: false });

    if (!conversations) return [];
    
    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        const { data: messages } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles(*)
          `)
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        return {
          ...conversation,
          participants: conversation.participants.map((p: any) => p.user),
          last_message: messages && messages.length > 0 ? messages[0] : null
        };
      })
    );
    
    return conversationsWithLastMessage;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createConversation(participants: string[]) {
    // Create a new conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) throw new Error(conversationError.message);
    
    // Add participants
    const participantPromises = participants.map(userId => 
      supabase.from('conversation_participants').insert({
        conversation_id: conversation.id,
        user_id: userId
      })
    );
    
    await Promise.all(participantPromises);
    
    return conversation;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async markAsRead(messageId: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

// User API
export const usersApi = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  },

  async updateProfile(userId: string, profileData: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as User;
  },
  
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as User[];
  },

  async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with new avatar
    await this.updateProfile(userId, { avatar: publicUrl });

    return publicUrl;
  }
};

// Saved properties API (favorites)
export const savedPropertiesApi = {
  async getSavedByUserId(userId: string) {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        *,
        property:properties(
          *,
          owner:profiles(*),
          images:property_images(*),
          amenities:property_amenities(*)
        )
      `)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    
    const savedPropertiesWithRating = await Promise.all(
      (data || []).map(async (saved) => {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('property_id', saved.property.id);
        
        const rating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;
        
        return { 
          ...saved, 
          property: { 
            ...saved.property, 
            rating 
          } 
        };
      })
    );
    
    return savedPropertiesWithRating.map(saved => saved.property);
  },

  async isSaved(propertyId: string, userId: string) {
    const { data, error } = await supabase
      .from('saved_properties')
      .select('*')
      .eq('property_id', propertyId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return data && data.length > 0;
  },

  async toggleSave(propertyId: string, userId: string) {
    const isSaved = await this.isSaved(propertyId, userId);
    
    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('property_id', propertyId)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return false;
    } else {
      // Save
      const { error } = await supabase
        .from('saved_properties')
        .insert({
          property_id: propertyId,
          user_id: userId
        });

      if (error) throw new Error(error.message);
      return true;
    }
  }
};
