import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { EmptyOrders } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { formatPrice } from '@/components/ui/PriceDisplay';
import { mockOrders } from '@/data/mockData';

export const OrdersPage = () => {
  const navigate = useNavigate();

  if (mockOrders.length === 0) {
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
          {mockOrders.map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="w-full rounded-xl bg-card p-4 shadow-card text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
                </p>
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
