
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search,
  MessageCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Fetch all conversations for admin view
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['allConversations'],
    queryFn: async () => {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (convError) throw new Error(convError.message);
      
      // For each conversation, get participants and last message
      const conversationsWithDetails = await Promise.all(
        convData.map(async (conversation) => {
          // Get participants
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user:profiles(*)')
            .eq('conversation_id', conversation.id);
          
          // Get last message
          const { data: messages } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          return {
            ...conversation,
            participants: participants?.map((p: any) => p.user) || [],
            last_message: messages && messages.length > 0 ? messages[0] : null
          };
        })
      );
      
      return conversationsWithDetails;
    },
    enabled: !!currentUser
  });
  
  // Filter conversations based on search term
  const filteredConversations = React.useMemo(() => {
    if (!conversations) return [];
    if (!searchTerm.trim()) return conversations;
    
    const term = searchTerm.toLowerCase();
    return conversations.filter(conv => 
      conv.participants.some((p: any) => 
        p.name.toLowerCase().includes(term) || 
        p.email.toLowerCase().includes(term) ||
        p.role.toLowerCase().includes(term)
      ) ||
      (conv.last_message && conv.last_message.content.toLowerCase().includes(term))
    );
  }, [conversations, searchTerm]);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle view conversation
  const handleViewConversation = (participants: any[]) => {
    if (!currentUser || !participants || participants.length < 2) return;
    
    // Find a participant who is not the admin
    const otherParticipant = participants.find(p => p.id !== currentUser.id);
    if (otherParticipant) {
      navigate(`/messages?owner=${otherParticipant.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Message Center</h2>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participants</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <TableRow key={conversation.id}>
                        <TableCell>
                          <div className="flex -space-x-2 overflow-hidden">
                            {conversation.participants.slice(0, 3).map((participant: any, index: number) => (
                              <Avatar key={index} className="border-2 border-white">
                                {participant.avatar && (
                                  <AvatarImage src={participant.avatar} alt={participant.name} />
                                )}
                                <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {conversation.participants.length > 3 && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs">
                                +{conversation.participants.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            {conversation.participants.map((p: any) => p.name).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {conversation.last_message ? (
                            <div>
                              <p className="font-medium text-sm">{conversation.last_message.sender.name}:</p>
                              <p className="text-gray-600 truncate max-w-[200px]">
                                {conversation.last_message.content}
                              </p>
                              <p className="text-xs text-gray-500 md:hidden">
                                {formatTime(conversation.last_message.created_at)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-500">No messages yet</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {conversation.last_message ? (
                            <div>
                              <p>{formatDate(conversation.last_message.created_at)}</p>
                              <p className="text-xs text-gray-500">{formatTime(conversation.last_message.created_at)}</p>
                            </div>
                          ) : (
                            <span className="text-gray-500">{formatDate(conversation.created_at)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleViewConversation(conversation.participants)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        {searchTerm ? 'No conversations match your search' : 'No conversations found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessages;
