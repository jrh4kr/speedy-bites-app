import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    const timer = setTimeout(() => {
      const hasOnboarded = localStorage.getItem('kuku_onboarded');
      navigate(hasOnboarded ? '/' : '/onboarding', { replace: true });
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary via-primary to-primary-dark">
      {/* Logo */}
      <div className="mb-4 animate-bounce-in">
        <Logo size="xl" className="drop-shadow-2xl" />
      </div>
      
      {/* Tagline */}
      <p className="mb-8 text-lg font-semibold text-primary-foreground/90 animate-fade-in">
        Think Kuku! Think Sisi.
      </p>
      
      {/* Loading indicator */}
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="h-1 w-40 overflow-hidden rounded-full bg-primary-foreground/20">
          <div 
            className="h-full bg-primary-foreground transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-primary-foreground/70">Loading deliciousness...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
