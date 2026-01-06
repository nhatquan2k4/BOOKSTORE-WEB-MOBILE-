"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { couponService, type CouponDto } from "@/services/coupon.service";

export default function PromotionsPage() {
  const [tab, setTab] = useState<"all" | "voucher">("all");
  const [publicCoupons, setPublicCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const coupons = await couponService.getPublicCoupons();
        const normalized = Array.isArray(coupons)
          ? coupons
          : Array.isArray((coupons as any)?.data)
            ? (coupons as any).data
            : [];
        setPublicCoupons(normalized);
      } catch (e: any) {
        setError(e?.message || "Không thể tải mã giảm giá");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 mt-17">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link> / <span className="font-medium text-gray-800">Khuyến mãi</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Chương Trình Khuyến Mãi</h1>
          <p className="text-gray-600 text-lg">Các mã khuyến mãi đang có hiệu lực</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Button variant={tab === "all" ? "primary" : "secondary"} onClick={() => setTab("all")} className="rounded-full">Tất cả</Button>
          <Button variant={tab === "voucher" ? "primary" : "secondary"} onClick={() => setTab("voucher")} className="rounded-full">Mã Giảm Giá</Button>
        </div>

        {(tab === "all" || tab === "voucher") && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Mã giảm giá hiện có</h2>
            {loading && <p className="text-gray-600">Đang tải mã giảm giá...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && Array.isArray(publicCoupons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publicCoupons.map((c) => (
                  <Card key={c.id} className="border border-dashed">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="success">Mã Giảm Giá</Badge>
                          <span className="text-sm text-gray-500">HSD: {new Date(c.expiration).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <h3 className="text-xl font-semibold">{c.code}</h3>
                        <p className="text-gray-700">{c.isPercentage ? `Giảm ${c.value}%` : `Giảm ${c.value.toLocaleString("vi-VN")}₫`}</p>
                        {c.description && <p className="text-gray-500 mt-1">{c.description}</p>}
                      </div>
                      <Button variant="primary" className="shrink-0" onClick={() => navigator.clipboard?.writeText(c.code)}>Sao chép mã</Button>
                    </CardContent>
                  </Card>
                ))}
                {publicCoupons.length === 0 && (
                  <p className="text-gray-600">Hiện chưa có mã giảm giá công khai.</p>
                )}
              </div>
            )}
            {!loading && !error && !Array.isArray(publicCoupons) && (
              <p className="text-gray-600">Dữ liệu mã giảm giá không đúng định dạng.</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
