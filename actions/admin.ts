'use server';

import { db } from '@/lib/db';
import { OrderStatus, Role } from '@prisma/client';
import { getCurrentUserId } from '@/lib/auth-utils'; // To ensure only admin calls this

// Helper function to check admin role (could be moved to auth-utils)
async function isAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === Role.ADMIN;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

/**
 * Fetches key metrics for the admin dashboard.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!(await isAdmin())) {
    console.warn('Non-admin user attempted to fetch dashboard metrics.');
    return { totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 };
  }
  try {
    const revenueData = await db.order.aggregate({
      _sum: { total: true },
      where: { status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
    });
    const [orderCount, userCount, productCount] = await Promise.all([
      db.order.count(),
      db.user.count(),
      db.product.count(),
    ]);
    return {
      totalRevenue: revenueData._sum.total ?? 0,
      totalOrders: orderCount,
      totalUsers: userCount,
      totalProducts: productCount,
    };
  } catch (error) {
    console.error('Database Error: Failed to fetch dashboard metrics.', error);
    return { totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0 };
  }
}

interface MonthlySalesData {
  month: string;
  totalSales: number;
}

/**
 * Fetches monthly sales data for the last 12 months.
 */
export async function getMonthlySales(): Promise<MonthlySalesData[]> {
   if (!(await isAdmin())) {
    console.warn('Non-admin user attempted to fetch monthly sales.');
    return [];
  }
  try {
    const monthlySales = await db.$queryRaw<Array<{ month_numeric: number, year: number, total: number }>>`
      SELECT EXTRACT(MONTH FROM "createdAt") as month_numeric, EXTRACT(YEAR FROM "createdAt") as year, SUM(total) as total
      FROM "Order"
      WHERE status IN ('PROCESSING', 'SHIPPED', 'DELIVERED') AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY year, month_numeric ORDER BY year ASC, month_numeric ASC;
    `;
    const formattedData: MonthlySalesData[] = monthlySales.map(sale => {
       const monthName = new Date(sale.year, sale.month_numeric - 1).toLocaleString('default', { month: 'short' });
       return { month: `${monthName} ${sale.year.toString().slice(-2)}`, totalSales: sale.total };
    });
    const last12Months: MonthlySalesData[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const monthNumeric = date.getMonth() + 1;
        const monthName = date.toLocaleString('default', { month: 'short' });
        const monthYearKey = `${monthName} ${year.toString().slice(-2)}`;
        const existingData = formattedData.find(d => d.month === monthYearKey);
        last12Months.push({ month: monthYearKey, totalSales: existingData ? existingData.totalSales : 0 });
    }
    return last12Months;
  } catch (error) {
     console.error('Database Error: Failed to fetch monthly sales data.', error);
     return [];
  }
}

// Define type for recent order data needed on dashboard
export type RecentOrder = {
  id: string;
  total: number;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
};

/**
 * Fetches a specified number of recent orders for the admin dashboard.
 */
export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
   if (!(await isAdmin())) {
     console.warn('Non-admin user attempted to fetch recent orders.');
     return [];
   }
   try {
      const orders = await db.order.findMany({
         take: limit,
         orderBy: { createdAt: 'desc' },
         select: {
            id: true,
            total: true,
            createdAt: true,
            user: {
               select: { name: true, email: true },
            },
         },
      });
      return orders;
   } catch (error) {
      console.error('Database Error: Failed to fetch recent orders.', error);
      return [];
   }
}
