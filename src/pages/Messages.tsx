
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messagesApi } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { usersApi } from '@/services/api';

const Messages = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users for new conversation dialog
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAllUsers,
    enabled: !!currentUser
  });

  // Fetch conversations for current user
  const { 
    data: conversations, 
    isLoading: conversationsLoading 
  } = useQuery({
    queryKey: ['conversations', currentUser?.id],
    queryFn: () => currentUser ? messagesApi.getConversations(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });

  // Fetch messages for active conversation
  const { 
    data: messages, 
    isLoading: messagesLoading 
  } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId ? messagesApi.getMessages(activeConversationId) : Promise.resolve([]),
    enabled: !!activeConversationId,
    // Real-time updates (poll every 3 seconds)
    refetchInterval: 3000
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (participants: string[]) => messagesApi.createConversation(participants),
    onSuccess: (data) => {
      setActiveConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser?.id] });
      setNewConversationDialogOpen(false);
      toast({
        title: "New conversation created",
        description: "You can now start messaging"
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string, content: string }) => 
      messagesApi.sendMessage(conversationId, currentUser!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      setNewMessage('');
    }
  });

  // Handle initial params and conversation setup
  useEffect(() => {
    if (!currentUser) return;

    // Check if we have a target user ID from URL params
    const ownerId = searchParams.get('owner');
    if (ownerId) {
      setTargetUserId(ownerId);
      
      // Check if we already have a conversation with this user
      const existingConversation = conversations?.find(conv => 
        conv.participants.some(p => p.id === ownerId)
      );
      
      if (existingConversation) {
        setActiveConversationId(existingConversation.id);
      } else if (!createConversationMutation.isPending && currentUser.id !== ownerId) {
        // Create a new conversation
        createConversationMutation.mutate([currentUser.id, ownerId]);
      }
    } else if (conversations && conversations.length > 0 && !activeConversationId) {
      // If no specific conversation is requested, select first conversation by default
      setActiveConversationId(conversations[0].id);
    }
  }, [currentUser, searchParams, conversations, createConversationMutation, activeConversationId]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversationId || !currentUser) {
      return;
    }
    
    sendMessageMutation.mutate({ 
      conversationId: activeConversationId, 
      content: newMessage.trim() 
    });
  };

  const handleCreateNewConversation = () => {
    if (!currentUser || !selectedUserId || selectedUserId === currentUser.id) {
      toast({
        title: "Invalid selection",
        description: "Please select a valid user to chat with",
        variant: "destructive"
      });
      return;
    }

    // Check if conversation already exists
    const existingConversation = conversations?.find(conv => 
      conv.participants.some(p => p.id === selectedUserId)
    );
    
    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      setNewConversationDialogOpen(false);
    } else {
      createConversationMutation.mutate([currentUser.id, selectedUserId]);
    }
  };

  const getOtherParticipant = (conversationParticipants: any[]) => {
    if (!currentUser) return null;
    
    return conversationParticipants.find(
      p => p.id !== currentUser.id
    );
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle unauthorized access
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <p className="text-gray-500">Please log in to view your messages</p>
      </div>
    );
  }

  // Filter out current user from new conversation list
  const otherUsers = users?.filter(user => user.id !== currentUser.id) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(80vh-6rem)]">
        {/* Conversations List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Conversations</h2>
            <Dialog open={newConversationDialogOpen} onOpenChange={setNewConversationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a new conversation</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="user-select">Select a user to chat with</Label>
                  <select
                    id="user-select"
                    className="w-full mt-2 p-2 border rounded-md"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {otherUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewConversationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNewConversation} disabled={!selectedUserId}>
                    Start Conversation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Separator />
          <div className="overflow-y-auto h-[calc(80vh-12rem)]">
            {conversationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation.participants);
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer ${
                      activeConversationId === conversation.id
                        ? 'bg-primary/5'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Avatar>
                      {otherParticipant?.avatar && (
                        <AvatarImage src={otherParticipant.avatar} />
                      )}
                      <AvatarFallback>
                        {otherParticipant ? getInitials(otherParticipant.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium truncate">
                          {otherParticipant?.name || 'Unknown User'}
                        </p>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                    </div>
                    {/* We'd need to implement unread counts properly */}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations yet. Start a new one!
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Display */}
        <div className="lg:col-span-2 bg-white rounded-lg border overflow-hidden flex flex-col">
          {activeConversationId ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 flex items-center gap-3 border-b">
                {messagesLoading || !conversations ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const conversation = conversations.find(c => c.id === activeConversationId);
                      const otherParticipant = conversation ? getOtherParticipant(conversation.participants) : null;
                      
                      return (
                        <>
                          <Avatar>
                            {otherParticipant?.avatar && (
                              <AvatarImage src={otherParticipant.avatar} />
                            )}
                            <AvatarFallback>
                              {otherParticipant ? getInitials(otherParticipant.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="font-semibold">
                              {otherParticipant?.name || 'Unknown User'}
                            </h2>
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            message.sender_id === currentUser.id
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === currentUser.id
                                ? 'text-white/70'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No messages yet. Say hello!</p>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button type="submit" disabled={sendMessageMutation.isPending}>
                    {sendMessageMutation.isPending ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <Send className="h-4 w-4" />
                    }
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <h3 className="font-semibold mb-2">No conversation selected</h3>
                <p className="text-gray-500">
                  Select a conversation from the list or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add the missing Label component
const Label = ({ htmlFor, children, className = "" }: { htmlFor?: string; children: React.ReactNode; className?: string }) => {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
};

export default Messages;
