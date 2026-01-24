import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Contexts
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages - Customer
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import MealDetailsPage from "./pages/MealDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ProfilePage from "./pages/ProfilePage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import SplashScreen from "./pages/SplashScreen";
import NotFound from "./pages/NotFound";

// Profile Sub-Pages
import EditProfilePage from "./pages/profile/EditProfilePage";
import AddressesPage from "./pages/profile/AddressesPage";
import PaymentsPage from "./pages/profile/PaymentsPage";
import NotificationsPage from "./pages/profile/NotificationsPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";

// Pages - Admin
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// Pages - Rider
import RiderLoginPage from "./pages/rider/RiderLoginPage";
import RiderDashboardPage from "./pages/rider/RiderDashboardPage";

// Layout
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
              <Routes>
                {/* Auth & Onboarding routes (no bottom nav) */}
                <Route path="/splash" element={<SplashScreen />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
                
                {/* Main app routes with bottom nav */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/menu/:id" element={<MealDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderTrackingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/edit" element={<EditProfilePage />} />
                  <Route path="/profile/addresses" element={<AddressesPage />} />
                  <Route path="/profile/payments" element={<PaymentsPage />} />
                  <Route path="/profile/notifications" element={<NotificationsPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                </Route>
                
                {/* Admin Routes - Single Dashboard */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                
                {/* Rider Routes */}
                <Route path="/rider/login" element={<RiderLoginPage />} />
                <Route path="/rider/dashboard" element={<RiderDashboardPage />} />
                <Route path="/rider" element={<RiderDashboardPage />} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
