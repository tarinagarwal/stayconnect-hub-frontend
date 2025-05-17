
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PropertyBookings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch bookings for owner properties
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['ownerBookings', currentUser?.id],
    queryFn: () => currentUser ? bookingsApi.getByPropertyOwnerId(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser
  });

  // Mutation to update booking status
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      bookingsApi.updateStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerBookings'] });
      toast({
        title: "Status updated",
        description: "The booking status has been updated successfully."
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Format for price
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  // Handle status update
  const handleUpdateStatus = () => {
    if (selectedBooking && newStatus) {
      updateBookingMutation.mutate({
        id: selectedBooking.id,
        status: newStatus
      });
    }
  };

  // Open dialog to update status
  const openStatusDialog = (booking: any) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No bookings found for your properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Bookings</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{booking.property?.title || 'Unknown Property'}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Booked by: {booking.user?.name || 'Unknown User'}</p>
                    <p>Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
                    <p>Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
                    <p>Booked on: {new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="mb-2">
                    <span className="font-medium text-lg">{priceFormatter.format(booking.total_price)}</span>
                  </div>
                  
                  <StatusBadge status={booking.status} />
                  
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openStatusDialog(booking)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of this booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-2 text-sm font-medium">Property: {selectedBooking?.property?.title}</p>
            <p className="mb-4 text-sm text-gray-500">
              Booked by {selectedBooking?.user?.name} from {' '}
              {selectedBooking && new Date(selectedBooking.check_in).toLocaleDateString()} to {' '}
              {selectedBooking && new Date(selectedBooking.check_out).toLocaleDateString()}
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={updateBookingMutation.isPending || newStatus === selectedBooking?.status}
            >
              {updateBookingMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let badgeClass = '';
  
  switch (status) {
    case 'confirmed':
      badgeClass = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'pending':
      badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case 'cancelled':
      badgeClass = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'completed':
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    default:
      badgeClass = 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  return (
    <Badge variant="outline" className={`${badgeClass} font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default PropertyBookings;
