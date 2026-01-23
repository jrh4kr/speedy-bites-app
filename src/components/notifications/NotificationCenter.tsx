import { useState, useEffect } from 'react';
import { Bell, X, Package, Bike, CheckCircle, Clock, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'order_confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'new_order' | 'assigned';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  orderId?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order_confirmed':
      return <CheckCircle className="h-5 w-5 text-success" />;
    case 'preparing':
      return <ChefHat className="h-5 w-5 text-warning" />;
    case 'on_the_way':
      return <Bike className="h-5 w-5 text-primary" />;
    case 'delivered':
      return <Package className="h-5 w-5 text-success" />;
    case 'new_order':
      return <Package className="h-5 w-5 text-accent" />;
    case 'assigned':
      return <Bike className="h-5 w-5 text-primary" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const NotificationCenter = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll,
  className 
}: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card transition-transform active:scale-95",
          className
        )}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          )}
        </SheetHeader>
        
        <div className="mt-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onMarkAsRead(notification.id)}
                className={cn(
                  "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                  notification.read 
                    ? "bg-muted/30" 
                    : "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      "text-sm",
                      !notification.read && "font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Hook to simulate real-time notifications
export const useNotifications = (userType: 'customer' | 'rider' | 'admin') => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Simulate initial notifications
  useEffect(() => {
    const mockNotifications: Notification[] = userType === 'customer' 
      ? [
          {
            id: '1',
            type: 'delivered',
            title: 'Order Delivered!',
            message: 'Your order #KNS-1234 has been delivered. Enjoy your meal!',
            timestamp: new Date(Date.now() - 300000),
            read: false,
          },
          {
            id: '2',
            type: 'preparing',
            title: 'Order Being Prepared',
            message: 'Your order #KNS-1235 is now being prepared by our chefs.',
            timestamp: new Date(Date.now() - 1800000),
            read: true,
          },
        ]
      : userType === 'rider'
      ? [
          {
            id: '1',
            type: 'new_order',
            title: 'New Order Available!',
            message: 'New delivery available near you - KES 350 reward',
            timestamp: new Date(Date.now() - 60000),
            read: false,
          },
          {
            id: '2',
            type: 'assigned',
            title: 'Order Assigned',
            message: 'You have been assigned order #KNS-1236',
            timestamp: new Date(Date.now() - 3600000),
            read: true,
          },
        ]
      : [];
    
    setNotifications(mockNotifications);
  }, [userType]);

  return { notifications, addNotification, markAsRead, clearAll };
};
