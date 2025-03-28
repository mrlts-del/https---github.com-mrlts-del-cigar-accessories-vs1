import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// TODO: Import Recharts components
// TODO: Import server actions to fetch dashboard data

export default async function AdminDashboardPage() {
  // TODO: Fetch dashboard data (e.g., total revenue, orders, users)
  const totalRevenue = 0; // Placeholder
  const totalOrders = 0; // Placeholder
  const totalUsers = 0; // Placeholder
  const totalProducts = 0; // Placeholder

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            {/* TODO: Add Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
             {/* TODO: Add Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
             {/* <p className="text-xs text-muted-foreground">+10% from last month</p> */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
             {/* TODO: Add Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
             {/* <p className="text-xs text-muted-foreground">+50 since last hour</p> */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
             {/* TODO: Add Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
             {/* <p className="text-xs text-muted-foreground">Active products</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Sales Overview</CardTitle>
           </CardHeader>
           <CardContent className="h-[350px]">
             {/* TODO: Implement Recharts Sales Chart */}
             <p className="text-center text-muted-foreground">(Sales chart placeholder)</p>
           </CardContent>
         </Card>
          <Card>
           <CardHeader>
             <CardTitle>Recent Orders</CardTitle>
           </CardHeader>
           <CardContent className="h-[350px]">
             {/* TODO: Implement Recent Orders List/Table */}
             <p className="text-center text-muted-foreground">(Recent orders placeholder)</p>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
