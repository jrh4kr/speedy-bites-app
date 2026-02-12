import type { Category, MenuItem, Order, Promo } from '@/lib/api';

// ============= ADMIN & RIDER MOCK DATA =============

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'rider' | 'customer';
  phone?: string;
  avatar?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  currentOrder?: string;
  completedToday: number;
  rating: number;
  avatar?: string;
}

export interface AdminOrder extends Order {
  rider?: Rider;
  customerName: string;
  customerPhone: string;
}

// Test accounts
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-001',
    email: 'admin@kukunisisi.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+254 700 000 001',
  },
  {
    id: 'rider-001',
    email: 'rider@kukunisisi.com',
    name: 'John Rider',
    role: 'rider',
    phone: '+254 712 345 678',
  },
];

export const mockRiders: Rider[] = [
  {
    id: 'rider-001',
    name: 'John M.',
    phone: '+254 712 345 678',
    email: 'john.rider@kukunisisi.com',
    status: 'busy',
    currentOrder: 'ord-002',
    completedToday: 5,
    rating: 4.8,
  },
  {
    id: 'rider-002',
    name: 'Peter K.',
    phone: '+254 722 111 222',
    email: 'peter.rider@kukunisisi.com',
    status: 'available',
    completedToday: 3,
    rating: 4.5,
  },
  {
    id: 'rider-003',
    name: 'Mary W.',
    phone: '+254 733 333 444',
    email: 'mary.rider@kukunisisi.com',
    status: 'offline',
    completedToday: 0,
    rating: 4.9,
  },
];

// Dashboard stats
export const mockDashboardStats = {
  todayOrders: 47,
  todayRevenue: 89500,
  pendingOrders: 12,
  activeRiders: 5,
  avgDeliveryTime: '28 mins',
  customerSatisfaction: 4.6,
};

export const mockRevenueData = [
  { day: 'Mon', revenue: 45000, orders: 23 },
  { day: 'Tue', revenue: 52000, orders: 28 },
  { day: 'Wed', revenue: 48000, orders: 25 },
  { day: 'Thu', revenue: 61000, orders: 32 },
  { day: 'Fri', revenue: 78000, orders: 41 },
  { day: 'Sat', revenue: 95000, orders: 52 },
  { day: 'Sun', revenue: 89500, orders: 47 },
];

// ============= CUSTOMER MOCK DATA =============

export const mockCategories: Category[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    itemCount: 11,
  },
  {
    id: 'butchery',
    name: 'Butchery',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
    itemCount: 13,
  },
  {
    id: 'groceries',
    name: 'Groceries',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    itemCount: 2,
  },
  {
    id: 'platters',
    name: 'Platters',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    itemCount: 8,
  },
];

