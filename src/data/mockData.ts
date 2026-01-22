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
    id: 'chicken',
    name: 'Fried Chicken',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
    itemCount: 12,
  },
  {
    id: 'burgers',
    name: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    itemCount: 8,
  },
  {
    id: 'sides',
    name: 'Sides',
    image: 'https://images.unsplash.com/photo-1630384060421-cb20aff8c59d?w=400&q=80',
    itemCount: 10,
  },
  {
    id: 'drinks',
    name: 'Drinks',
    image: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&q=80',
    itemCount: 15,
  },
  {
    id: 'combos',
    name: 'Combo Meals',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    itemCount: 6,
  },
  {
    id: 'desserts',
    name: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',
    itemCount: 8,
  },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: '8-Piece Bucket',
    description: 'Crispy fried chicken bucket with 8 pieces of our signature recipe',
    price: 1200,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
    category: 'Fried Chicken',
    categoryId: 'chicken',
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Spicy Zinger Burger',
    description: 'Crispy chicken fillet with spicy mayo, lettuce and cheese',
    price: 550,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    category: 'Burgers',
    categoryId: 'burgers',
    isAvailable: true,
    isFeatured: true,
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Crispy Wings (6pc)',
    description: 'Golden crispy chicken wings with your choice of sauce',
    price: 450,
    image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80',
    category: 'Fried Chicken',
    categoryId: 'chicken',
    isAvailable: true,
    rating: 4.5,
  },
  {
    id: '4',
    name: 'Loaded Fries',
    description: 'Crispy fries topped with cheese sauce, bacon bits and spring onions',
    price: 350,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20aff8c59d?w=400&q=80',
    category: 'Sides',
    categoryId: 'sides',
    isAvailable: true,
    rating: 4.4,
  },
  {
    id: '5',
    name: 'Classic Chicken Burger',
    description: 'Tender chicken breast fillet with fresh lettuce and mayo',
    price: 450,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
    category: 'Burgers',
    categoryId: 'burgers',
    isAvailable: true,
    rating: 4.3,
  },
  {
    id: '6',
    name: 'Family Feast',
    description: '12-piece bucket, 4 fries, coleslaw, 4 drinks - feeds the whole family!',
    price: 2500,
    originalPrice: 3000,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    category: 'Combo Meals',
    categoryId: 'combos',
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
  },
  {
    id: '7',
    name: 'Chocolate Sundae',
    description: 'Creamy vanilla ice cream with rich chocolate sauce',
    price: 200,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',
    category: 'Desserts',
    categoryId: 'desserts',
    isAvailable: true,
    rating: 4.2,
  },
  {
    id: '8',
    name: 'Cold Soda (500ml)',
    description: 'Refreshing ice-cold soda - Coke, Fanta, or Sprite',
    price: 100,
    image: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&q=80',
    category: 'Drinks',
    categoryId: 'drinks',
    isAvailable: true,
    rating: 4.0,
  },
  {
    id: '9',
    name: 'Coleslaw',
    description: 'Fresh and creamy coleslaw made daily',
    price: 150,
    image: 'https://images.unsplash.com/photo-1625938145312-89fa8643fb2e?w=400&q=80',
    category: 'Sides',
    categoryId: 'sides',
    isAvailable: true,
    rating: 4.1,
  },
  {
    id: '10',
    name: '4-Piece Combo',
    description: '4 pieces of chicken, regular fries and a drink',
    price: 750,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80',
    category: 'Combo Meals',
    categoryId: 'combos',
    isAvailable: false,
    rating: 4.7,
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'KNS-2024-001',
    status: 'delivered',
    items: [
      {
        id: '1',
        menuItem: mockMenuItems[0],
        quantity: 1,
        totalPrice: 1200,
      },
      {
        id: '2',
        menuItem: mockMenuItems[3],
        quantity: 2,
        totalPrice: 700,
      },
    ],
    subtotal: 1900,
    deliveryFee: 150,
    discount: 0,
    total: 2050,
    address: {
      street: '123 Kenyatta Avenue',
      city: 'Nairobi',
      landmark: 'Near KICC',
    },
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'KNS-2024-002',
    status: 'on_the_way',
    items: [
      {
        id: '1',
        menuItem: mockMenuItems[1],
        quantity: 2,
        totalPrice: 1100,
      },
    ],
    subtotal: 1100,
    deliveryFee: 150,
    discount: 110,
    total: 1140,
    address: {
      street: '456 Moi Avenue',
      city: 'Nairobi',
    },
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    createdAt: '2024-01-20T12:00:00Z',
    estimatedDelivery: '25-35 mins',
    driver: {
      name: 'John M.',
      phone: '+254 712 345 678',
    },
  },
  {
    id: 'ord-003',
    orderNumber: 'KNS-2024-003',
    status: 'preparing',
    items: [
      {
        id: '1',
        menuItem: mockMenuItems[5],
        quantity: 1,
        totalPrice: 2500,
      },
    ],
    subtotal: 2500,
    deliveryFee: 0,
    discount: 250,
    total: 2250,
    address: {
      street: '789 Ngong Road',
      city: 'Nairobi',
      landmark: 'Opposite Junction Mall',
    },
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    createdAt: '2024-01-20T11:30:00Z',
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
    title: 'Bucket Special!',
    subtitle: 'Get 20% off on all buckets this week',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
    link: '/menu?category=chicken',
  },
  {
    title: 'Family Feast Deal',
    subtitle: 'Feed the whole family for less',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    link: '/menu?category=combos',
  },
  {
    title: 'Free Delivery',
    subtitle: 'On orders above KES 1500',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    link: '/menu',
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
      { name: '8-Piece Bucket', quantity: 1 },
      { name: 'Loaded Fries', quantity: 2 },
    ],
    total: 1900,
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
      { name: 'Family Feast', quantity: 1 },
    ],
    total: 2500,
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
