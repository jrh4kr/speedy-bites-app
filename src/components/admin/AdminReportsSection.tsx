import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { mockRevenueData, mockDashboardStats } from '@/data/mockData';

export const AdminReportsSection = () => {
  const totalRevenue = mockRevenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = mockRevenueData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Weekly Revenue</p>
            <PriceDisplay price={totalRevenue} className="text-xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
            <PriceDisplay price={avgOrderValue} className="text-xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Customer Rating</p>
            <p className="text-xl font-bold">⭐ {mockDashboardStats.customerSatisfaction}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-end gap-3">
            {mockRevenueData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-muted-foreground mb-1">
                  <PriceDisplay price={day.revenue} className="text-xs" />
                </div>
                <div 
                  className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                  style={{ height: `${(day.revenue / 95000) * 180}px` }}
                />
                <span className="text-sm font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-3">
            {mockRevenueData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">{day.orders}</div>
                <div 
                  className="w-full bg-secondary rounded-t-lg transition-all hover:bg-secondary/80"
                  style={{ height: `${(day.orders / 52) * 120}px` }}
                />
                <span className="text-sm font-medium">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Items Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: '8-Piece Bucket', sales: 156, revenue: 187200 },
              { name: 'Family Feast', sales: 89, revenue: 222500 },
              { name: 'Spicy Zinger Burger', sales: 234, revenue: 128700 },
              { name: 'Crispy Wings (6pc)', sales: 178, revenue: 80100 },
              { name: 'Loaded Fries', sales: 145, revenue: 50750 },
            ].map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sales} orders</p>
                  </div>
                </div>
                <PriceDisplay price={item.revenue} className="font-semibold" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
