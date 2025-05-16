
// Mock data for properties, reviews, bookings, etc.

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  amenities: string[];
  rating: number;
  reviews: Review[];
  ownerId: string;
  available: boolean;
  featured?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  propertyId: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Mock Properties
export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Modern Studio in Central Area',
    description: 'A cozy studio apartment with modern amenities in the heart of the city. Close to restaurants, shopping centers, and public transport.',
    price: 12000,
    location: 'Koramangala, Bangalore',
    coordinates: { lat: 12.9279, lng: 77.6271 },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=2070',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070'
    ],
    amenities: ['Wi-Fi', 'Air conditioning', 'TV', 'Kitchen', 'Washing Machine'],
    rating: 4.7,
    reviews: [
      {
        id: 'r1',
        userId: '1',
        userName: 'John Finder',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        propertyId: 'p1',
        rating: 5,
        comment: 'Amazing place! Clean and convenient location.',
        createdAt: '2023-04-15T10:30:00Z'
      }
    ],
    ownerId: '2',
    available: true,
    featured: true
  },
  {
    id: 'p2',
    title: 'Spacious 2BHK with Balcony',
    description: 'A beautiful 2BHK apartment with a balcony offering stunning city views. Fully furnished with modern amenities.',
    price: 18000,
    location: 'HSR Layout, Bangalore',
    coordinates: { lat: 12.9116, lng: 77.6741 },
    images: [
      'https://images.unsplash.com/photo-1594484208280-efa00f96fc21?q=80&w=1976',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1964',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070'
    ],
    amenities: ['Wi-Fi', 'Air conditioning', 'TV', 'Kitchen', 'Washing Machine', 'Gym Access', 'Parking'],
    rating: 4.5,
    reviews: [],
    ownerId: '2',
    available: true
  },
  {
    id: 'p3',
    title: 'Budget-Friendly Single Room',
    description: 'Affordable single room in a shared apartment with all basic amenities. Ideal for students and young professionals.',
    price: 8000,
    location: 'BTM Layout, Bangalore',
    coordinates: { lat: 12.9166, lng: 77.6101 },
    images: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070',
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=1958',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080'
    ],
    amenities: ['Wi-Fi', 'TV', 'Shared Kitchen', 'Laundry'],
    rating: 4.0,
    reviews: [
      {
        id: 'r2',
        userId: '1',
        userName: 'John Finder',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        propertyId: 'p3',
        rating: 4,
        comment: 'Good value for money. Clean and comfortable.',
        createdAt: '2023-05-20T14:20:00Z'
      }
    ],
    ownerId: '2',
    available: true
  },
  {
    id: 'p4',
    title: 'Luxury PG with All Amenities',
    description: 'Premium PG accommodation with all modern amenities including gym, game room, and high-speed internet.',
    price: 22000,
    location: 'Indiranagar, Bangalore',
    coordinates: { lat: 12.9784, lng: 77.6408 },
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=2070',
      'https://images.unsplash.com/photo-1616137583699-13afeb190803?q=80&w=2070',
      'https://images.unsplash.com/photo-1616486886892-ff366aa9a386?q=80&w=2062'
    ],
    amenities: ['Wi-Fi', 'Air conditioning', 'TV', 'Kitchen', 'Washing Machine', 'Gym', 'Swimming Pool', 'Game Room'],
    rating: 4.9,
    reviews: [],
    ownerId: '2',
    available: true,
    featured: true
  },
  {
    id: 'p5',
    title: 'Cozy 1BHK for Working Professionals',
    description: 'Perfect 1BHK apartment for working professionals. Quiet neighborhood with good connectivity.',
    price: 15000,
    location: 'Whitefield, Bangalore',
    coordinates: { lat: 12.9698, lng: 77.7499 },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=2070'
    ],
    amenities: ['Wi-Fi', 'Air conditioning', 'TV', 'Kitchen', 'Washing Machine', 'Security'],
    rating: 4.2,
    reviews: [],
    ownerId: '2',
    available: true
  },
  {
    id: 'p6',
    title: 'Female Only PG with Meals',
    description: 'Safe and secure PG accommodation for females with homely meals included. Near to IT parks.',
    price: 13500,
    location: 'Electronic City, Bangalore',
    coordinates: { lat: 12.8399, lng: 77.6770 },
    images: [
      'https://images.unsplash.com/photo-1615529162924-f8605388461d?q=80&w=2080',
      'https://images.unsplash.com/photo-1630699144339-420f59b4747a?q=80&w=2070',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071'
    ],
    amenities: ['Wi-Fi', 'Air conditioning', 'TV', 'Meals Included', 'Laundry', '24x7 Security'],
    rating: 4.6,
    reviews: [],
    ownerId: '2',
    available: true
  }
];

