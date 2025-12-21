import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';

interface RevenueData {
    totalRevenue: number;
    previousPeriodRevenue: number;
    percentageChange: number;
    revenueByDay: Array<{
        date: string;
        revenue: number;
    }>;
}

interface TopSellingBook {
    bookId: string;
    bookTitle: string;
    totalQuantitySold: number;
    totalRevenue: number;
    imageUrl?: string;
}

interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    percentageChange: number;
}

interface DashboardStats {
    totalBooks: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    booksPercentageChange: number;
    usersPercentageChange: number;
    ordersPercentageChange: number;
    revenuePercentageChange: number;
}

class DashboardService {
    async getRevenue(from?: Date, to?: Date) {
        const params: any = {};
        if (from) params.from = from.toISOString();
        if (to) params.to = to.toISOString();
        
        const response = await apiClient.get<RevenueData>(
            API_ENDPOINTS.DASHBOARD.REVENUE, 
            { params }
        );
        return response.data;
    }

    async getTopSellingBooks(from?: Date, to?: Date, top: number = 10) {
        const params: any = { top };
        if (from) params.from = from.toISOString();
        if (to) params.to = to.toISOString();
        
        const response = await apiClient.get<TopSellingBook[]>(
            API_ENDPOINTS.DASHBOARD.TOP_SELLING_BOOKS,
            { params }
        );
        return response.data;
    }

    async getOrderStats(from?: Date, to?: Date) {
        const params: any = {};
        if (from) params.from = from.toISOString();
        if (to) params.to = to.toISOString();
        
        const response = await apiClient.get<OrderStats>(
            API_ENDPOINTS.DASHBOARD.ORDER_STATS,
            { params }
        );
        return response.data;
    }

    async getBooksCount() {
        try {
            const response = await apiClient.get<{ total: number; totalCount: number }>(
                API_ENDPOINTS.BOOK.LIST,
                { params: { pageSize: 1 } }
            );
            return response.data?.totalCount || response.data?.total || 0;
        } catch (error) {
            console.error('Error fetching books count:', error);
            return 0;
        }
    }

    async getUsersCount() {
        try {
            const response = await apiClient.get<{ totalCount: number; total: number }>(
                API_ENDPOINTS.USERS.PAGED,
                { params: { pageSize: 1 } }
            );
            return response.data?.totalCount || response.data?.total || 0;
        } catch (error) {
            console.error('Error fetching users count:', error);
            return 0;
        }
    }

    async getStats() {
        // This would combine multiple API calls to get overall stats
        const [orderStats, revenue, booksCount, usersCount] = await Promise.allSettled([
            this.getOrderStats(),
            this.getRevenue(),
            this.getBooksCount(),
            this.getUsersCount(),
        ]);

        return {
            totalBooks: booksCount.status === 'fulfilled' ? booksCount.value : 0,
            totalUsers: usersCount.status === 'fulfilled' ? usersCount.value : 0,
            totalOrders: orderStats.status === 'fulfilled' ? orderStats.value?.totalOrders || 0 : 0,
            totalRevenue: revenue.status === 'fulfilled' ? revenue.value?.totalRevenue || 0 : 0,
            ordersPercentageChange: orderStats.status === 'fulfilled' ? orderStats.value?.percentageChange || 0 : 0,
            revenuePercentageChange: revenue.status === 'fulfilled' ? revenue.value?.percentageChange || 0 : 0,
        };
    }
}

export default new DashboardService();
