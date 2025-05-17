
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Send, UserPlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

interface Conversation {
  id: string;
  created_at: string;
  participants: User[];
  last_message?: Message;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  email?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  conversation_id: string;
}

const Messages = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Get owner from query params if available
  const queryParams = new URLSearchParams(location.search);
  const ownerIdParam = queryParams.get('owner');
  
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversation:conversations(
            id,
            created_at
          )
        `)
        .eq('user_id', currentUser.id);
      
      if (participantError) throw participantError;
      
      if (!participantData || participantData.length === 0) return [];
      
      const conversationIds = participantData.map(p => p.conversation_id);
      
      // For each conversation, get the participants and the last message
      const conversationsWithDetails = await Promise.all(
        participantData.map(async (p) => {
          // Get participants
          const { data: participantsData, error: partError } = await supabase
            .from('conversation_participants')
            .select(`
              user:profiles(
                id, 
                name,
                avatar,
                role
              )
            `)
            .eq('conversation_id', p.conversation_id);
          
          if (partError) throw partError;
          
          // Get last message
          const { data: lastMessageData, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', p.conversation_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          // Don't throw error here as conversation might not have messages yet
          const participants = participantsData.map(pd => pd.user);
          
          return {
            ...p.conversation,
            participants,
            last_message: msgError ? null : lastMessageData
          };
        })
      );
      
      return conversationsWithDetails;
    },
    enabled: isAuthenticated
  });
  
  // Fetch messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation?.id
  });
  
  // Fetch available users for starting a new conversation
  const { data: availableUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['availableUsers'],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      // Get users based on the current user's role
      let query = supabase
        .from('profiles')
        .select('id, name, role, avatar')
        .neq('id', currentUser.id);
      
      // Filter users based on role
      if (currentUser.role === 'finder') {
        query = query.eq('role', 'owner');
      } else if (currentUser.role === 'owner') {
        query = query.eq('role', 'finder');
      }
      // Admins can talk to anyone
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && showNewConversationDialog
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { conversation_id: string, sender_id: string, content: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUser) throw new Error("You must be logged in");
      
      // First create the conversation
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
      
      if (convError) throw convError;
      
      // Then add participants
      const participants = [
        { conversation_id: conversationData.id, user_id: currentUser.id },
        { conversation_id: conversationData.id, user_id: userId }
      ];
      
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);
      
      if (partError) throw partError;
      
      return {
        ...conversationData, 
        participants: [
          currentUser,
          availableUsers?.find(u => u.id === userId)
        ]
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(data);
      setShowNewConversationDialog(false);
      toast({
        title: 'Success',
        description: 'Conversation created successfully',
      });
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      toast({
        title: 'Error',
        description: `Failed to create conversation: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation?.id || !currentUser) return;
    
    sendMessageMutation.mutate({
      conversation_id: selectedConversation.id,
      sender_id: currentUser.id,
      content: messageText.trim()
    });
  };
  
  // Start new conversation with a user
  const startConversation = (user: User) => {
    createConversationMutation.mutate(user.id);
  };
  
  // Effect to auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Effect to handle owner id param from URL
  useEffect(() => {
    if (ownerIdParam && currentUser && conversations) {
      // Check if we already have a conversation with this owner
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p.id === ownerIdParam)
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else if (currentUser.id !== ownerIdParam) {
        // Create a new conversation
        createConversationMutation.mutate(ownerIdParam);
      }
    }
  }, [ownerIdParam, currentUser, conversations]);
  
  // Select message participant that isn't the current user
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUser?.id) || conversation.participants[0];
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">You need to be logged in</h2>
        <p className="mb-6">Please log in to view your messages.</p>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col h-[calc(100vh-200px)] rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r md:col-span-1 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold text-lg">Conversations</h2>
              <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                    <DialogDescription>
                      Select a user to start a conversation with.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2 py-4">
                    {loadingUsers && <p className="text-center py-4">Loading users...</p>}
                    
                    {!loadingUsers && availableUsers?.length === 0 && (
                      <p className="text-center py-4 text-gray-500">No users available to chat with.</p>
                    )}
                    
                    {availableUsers?.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => startConversation(user)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={user.avatar || ''} />
                          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <ScrollArea className="h-[calc(100%-65px)]">
              {loadingConversations ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="space-y-1 p-1">
                  {conversations.map(conversation => {
                    const otherPerson = getOtherParticipant(conversation);
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <div
                        key={conversation.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                          isSelected ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={otherPerson?.avatar || ''} />
                          <AvatarFallback>{otherPerson?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{otherPerson?.name}</p>
                            {conversation.last_message && (
                              <span className="text-xs text-gray-500">
                                {new Date(conversation.last_message.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {conversation.last_message ? (
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.last_message.sender_id === currentUser?.id ? 'You: ' : ''}
                              {conversation.last_message.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">No messages yet</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-gray-500 mb-4">No conversations yet.</p>
                  <Button onClick={() => setShowNewConversationDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Messages Content */}
          <div className="md:col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center">
                  <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedConversation(null)}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar || ''} />
                      <AvatarFallback>
                        {getOtherParticipant(selectedConversation)?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getOtherParticipant(selectedConversation)?.name}</p>
                      <p className="text-xs text-gray-500">{getOtherParticipant(selectedConversation)?.role}</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-hidden p-4">
                  <ScrollArea className="h-full" ref={scrollAreaRef}>
                    {loadingMessages ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map(message => {
                          const isCurrentUser = message.sender_id === currentUser?.id;
                          
                          return (
                            <div 
                              key={message.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  isCurrentUser
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <p>{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  isCurrentUser ? 'text-white/80' : 'text-gray-500'
                                }`}>
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim() || sendMessageMutation.isPending}>
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500 mb-4">Choose a conversation from the sidebar or start a new one.</p>
                <Button onClick={() => setShowNewConversationDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
