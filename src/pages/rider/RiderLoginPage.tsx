import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const RiderLoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as rider
  useEffect(() => {
    if (isAuthenticated && user?.role === 'rider' && !authLoading) {
      navigate('/rider/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(email, password);
      
      if (error) {
        toast.error(error.message || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      toast.success('Checking rider access...');
      
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (err) {
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Check role after auth state updates
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      if (user.role === 'rider') {
        toast.success('Welcome back, ' + (user.name || 'Rider') + '!');
        navigate('/rider/dashboard', { replace: true });
      } else if (isLoading) {
        toast.error('You do not have rider access');
        setIsLoading(false);
      }
    }
  }, [user, isAuthenticated, authLoading, navigate, isLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl">Rider Portal</CardTitle>
            <CardDescription>Sign in to manage deliveries</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="rider@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bike className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Rider access requires the rider role to be assigned to your account.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiderLoginPage;
