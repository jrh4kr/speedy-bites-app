import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, Clock, Receipt, Bell } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { OrderProgress, OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/components/ui/PriceDisplay';
// DeliveryMap removed - leaflet uninstalled
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_fee: number;
  subtotal: number;
  discount: number;
  notes: string | null;
  estimated_delivery_time: string | null;
  created_at: string;
  customer_id: string;
  delivery_address_id: string | null;
  order_items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;
  }>;
  delivery_address?: {
    street: string;
    city: string;
    phone: string | null;
  };
}

interface RiderAssignment {
  rider_id: string;
  status: string;
  rider?: {
    name: string;
    phone: string;
  };
}

export const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [riderAssignment, setRiderAssignment] = useState<RiderAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated real-time rider location
  const [riderLocation, setRiderLocation] = useState({ lat: -1.2880, lng: 36.8180, label: 'Rider' });

  useEffect(() => {
    if (id && user) {
      fetchOrderDetails();
    }
  }, [id, user]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch order from API
      const orderData = await api.getOrder(id!);
      
      if (!orderData) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }

      setOrder(orderData as unknown as Order);
      // Rider assignment would be fetched from API endpoint if it existed
      setRiderAssignment(null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate rider movement when order is on the way
  useEffect(() => {
    if (order?.status === 'on_the_way') {
      const interval = setInterval(() => {
        setRiderLocation(prev => ({
          ...prev,
          lat: prev.lat - 0.0005,
          lng: prev.lng - 0.0002,
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  // Simulate notification when status changes
  useEffect(() => {
    if (order?.status === 'on_the_way' && riderAssignment?.rider) {
      toast.info('🛵 Your order is on the way!', {
        description: `${riderAssignment.rider.name} is heading to your location`,
        duration: 5000,
      });
    }
  }, [order?.status, riderAssignment?.rider]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
        <Header title="Order Details" showBack />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
        <Header title="Order Details" showBack />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            View All Orders
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isActive = ['confirmed', 'preparing', 'on_the_way'].includes(order.status);

  // Customer location from order address (simulated coordinates)
  const customerLocation = { 
    lat: -1.2750, 
    lng: 36.8150, 
    label: order.delivery_address?.street || 'Delivery Address'
  };

  const orderNumber = `ORD-${String(order.id).slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background pb-8 lg:min-h-0 lg:bg-transparent lg:pb-0">
      <Header title={`Order ${orderNumber}`} showBack />
      
      <main className="px-4 py-4 space-y-4">
        {/* Live Map for Active Orders */}
         {order.status === 'on_the_way' && (
          <section className="rounded-xl overflow-hidden shadow-card">
            <div className="h-48 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Live map tracking coming soon</p>
            </div>
            <div className="p-3 bg-card flex items-center justify-between border-t">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">Live tracking</span>
              </div>
              <span className="text-sm font-medium">
                ETA: {order.estimated_delivery_time ? 
                  new Date(order.estimated_delivery_time).toLocaleTimeString('en-KE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : 'TBD'}
              </span>
            </div>
          </section>
        )}

        {/* Status Card */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Order Status</h3>
            <OrderStatusBadge status={order.status as any} />
          </div>
          
          {isActive && (
            <>
              <OrderProgress status={order.status as any} className="mb-4" />
              {order.estimated_delivery_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated delivery: {new Date(order.estimated_delivery_time).toLocaleTimeString('en-KE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              )}
            </>
          )}
        </section>

        {/* Rider Info (if on the way) */}
        {order.status === 'on_the_way' && riderAssignment?.rider && (
          <section className="rounded-xl bg-card p-4 shadow-card">
            <h3 className="font-semibold mb-4">Your Rider</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{riderAssignment.rider.name}</p>
                <p className="text-sm text-muted-foreground">{riderAssignment.rider.phone}</p>
              </div>
              <a
                href={`tel:${riderAssignment.rider.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </section>
        )}

        {/* Delivery Address */}
        {order.delivery_address && (
          <section className="rounded-xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Delivery Address</h3>
            </div>
            <p className="text-muted-foreground">
              {order.delivery_address.street}
              <br />
              {order.delivery_address.city}
            </p>
            {order.delivery_address.phone && (
              <p className="text-sm text-muted-foreground mt-1">
                Phone: {order.delivery_address.phone}
              </p>
            )}
          </section>
        )}

        {/* Order Items */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Order Items</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {order.order_items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-lg">🍽️</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground">Note: {item.notes}</p>
                  )}
                </div>
                <span className="font-medium text-sm">{formatPrice(item.total_price)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'Free'}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        {/* Order Info */}
        <section className="rounded-xl bg-card p-4 shadow-card">
          <h3 className="font-semibold mb-3">Order Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-medium">{(order as any).orderNumber || order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{(order as any).paymentMethod || 'Cash'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className={(order as any).paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>
                {(order as any).paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-3">
          {order.status === 'delivered' && (
            <Button 
              onClick={() => navigate('/menu')}
              className="w-full h-12"
            >
              Order Again
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => navigate('/help')}
            className="w-full h-12"
          >
            Need Help?
          </Button>
        </div>
      </main>
    </div>
  );
};

export default OrderTrackingPage;
