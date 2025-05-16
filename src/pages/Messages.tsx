
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  getMockConversations,
  getMockMessages,
  sendMockMessage,
  Conversation,
  Message,
} from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';

const Messages = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations for current user
  useEffect(() => {
    if (currentUser) {
      const userConversations = getMockConversations(currentUser.id);
      setConversations(userConversations);
      
      // Check if we have an owner ID from URL params (for direct messaging)
      const ownerParam = searchParams.get('owner');
      if (ownerParam) {
        setOwnerId(ownerParam);
        
        // Check if we already have a conversation with this owner
        const existingConv = userConversations.find(conv => 
          conv.participants.includes(ownerParam)
        );
        
        if (existingConv) {
          setActiveConversation(existingConv);
          loadMessages(existingConv.id);
        } else {
          // Create a new conversation (in a real app, this would be an API call)
          const newConv: Conversation = {
            id: `conv_${Date.now()}`,
            participants: [currentUser.id, ownerParam],
            unreadCount: 0
          };
          setConversations(prev => [...prev, newConv]);
          setActiveConversation(newConv);
        }
      } else if (userConversations.length > 0) {
        // If no owner in URL, select first conversation by default
        setActiveConversation(userConversations[0]);
        loadMessages(userConversations[0].id);
      }
    }
  }, [currentUser, searchParams]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = (conversationId: string) => {
    const conversationMessages = getMockMessages(conversationId);
    setMessages(conversationMessages);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation || !currentUser) return;
    
    // Get the other participant's ID
    const receiverId = activeConversation.participants.find(
      id => id !== currentUser.id
    );
    
    if (!receiverId) return;
    
    // Send the message
    const sentMessage = sendMockMessage({
      senderId: currentUser.id,
      receiverId,
      content: newMessage,
      conversationId: activeConversation.id,
      read: false
    });
    
    // Update local state
    setMessages(prev => [...prev, sentMessage]);
    setNewMessage('');
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUser) return '';
    
    const otherId = conversation.participants.find(
      id => id !== currentUser.id
    );
    
    // In a real app, you would fetch user details
    return otherId === '1' ? 'John Finder' :
           otherId === '2' ? 'Mary Owner' : 
           otherId === '3' ? 'Admin User' : 'Unknown User';
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(80vh-6rem)]">
        {/* Conversations List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4">
            <h2 className="font-semibold text-lg">Conversations</h2>
          </div>
          <Separator />
          <div className="overflow-y-auto h-[calc(80vh-12rem)]">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 flex items-center gap-3 cursor-pointer ${
                    activeConversation?.id === conversation.id
                      ? 'bg-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(getOtherParticipant(conversation))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium truncate">
                        {getOtherParticipant(conversation)}
                      </p>
                      {conversation.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.lastMessageTime), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Display */}
        <div className="lg:col-span-2 bg-white rounded-lg border overflow-hidden flex flex-col">
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 flex items-center gap-3 border-b">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(getOtherParticipant(activeConversation))}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {getOtherParticipant(activeConversation)}
                  </h2>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            message.senderId === currentUser?.id
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === currentUser?.id
                                ? 'text-white/70'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.timestamp), {
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
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <h3 className="font-semibold mb-2">No conversation selected</h3>
                <p className="text-gray-500">
                  Select a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
