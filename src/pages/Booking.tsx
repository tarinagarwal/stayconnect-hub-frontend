
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getMockProperty } from '@/data/mockData';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [property, setProperty] = useState(id ? getMockProperty(id) : null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(property?.price || 0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Form fields
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    if (location.state) {
      const { checkIn, checkOut } = location.state;
      if (checkIn) setCheckIn(new Date(checkIn));
      if (checkOut) setCheckOut(new Date(checkOut));
    }
  }, [location.state]);
  
  useEffect(() => {
    if (property && checkIn && checkOut) {
      const months = Math.max(1, Math.ceil(differenceInDays(checkOut, checkIn) / 30));
      setTotalPrice(property.price * months);
    }
  }, [property, checkIn, checkOut]);

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Property not found</h2>
        <p className="mb-6">Sorry, we couldn't find the property you're looking for.</p>
        <Button onClick={() => navigate('/search')}>Explore Other Properties</Button>
      </div>
    );
  }

  // Indian Rupee formatter
  const priceFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (!checkIn || !checkOut) {
      toast({
        title: "Date Selection Required",
        description: "Please select your move-in and move-out dates.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Booking Successful!",
        description: "Your booking has been confirmed.",
      });
      
      // Navigate to booking confirmation page
      navigate('/dashboard/bookings', { 
        state: { 
          bookingSuccess: true,
          propertyId: property.id,
          propertyTitle: property.title,
          checkIn,
          checkOut,
          totalPrice
        } 
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">You're booking {property.title}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your full name" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Your email address" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Your phone number" 
                      required 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="card" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="pl-6 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input 
                          id="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          required 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input 
                            id="expiry" 
                            placeholder="MM/YY" 
                            required 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            placeholder="123" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="upi" 
                      value="upi" 
                      checked={paymentMethod === 'upi'} 
                      onChange={() => setPaymentMethod('upi')}
                      className="h-4 w-4 text-primary"
                    />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                  
                  {paymentMethod === 'upi' && (
                    <div className="pl-6">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input 
                        id="upiId" 
                        placeholder="yourname@upi" 
                        required={paymentMethod === 'upi'} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ${priceFormatter.format(totalPrice)}`}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Booking Summary */}
          <div>
            <div className="bg-white p-6 rounded-lg border sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              <div className="mb-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-3">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-medium">{property.title}</h3>
                <p className="text-sm text-gray-600">{property.location}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-medium">
                    {checkIn ? format(checkIn, 'dd MMM yyyy') : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-medium">
                    {checkOut ? format(checkOut, 'dd MMM yyyy') : 'Not selected'}
                  </span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monthly rent:</span>
                  <span>{priceFormatter.format(property.price)}</span>
                </div>
                {checkIn && checkOut && (
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{Math.ceil(differenceInDays(checkOut, checkIn) / 30)} month(s)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Security deposit:</span>
                  <span>{priceFormatter.format(property.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee:</span>
                  <span>{priceFormatter.format(999)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>{priceFormatter.format(totalPrice + property.price + 999)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
