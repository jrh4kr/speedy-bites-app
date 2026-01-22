import { TrendingUp, TrendingDown, Package, DollarSign, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { mockRevenueData } from '@/data/mockData';

export const AdminReportsPage = () => {
  const weeklyTotal = mockRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const weeklyOrders = mockRevenueData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <AdminLayout title="Reports & Analytics">
      {/* Period Selector */}
      <div className="flex justify-end mb-6">
        <Select defaultValue="week">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <PriceDisplay price={weeklyTotal} className="text-2xl font-bold" />
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{weeklyOrders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <PriceDisplay price={Math.round(weeklyTotal / weeklyOrders)} className="text-2xl font-bold" />
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">-3% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                <p className="text-2xl font-bold">28 min</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">-5 min from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-end gap-2">
            {mockRevenueData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">
                    <PriceDisplay price={day.revenue} />
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:from-primary hover:to-primary/80"
                    style={{ height: `${(day.revenue / 95000) * 200}px` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium">{day.day}</span>
                  <p className="text-xs text-muted-foreground">{day.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Items & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: '8-Piece Bucket', orders: 156, revenue: 187200 },
                { name: 'Family Feast', orders: 89, revenue: 222500 },
                { name: 'Spicy Zinger Burger', orders: 234, revenue: 128700 },
                { name: 'Crispy Wings (6pc)', orders: 178, revenue: 80100 },
                { name: '4-Piece Combo', orders: 145, revenue: 108750 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <PriceDisplay price={item.revenue} className="font-semibold" />
                    <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { metric: 'On-time Deliveries', value: '94%', trend: 'up' },
                { metric: 'Average Rating', value: '4.6/5', trend: 'up' },
                { metric: 'Canceled Orders', value: '2.3%', trend: 'down' },
                { metric: 'Repeat Customers', value: '67%', trend: 'up' },
                { metric: 'Peak Hour', value: '12-2 PM', trend: 'neutral' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span>{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.value}</span>
                    {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
