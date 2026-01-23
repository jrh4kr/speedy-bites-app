import { useState } from 'react';
import { Search, Filter, Eye, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { toast } from 'sonner';
import { mockAdminOrders, mockRiders, type AdminOrder, type Rider } from '@/data/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  ready_for_pickup: 'bg-purple-100 text-purple-700',
  on_the_way: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const AdminOrdersSection = () => {
  const [orders, setOrders] = useState<AdminOrder[]>(mockAdminOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [assignRiderDialogOpen, setAssignRiderDialogOpen] = useState(false);
  const [orderForRider, setOrderForRider] = useState<AdminOrder | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus as AdminOrder['status'] } : order
    ));
    toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleAssignRider = (rider: Rider) => {
    if (orderForRider) {
      setOrders(prev => prev.map(order => 
        order.id === orderForRider.id ? { ...order, rider, status: 'on_the_way' } : order
      ));
      toast.success(`Assigned ${rider.name} to order ${orderForRider.orderNumber}`);
      setAssignRiderDialogOpen(false);
      setOrderForRider(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready_for_pickup">Ready</SelectItem>
            <SelectItem value="on_the_way">On the Way</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{order.orderNumber}</h3>
                    <Badge className={statusColors[order.status]}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  <PriceDisplay price={order.total} className="font-semibold mt-1" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    >
                      Accept
                    </Button>
                  )}

                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'ready_for_pickup')}
                    >
                      Mark Ready
                    </Button>
                  )}

                  {order.status === 'ready_for_pickup' && !order.rider && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setOrderForRider(order);
                        setAssignRiderDialogOpen(true);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Assign Rider
                    </Button>
                  )}

                  {order.rider && (
                    <Badge variant="outline" className="bg-blue-50">
                      🏍️ {order.rider.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Customer</h4>
                <p className="text-sm">{selectedOrder.customerName}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Delivery Address</h4>
                <p className="text-sm">{selectedOrder.address.street}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.address.city}</p>
                {selectedOrder.address.landmark && (
                  <p className="text-sm text-muted-foreground">{selectedOrder.address.landmark}</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <PriceDisplay price={item.totalPrice} />
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <PriceDisplay price={selectedOrder.total} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Rider Dialog */}
      <Dialog open={assignRiderDialogOpen} onOpenChange={setAssignRiderDialogOpen}>
        <DialogContent className="max-w-sm bg-background">
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {mockRiders.filter(r => r.status === 'available').map((rider) => (
              <button
                key={rider.id}
                onClick={() => handleAssignRider(rider)}
                className="w-full p-3 border rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rider.name}</p>
                    <p className="text-sm text-muted-foreground">{rider.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">⭐ {rider.rating}</p>
                    <p className="text-xs text-muted-foreground">{rider.completedToday} today</p>
                  </div>
                </div>
              </button>
            ))}
            {mockRiders.filter(r => r.status === 'available').length === 0 && (
              <p className="text-center text-muted-foreground py-4">No riders available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
