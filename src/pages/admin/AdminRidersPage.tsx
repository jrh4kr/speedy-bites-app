import { useState } from 'react';
import { Phone, Star, MapPin, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { mockRiders, mockAdminOrders } from '@/data/mockData';

export const AdminRidersPage = () => {
  const [riders] = useState(mockRiders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'offline': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout title="Riders Management">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {riders.filter(r => r.status === 'available').length}
            </p>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {riders.filter(r => r.status === 'busy').length}
            </p>
            <p className="text-sm text-muted-foreground">On Delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {riders.filter(r => r.status === 'offline').length}
            </p>
            <p className="text-sm text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Riders List */}
      <div className="space-y-4">
        {riders.map((rider) => {
          const currentOrder = rider.currentOrder 
            ? mockAdminOrders.find(o => o.id === rider.currentOrder) 
            : null;

          return (
            <Card key={rider.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {rider.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{rider.name}</h3>
                      <Badge className={getStatusColor(rider.status)}>
                        {rider.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {rider.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {rider.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {rider.completedToday} deliveries today
                      </div>
                    </div>

                    {currentOrder && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Current Delivery</p>
                        <div className="flex items-start gap-2 mt-1 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{currentOrder.address.street}, {currentOrder.address.city}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Order: {currentOrder.orderNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminRidersPage;
