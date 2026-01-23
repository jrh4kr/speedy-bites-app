import { useState } from 'react';
import { Phone, Star, Package, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockRiders, type Rider } from '@/data/mockData';

const statusColors: Record<Rider['status'], string> = {
  available: 'bg-green-100 text-green-700',
  busy: 'bg-yellow-100 text-yellow-700',
  offline: 'bg-gray-100 text-gray-700',
};

export const AdminRidersSection = () => {
  const [riders, setRiders] = useState<Rider[]>(mockRiders);

  const toggleRiderStatus = (riderId: string) => {
    setRiders(prev => prev.map(rider => {
      if (rider.id === riderId) {
        const newStatus = rider.status === 'offline' ? 'available' : 'offline';
        toast.success(`${rider.name} is now ${newStatus}`);
        return { ...rider, status: newStatus };
      }
      return rider;
    }));
  };

  const availableCount = riders.filter(r => r.status === 'available').length;
  const busyCount = riders.filter(r => r.status === 'busy').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{busyCount}</p>
            <p className="text-sm text-muted-foreground">Busy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{riders.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Riders List */}
      <div className="space-y-3">
        {riders.map((rider) => (
          <Card key={rider.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {rider.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{rider.name}</h3>
                      <Badge className={statusColors[rider.status]}>
                        {rider.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" />
                      {rider.phone}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {rider.rating}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {rider.completedToday} today
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {rider.status === 'busy' && rider.currentOrder && (
                    <Badge variant="outline" className="bg-blue-50">
                      <MapPin className="h-3 w-3 mr-1" />
                      On delivery
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRiderStatus(rider.id)}
                    disabled={rider.status === 'busy'}
                  >
                    {rider.status === 'offline' ? 'Set Available' : 'Set Offline'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
