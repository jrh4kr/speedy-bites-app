import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Settings,
  Heart,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: User, label: 'Edit Profile', path: '/profile/edit' },
  { icon: MapPin, label: 'Saved Addresses', path: '/profile/addresses' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
  { icon: CreditCard, label: 'Payment Methods', path: '/profile/payments' },
  { icon: Bell, label: 'Notifications', path: '/profile/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header title="Profile" />
      
      <main className="px-4 py-4">
        {/* User Info */}
        <section className="mb-6 rounded-xl bg-card p-4 shadow-card">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                className="text-sm font-medium text-primary"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="mb-4 text-muted-foreground">Sign in to access your account</p>
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          )}
        </section>

        {/* Menu Items */}
        <section className="mb-6 rounded-xl bg-card shadow-card overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex w-full items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50',
                  index !== menuItems.length - 1 && 'border-b'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </section>

        {/* Dark Mode Toggle */}
        <section className="mb-6 rounded-xl bg-card shadow-card overflow-hidden">
          <div className="flex w-full items-center gap-4 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
            </div>
            <span className="flex-1 font-medium">Dark Mode</span>
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={toggleTheme}
            />
          </div>
        </section>

        {/* Logout */}
        {isAuthenticated && (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        )}

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Kuku Ni Sisi v1.0.0</p>
          <p className="mt-1">Made with ❤️ in Kenya</p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
