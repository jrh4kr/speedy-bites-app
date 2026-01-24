import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShoppingBag, Tag, Megaphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationSetting {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
}

const initialSettings: NotificationSetting[] = [
  {
    id: 'orders',
    icon: ShoppingBag,
    title: 'Order Updates',
    description: 'Get notified about your order status',
    enabled: true,
  },
  {
    id: 'promotions',
    icon: Tag,
    title: 'Promotions & Offers',
    description: 'Receive special deals and discounts',
    enabled: true,
  },
  {
    id: 'news',
    icon: Megaphone,
    title: 'News & Announcements',
    description: 'Stay updated with new menu items',
    enabled: false,
  },
  {
    id: 'reminders',
    icon: Bell,
    title: 'Reminders',
    description: 'Get reminded about items in your cart',
    enabled: false,
  },
];

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);

  const handleToggle = (id: string) => {
    setSettings(prev =>
      prev.map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
    toast.success('Notification settings updated');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Notifications</h1>
      </header>

      <main className="px-4 py-4">
        <div className="rounded-xl border bg-card overflow-hidden">
          {settings.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.id}
                className={`flex items-center gap-4 p-4 ${
                  index !== settings.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{setting.title}</h3>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => handleToggle(setting.id)}
                />
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          You can change these settings at any time
        </p>
      </main>
    </div>
  );
};

export default NotificationsPage;
