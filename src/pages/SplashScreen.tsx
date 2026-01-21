import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-primary">
      {/* Logo */}
      <div className="mb-8 animate-bounce-in">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-card shadow-xl">
          <span className="text-4xl">🍗</span>
        </div>
      </div>
      
      {/* Brand name */}
      <h1 className="mb-2 text-3xl font-bold text-primary-foreground animate-fade-in">
        Kuku Ni Sisi
      </h1>
      <p className="mb-8 text-primary-foreground/80 animate-fade-in">
        Finger-lickin' good!
      </p>
      
      {/* Loading indicator */}
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <LoadingSpinner className="border-primary-foreground/30 border-t-primary-foreground" />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-primary-foreground/20">
          <div 
            className="h-full bg-primary-foreground transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
