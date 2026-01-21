import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, ChevronRight, Edit2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/components/ui/PriceDisplay';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PaymentMethod = 'mpesa' | 'cash';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [address, setAddress] = useState({
    street: '',
    city: 'Nairobi',
    landmark: '',
  });
  const [notes, setNotes] = useState('');

  const handlePlaceOrder = async () => {
    if (!address.street.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders/ord-002', { replace: true }); // Navigate to order tracking
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title="Checkout" showBack showCart={false} />
      
      <main className="px-4 py-4 space-y-4">
        {/* Delivery Address */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Delivery Address</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Kenyatta Avenue"
                value={address.street}
                onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Near KICC, opposite bus stop"
                value={address.landmark}
                onChange={(e) => setAddress(prev => ({ ...prev, landmark: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <h3 className="font-semibold mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('mpesa')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-colors',
                paymentMethod === 'mpesa' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-transparent bg-secondary'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">M-Pesa</p>
                <p className="text-sm text-muted-foreground">Pay with mobile money</p>
              </div>
              <div className={cn(
                'h-5 w-5 rounded-full border-2',
                paymentMethod === 'mpesa' 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground'
              )}>
                {paymentMethod === 'mpesa' && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-colors',
                paymentMethod === 'cash' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-transparent bg-secondary'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Banknote className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay when you receive</p>
              </div>
              <div className={cn(
                'h-5 w-5 rounded-full border-2',
                paymentMethod === 'cash' 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground'
              )}>
                {paymentMethod === 'cash' && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Order Notes */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <h3 className="font-semibold mb-3">Delivery Notes (Optional)</h3>
          <Textarea
            placeholder="Any special instructions for delivery..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </section>

        {/* Order Summary */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Order Summary</h3>
            <button 
              onClick={() => navigate('/cart')}
              className="text-sm font-medium text-primary flex items-center gap-1"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          </div>
          
          <div className="mb-4 space-y-2">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span>{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <CartSummary />
          </div>
        </section>
      </main>

      {/* Place Order Button */}
      <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-6 md:bottom-0 safe-bottom">
        <Button
          onClick={handlePlaceOrder}
          disabled={isLoading || cart.items.length === 0}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          {isLoading ? 'Placing Order...' : `Place Order • ${formatPrice(cart.total)}`}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
