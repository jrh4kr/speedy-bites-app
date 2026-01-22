import { useState } from 'react';
import { Eye, Check, Bike, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { mockAdminOrders, mockRiders, type AdminOrder } from '@/data/mockData';
import { toast } from 'sonner';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState(mockAdminOrders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter(
    order => statusFilter === 'all' || order.status === statusFilter
  );

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus as any } : order
    ));
    toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
  };

  const assignRider = (orderId: string, riderId: string) => {
    const rider = mockRiders.find(r => r.id === riderId);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, rider } : order
    ));
    toast.success(`Rider ${rider?.name} assigned`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'on_the_way': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout title="Orders Management">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="on_the_way">On the Way</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold">{order.orderNumber}</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} • {order.items.length} items
                  </p>
                  <PriceDisplay price={order.total} className="font-semibold mt-1" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Status Actions */}
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                    >
                      Ready & Dispatch
                    </Button>
                  )}
                  {order.status === 'on_the_way' && (
                    <Button 
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </div>

              {order.rider && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                  <Bike className="h-4 w-4 text-muted-foreground" />
                  <span>Rider: {order.rider.name}</span>
                  <span className="text-muted-foreground">({order.rider.phone})</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{selectedOrder.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="h-4 w-4" />
                  {selectedOrder.customerPhone}
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>
                    {selectedOrder.address.street}, {selectedOrder.address.city}
                    {selectedOrder.address.landmark && ` (${selectedOrder.address.landmark})`}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <PriceDisplay price={item.totalPrice} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <PriceDisplay price={selectedOrder.subtotal} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <PriceDisplay price={selectedOrder.deliveryFee} />
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-<PriceDisplay price={selectedOrder.discount} /></span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2">
                  <span>Total</span>
                  <PriceDisplay price={selectedOrder.total} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
