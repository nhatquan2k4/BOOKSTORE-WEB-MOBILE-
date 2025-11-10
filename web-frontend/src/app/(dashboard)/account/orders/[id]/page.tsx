"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;
    const [loading, setLoading] = useState(true); useEffect(() => {
        // TODO: Fetch order details
        setLoading(false);
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{orderId}</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                    Trang chi tiết đơn hàng đang được phát triển...
                </p>
            </div>
        </div>
    );
}
