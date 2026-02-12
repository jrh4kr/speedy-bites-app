import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { EmptyOrders } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { formatPrice } from '@/components/ui/PriceDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  customer_id: string;
}

export const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      
      // Generate order numbers for display
      const ordersWithNumbers = (data || []).map((order: any) => ({
        id: order.id,
        order_number: `ORD-${String(order.id).slice(-6).toUpperCase()}`,
        status: order.status || 'pending',
        total: Number(order.total) || 0,
        created_at: order.created_at,
        customer_id: order.customer_id,
      }));

      setOrders(ordersWithNumbers);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't show error toast on initial load - orders might be empty
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
        <Header title="My Orders" showBack />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
        <Header title="My Orders" showBack />
        <EmptyOrders onBrowse={() => navigate('/menu')} />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
      <Header title="My Orders" showBack />

      <main className="px-4 py-4">
        <div className="space-y-4">
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="w-full rounded-xl bg-card p-4 shadow-card text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <OrderStatusBadge status={order.status as any} size="sm" />
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-bold">{formatPrice(order.total)}</span>
                <span className="flex items-center text-sm text-muted-foreground">
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
