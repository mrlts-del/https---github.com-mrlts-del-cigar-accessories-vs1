import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardMetrics, getMonthlySales, getRecentOrders } from '@/actions/admin'; // Import actions
import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { SalesChart } from '@/components/admin/sales-chart';
import { RecentOrders } from '@/components/admin/recent-orders'; // Import recent orders component

export default async function AdminDashboardPage() {
  // Fetch dashboard data in parallel
  const [metrics, monthlySales, recentOrders] = await Promise.all([
    getDashboardMetrics(),
    getMonthlySales(),
    getRecentOrders(), // Fetch recent orders
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
             <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Sales Overview (Last 12 Months)</CardTitle>
           </CardHeader>
           <CardContent className="pl-2">
             <SalesChart data={monthlySales} />
           </CardContent>
         </Card>
          <Card>
           <CardHeader>
             <CardTitle>Recent Orders</CardTitle>
           </CardHeader>
           <CardContent> {/* Removed fixed height */}
             <RecentOrders orders={recentOrders} /> {/* Render recent orders */}
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