export const mockMenuItems: MenuItem[] = [
  // Restaurant
  { id: '1', name: 'Chapati Chicken', description: 'Chapati served with chicken', price: 300, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, isFeatured: true, rating: 4.8 },
  { id: '2', name: 'Veg Rice and Chicken', description: 'Vegetable rice served with chicken', price: 100, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.5 },
  { id: '3', name: 'Pilau & Chicken', description: 'Pilau rice served with chicken', price: 380, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, isFeatured: true, rating: 4.7 },
  { id: '4', name: 'Ugali & Wet Fry Chicken', description: 'Ugali served with wet fry chicken', price: 230, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.6 },
  { id: '5', name: 'Ugali & Greens', description: 'Ugali served with greens', price: 100, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.3 },
  { id: '6', name: 'Pilau', description: 'Pilau rice', price: 200, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.4 },
  { id: '7', name: 'Beef Wet Fry', description: 'Beef wet fry', price: 200, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.5 },
  { id: '8', name: 'Bhajia', description: 'Crispy bhajia', price: 150, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.2 },
  { id: '9', name: 'Choma Special', description: 'Nyama choma special', price: 320, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, isFeatured: true, rating: 4.9 },
  { id: '10', name: 'Chapo', description: 'Chapati', price: 30, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, rating: 4.0 },
  { id: '11', name: 'Chips and Chicken', description: 'Chips served with chicken', price: 370, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80', category: 'Restaurant', categoryId: 'restaurant', isAvailable: true, isFeatured: true, rating: 4.6 },
  // Butchery
  { id: '12', name: 'Chicken Skins', description: 'Fresh chicken skins - per kg', price: 250, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.3 },
  { id: '13', name: 'Sausages', description: 'Fresh sausages - per kg', price: 720, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, isFeatured: true, rating: 4.5 },
  { id: '14', name: 'Smokies', description: 'Smokies - per kg', price: 580, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.4 },
  { id: '15', name: 'Tray of Eggs', description: 'Full tray of eggs', price: 450, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.6 },
  { id: '16', name: 'Gizzards', description: 'Chicken gizzards - per kg', price: 600, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.3 },
  { id: '17', name: 'Chicken Liver', description: 'Fresh chicken liver - per kg', price: 400, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.2 },
  { id: '18', name: 'Wings', description: 'Chicken wings - per kg', price: 580, image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, isFeatured: true, rating: 4.7 },
  { id: '19', name: 'Drumsticks', description: 'Chicken drumsticks - per kg', price: 700, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, isFeatured: true, rating: 4.8 },
  { id: '20', name: 'Thighs', description: 'Chicken thighs - per kg', price: 600, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.5 },
  { id: '21', name: 'Breast', description: 'Chicken breast - per kg', price: 650, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.6 },
  { id: '22', name: 'Broiler', description: 'Whole broiler chicken - per kg', price: 580, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.4 },
  { id: '23', name: 'Chicken Necks', description: 'Chicken necks - per kg', price: 350, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.1 },
  { id: '24', name: 'Chicken Heads & Feet', description: 'Chicken heads and feet - per kg', price: 150, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80', category: 'Butchery', categoryId: 'butchery', isAvailable: true, rating: 4.0 },
  // Groceries
  { id: '25', name: 'Onions', description: 'Fresh onions - per kg', price: 100, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80', category: 'Groceries', categoryId: 'groceries', isAvailable: true, rating: 4.3 },
  { id: '26', name: 'Tomatoes', description: 'Fresh tomatoes - per kg', price: 120, image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&q=80', category: 'Groceries', categoryId: 'groceries', isAvailable: true, rating: 4.4 },
  // Platters
  { id: '27', name: 'Jambo Sinia', description: 'Jambo sinia platter', price: 1200, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, isFeatured: true, rating: 4.9 },
  { id: '28', name: 'Wandegeya (UG) Sinia', description: 'Wandegeya Ugandan style sinia platter', price: 1500, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, isFeatured: true, rating: 4.8 },
  { id: '29', name: 'Bahati Sinia', description: 'Bahati sinia platter', price: 1000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, rating: 4.7 },
  { id: '30', name: 'Kiddies Sinia', description: 'Kiddies sinia platter', price: 1000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, rating: 4.5 },
  { id: '31', name: 'Jambo-Jambo Sinia', description: 'Jambo-jambo sinia platter', price: 1500, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, isFeatured: true, rating: 4.8 },
  { id: '32', name: 'Snackies Platter', description: 'Snackies platter', price: 1200, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, rating: 4.6 },
  { id: '33', name: 'Garden of Eden Platter', description: 'Garden of Eden platter', price: 1500, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, isFeatured: true, rating: 4.9 },
  { id: '34', name: 'Karimis Sinia', description: 'Karimis sinia platter', price: 1300, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', category: 'Platters', categoryId: 'platters', isAvailable: true, rating: 4.7 },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'KNS-2024-001',
    status: 'delivered',
    items: [
      { id: '1', menuItem: mockMenuItems[0], quantity: 2, totalPrice: 600 },
      { id: '2', menuItem: mockMenuItems[2], quantity: 1, totalPrice: 380 },
    ],
    subtotal: 980, deliveryFee: 150, discount: 0, total: 1130,
    address: { street: '123 Kenyatta Avenue', city: 'Nairobi', landmark: 'Near KICC' },
    paymentMethod: 'mpesa', paymentStatus: 'paid', createdAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'KNS-2024-002',
    status: 'on_the_way',
    items: [
      { id: '1', menuItem: mockMenuItems[8], quantity: 1, totalPrice: 320 },
    ],
    subtotal: 320, deliveryFee: 150, discount: 0, total: 470,
    address: { street: '456 Moi Avenue', city: 'Nairobi' },
    paymentMethod: 'cash', paymentStatus: 'pending', createdAt: '2024-01-20T12:00:00Z',
    estimatedDelivery: '25-35 mins',
    driver: { name: 'John M.', phone: '+254 712 345 678' },
  },
  {
    id: 'ord-003',
    orderNumber: 'KNS-2024-003',
    status: 'preparing',
    items: [
      { id: '1', menuItem: mockMenuItems[10], quantity: 2, totalPrice: 740 },
    ],
    subtotal: 740, deliveryFee: 0, discount: 0, total: 740,
    address: { street: '789 Ngong Road', city: 'Nairobi', landmark: 'Opposite Junction Mall' },
    paymentMethod: 'mpesa', paymentStatus: 'paid', createdAt: '2024-01-20T11:30:00Z',
    estimatedDelivery: '40-50 mins',
  },
];

export const mockAdminOrders: AdminOrder[] = mockOrders.map(order => ({
  ...order,
  customerName: 'Customer ' + order.id.slice(-3),
  customerPhone: '+254 7XX XXX XXX',
  rider: order.status === 'on_the_way' ? mockRiders[0] : undefined,
}));

export const mockPromos: Promo[] = [
  {
    id: 'promo-1',
    code: 'KUKU20',
    description: '20% off on orders above KES 1000',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 1000,
    expiresAt: '2024-12-31T23:59:59Z',
  },
  {
    id: 'promo-2',
    code: 'FREEDELIVERY',
    description: 'Free delivery on your next order',
    discountType: 'fixed',
    discountValue: 150,
    expiresAt: '2024-06-30T23:59:59Z',
  },
];

export const promoBanners = [
  {
    title: 'Restaurant Specials!',
    subtitle: 'Try our Choma Special & Pilau Chicken',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    link: '/menu?category=restaurant',
  },
  {
    title: 'Fresh from the Butchery',
    subtitle: 'Quality chicken cuts at great prices',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
    link: '/menu?category=butchery',
  },
  {
    title: 'Platters & Sinias',
    subtitle: 'Share the feast with our premium platters',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
    link: '/menu?category=platters',
  },
  {
    title: 'Fresh Groceries',
    subtitle: 'Farm-fresh produce delivered to you',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    link: '/menu?category=groceries',
  },
];

// Rider-specific orders
export const mockRiderOrders = [
  {
    id: 'ord-004',
    orderNumber: 'KNS-2024-004',
    status: 'ready_for_pickup',
    customerName: 'Alice K.',
    customerPhone: '+254 722 888 999',
    items: [
      { name: 'Chapati Chicken', quantity: 2 },
      { name: 'Pilau & Chicken', quantity: 1 },
    ],
    total: 980,
    address: {
      street: '45 Waiyaki Way',
      city: 'Westlands, Nairobi',
      landmark: 'Behind Sarit Centre',
    },
    distance: '3.2 km',
    estimatedTime: '15 mins',
  },
  {
    id: 'ord-005',
    orderNumber: 'KNS-2024-005',
    status: 'ready_for_pickup',
    customerName: 'Bob M.',
    customerPhone: '+254 733 111 222',
    items: [
      { name: 'Choma Special', quantity: 2 },
    ],
    total: 640,
    address: {
      street: '78 Langata Road',
      city: 'Langata, Nairobi',
    },
    distance: '5.8 km',
    estimatedTime: '25 mins',
  },
];

export const mockDeliveryHistory = [
  {
    id: 'del-001',
    orderNumber: 'KNS-2024-098',
    customerName: 'Jane D.',
    total: 1450,
    deliveredAt: '2024-01-20T10:30:00Z',
    rating: 5,
    tip: 100,
  },
  {
    id: 'del-002',
    orderNumber: 'KNS-2024-095',
    customerName: 'Mike S.',
    total: 850,
    deliveredAt: '2024-01-20T09:15:00Z',
    rating: 4,
    tip: 50,
  },
  {
    id: 'del-003',
    orderNumber: 'KNS-2024-091',
    customerName: 'Sarah W.',
    total: 2200,
    deliveredAt: '2024-01-19T18:45:00Z',
    rating: 5,
    tip: 150,
  },
];