// Mock Bookings
export const bookings: Booking[] = [
  {
    id: 'b1',
    userId: '1',
    userName: 'John Finder',
    propertyId: 'p1',
    propertyTitle: 'Modern Studio in Central Area',
    checkIn: '2023-05-15',
    checkOut: '2023-06-15',
    totalPrice: 12000,
    status: 'completed',
    createdAt: '2023-05-01T09:45:00Z'
  },
  {
    id: 'b2',
    userId: '1',
    userName: 'John Finder',
    propertyId: 'p3',
    propertyTitle: 'Budget-Friendly Single Room',
    checkIn: '2023-07-01',
    checkOut: '2023-08-01',
    totalPrice: 8000,
    status: 'completed',
    createdAt: '2023-06-15T14:30:00Z'
  },
  {
    id: 'b3',
    userId: '1',
    userName: 'John Finder',
    propertyId: 'p4',
    propertyTitle: 'Luxury PG with All Amenities',
    checkIn: '2023-09-01',
    checkOut: '2023-10-01',
    totalPrice: 22000,
    status: 'confirmed',
    createdAt: '2023-08-20T11:15:00Z'
  }
];

// Mock Conversations
export const conversations: Conversation[] = [
  {
    id: 'conv1',
    participants: ['1', '2'],
    lastMessage: 'Is the property still available?',
    lastMessageTime: '2023-08-15T14:30:00Z',
    unreadCount: 2
  }
];

// Mock Messages
export const messages: Message[] = [
  {
    id: 'm1',
    senderId: '1',
    receiverId: '2',
    content: 'Hello, I am interested in your Modern Studio property.',
    timestamp: '2023-08-15T14:25:00Z',
    read: true,
    conversationId: 'conv1'
  },
  {
    id: 'm2',
    senderId: '2',
    receiverId: '1',
    content: 'Hi John, thanks for your interest! The property is available for viewing.',
    timestamp: '2023-08-15T14:28:00Z',
    read: true,
    conversationId: 'conv1'
  },
  {
    id: 'm3',
    senderId: '1',
    receiverId: '2',
    content: 'Great! When can I schedule a viewing?',
    timestamp: '2023-08-15T14:29:00Z',
    read: true,
    conversationId: 'conv1'
  },
  {
    id: 'm4',
    senderId: '1',
    receiverId: '2',
    content: 'Is the property still available?',
    timestamp: '2023-08-15T14:30:00Z',
    read: false,
    conversationId: 'conv1'
  }
];

// Mock data service functions
export const getMockProperties = () => properties;

export const getMockProperty = (id: string) => {
  return properties.find(property => property.id === id);
};

export const getMockBookings = (userId: string) => {
  return bookings.filter(booking => booking.userId === userId);
};

export const getMockOwnerProperties = (ownerId: string) => {
  return properties.filter(property => property.ownerId === ownerId);
};

export const getMockConversations = (userId: string) => {
  return conversations.filter(conv => conv.participants.includes(userId));
};

export const getMockMessages = (conversationId: string) => {
  return messages.filter(message => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const sendMockMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
  const newMessage: Message = {
    ...message,
    id: `m${messages.length + 1}`,
    timestamp: new Date().toISOString(),
  };
  
  messages.push(newMessage);
  
  // Update conversation last message
  const conversation = conversations.find(c => c.id === message.conversationId);
  if (conversation) {
    conversation.lastMessage = message.content;
    conversation.lastMessageTime = newMessage.timestamp;
    
    // Update unread count if receiver is not the sender
    if (conversation.participants.includes(message.receiverId)) {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
  }
  
  return newMessage;
};

// Helper function to generate a search URL
export const generateSearchUrl = (filters: Record<string, any>) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return `/search?${params.toString()}`;
};
