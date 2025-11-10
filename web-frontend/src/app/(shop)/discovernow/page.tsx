"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function DiscoverNowPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">Khám phá ngay</h1>
                <p className="text-gray-600 mb-8">
                    Trang khám phá sách mới đang được phát triển. Vui lòng quay lại sau!
                </p>

                <div className="space-y-4">
                    <Link href="/books">
                        <Button className="w-full sm:w-auto">
                            Xem tất cả sách
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button variant="outline" className="w-full sm:w-auto ml-0 sm:ml-4">
                            Về trang chủ
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
