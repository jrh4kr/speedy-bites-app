import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && !authLoading) {
      navigate('/admin/dashboard', { replace: true });
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

      // After successful login, we need to wait for the auth state to update
      // and check if user has admin role
      toast.success('Checking admin access...');
      
      // Give time for auth state to update
      setTimeout(async () => {
        // We'll be redirected by the useEffect if user is admin
        // If not admin after a short delay, show error
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
      if (user.role === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard', { replace: true });
      } else if (isLoading) {
        toast.error('You do not have admin access');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <Logo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>Sign in to manage your restaurant</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Admin access requires the admin role to be assigned to your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
