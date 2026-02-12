import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  Phone, 
  CheckCircle, 
  LogOut, 
  Navigation,
  Star,
  DollarSign,
  Bike
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/ui/Logo';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { mockRiderOrders, mockDeliveryHistory } from '@/data/mockData';

type DeliveryStatus = 'picked_up' | 'on_the_way' | 'arrived' | 'delivered';

interface ActiveDelivery {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: {
    street: string;
    city: string;
    landmark?: string;
  };
  items: { name: string; quantity: number }[];
  total: number;
  status: DeliveryStatus;
}

export const RiderDashboardPage = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState(mockRiderOrders);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [riderStatus, setRiderStatus] = useState<'online' | 'offline'>('online');
  const [notifications] = useState<{id: string; type: string; title: string; message: string}[]>([]);
  const addNotification = (n: {type: string; title: string; message: string}) => { console.log('notification:', n); };

  const [riderLocation, setRiderLocation] = useState({ lat: -1.2900, lng: 36.8200, label: 'Your Location' });

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/rider/login');
  };

  // Access check
  if (isAuthenticated && user && user.role !== 'rider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-4">You need rider privileges to access this page.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const acceptOrder = (order: typeof mockRiderOrders[0]) => {
    setActiveDelivery({
      ...order,
      status: 'picked_up',
    });
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    setActiveTab('active');
    toast.success('Order accepted!');
    addNotification({
      type: 'assigned',
      title: 'Order Accepted',
      message: `You accepted order ${order.orderNumber}. Head to the restaurant for pickup.`,
    });
  };

  const updateDeliveryStatus = (newStatus: DeliveryStatus) => {
    if (activeDelivery) {
      if (newStatus === 'delivered') {
        toast.success('Delivery completed! 🎉');
        addNotification({
          type: 'delivered',
          title: 'Delivery Complete!',
          message: `Order ${activeDelivery.orderNumber} has been delivered successfully.`,
        });
        setActiveDelivery(null);
        setActiveTab('available');
      } else {
        setActiveDelivery({ ...activeDelivery, status: newStatus });
        toast.success(`Status updated to: ${newStatus.replace('_', ' ')}`);
        
        if (newStatus === 'on_the_way') {
          setRiderLocation({ lat: -1.2880, lng: 36.8180, label: 'Your Location' });
        } else if (newStatus === 'arrived') {
          setRiderLocation({ lat: -1.2750, lng: 36.8150, label: 'Your Location' });
        }
      }
    }
  };

  const toggleStatus = () => {
    const newStatus = riderStatus === 'online' ? 'offline' : 'online';
    setRiderStatus(newStatus);
    toast.success(`You are now ${newStatus}`);
  };

  const statusSteps: DeliveryStatus[] = ['picked_up', 'on_the_way', 'arrived', 'delivered'];
  const currentStepIndex = activeDelivery ? statusSteps.indexOf(activeDelivery.status) : -1;

  const todayStats = {
    deliveries: mockDeliveryHistory.filter(d => 
      new Date(d.deliveredAt).toDateString() === new Date().toDateString()
    ).length,
    earnings: mockDeliveryHistory.reduce((sum, d) => sum + (d.tip || 0), 0) + 2500,
    rating: 4.8,
  };

  const customerLocation = activeDelivery 
    ? { lat: -1.2750, lng: 36.8150, label: activeDelivery.address.street }
    : undefined;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-bold text-sm">Rider Dashboard</h1>
              <Badge 
                className={riderStatus === 'online' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}
              >
                {riderStatus}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button variant="outline" size="sm" onClick={toggleStatus}>
              {riderStatus === 'online' ? 'Go Offline' : 'Go Online'}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Today's Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{todayStats.deliveries}</p>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-success" />
              <PriceDisplay price={todayStats.earnings} className="text-xl font-bold" />
              <p className="text-xs text-muted-foreground">Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-warning" />
              <p className="text-xl font-bold">{todayStats.rating}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Available ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="active" disabled={!activeDelivery}>
            Active
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Available Orders */}
        <TabsContent value="available" className="space-y-3 mt-4">
          {riderStatus === 'offline' ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bike className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Go online to see available orders</p>
              </CardContent>
            </Card>
          ) : availableOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No orders available right now</p>
              </CardContent>
            </Card>
          ) : (
            availableOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <PriceDisplay price={order.total} className="font-bold" />
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{order.address.street}</p>
                        <p className="text-muted-foreground">{order.address.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📍 {order.distance}</span>
                      <span>⏱️ {order.estimatedTime}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => acceptOrder(order)}>
                      Accept Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Active Delivery */}
        <TabsContent value="active" className="mt-4">
          {activeDelivery && (
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="h-56 bg-muted flex items-center justify-center text-muted-foreground">
                  <Navigation className="h-8 w-8 mr-2" />
                  <span>Delivery in progress</span>
                </div>
                <div className="p-3 flex justify-between items-center border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">ETA: 15 mins</span>
                  </div>
                  <Button size="sm" variant="secondary">
                    <Navigation className="h-4 w-4 mr-1" />
                    Open Maps
                  </Button>
                </div>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{activeDelivery.orderNumber}</CardTitle>
                    <Badge className="bg-primary/20 text-primary">
                      {activeDelivery.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activeDelivery.customerName}</p>
                      <p className="text-sm text-muted-foreground">{activeDelivery.address.street}</p>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                      <a href={`tel:${activeDelivery.customerPhone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {activeDelivery.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <PriceDisplay price={activeDelivery.total} className="font-bold" />
                    </div>
                  </div>

                  <div className="flex justify-between py-3">
                    {statusSteps.map((step, index) => (
                      <div key={step} className="flex flex-col items-center gap-1">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          index <= currentStepIndex 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index < currentStepIndex ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {activeDelivery.status === 'picked_up' && (
                    <Button className="w-full" onClick={() => updateDeliveryStatus('on_the_way')}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Start Delivery
                    </Button>
                  )}
                  {activeDelivery.status === 'on_the_way' && (
                    <Button className="w-full" onClick={() => updateDeliveryStatus('arrived')}>
                      <MapPin className="h-4 w-4 mr-2" />
                      I've Arrived
                    </Button>
                  )}
                  {activeDelivery.status === 'arrived' && (
                    <Button className="w-full" onClick={() => updateDeliveryStatus('delivered')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Delivery
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Delivery History */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {mockDeliveryHistory.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{delivery.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(delivery.deliveredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceDisplay price={delivery.total} className="font-semibold" />
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="text-sm">{delivery.rating}</span>
                    </div>
                    {delivery.tip > 0 && (
                      <span className="text-xs text-success">
                        +KES {delivery.tip} tip
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiderDashboardPage;
