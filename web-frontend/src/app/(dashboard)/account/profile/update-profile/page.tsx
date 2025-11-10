'use client';

import React, { useEffect, useState } from 'react';

export default function UpdateProfilePage() {
    const [userData, setUserData] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        // Fetch user data from API or context
        const fetchUserData = async () => {
            // TODO: Implement getUserData API call
            // const data = await getUserData();
            // setUserData(data);

            // Temporary mock data
            setUserData({
                name: 'User',
                email: 'user@example.com'
            });
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Cập nhật thông tin</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                    Trang cập nhật thông tin đang được phát triển...
                </p>
                {/* TODO: Render form with userData */}
            </div>
        </div>
    );
}
