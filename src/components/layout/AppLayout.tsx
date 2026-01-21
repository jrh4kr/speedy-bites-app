import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Outlet />
      <BottomNav />
    </div>
  );
};
