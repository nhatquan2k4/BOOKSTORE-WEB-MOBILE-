"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type FAQCategory = "general" | "order" | "payment" | "shipping" | "return" | "account";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory;
}

const faqs: FAQ[] = [
  // General
  {
    id: 1,
    question: "BookStore là gì?",
    answer: "BookStore là nền tảng bán sách trực tuyến hàng đầu Việt Nam, cung cấp hàng triệu đầu sách từ nhiều thể loại khác nhau. Chúng tôi cam kết mang đến trải nghiệm mua sắm sách tốt nhất với giá cả hợp lý và dịch vụ chất lượng.",
    category: "general"
  },
  {
    id: 2,
    question: "Làm sao để tìm kiếm sách?",
    answer: "Bạn có thể sử dụng thanh tìm kiếm ở đầu trang, hoặc duyệt theo danh mục, tác giả, nhà xuất bản. Hệ thống tìm kiếm của chúng tôi hỗ trợ tìm theo tên sách, tác giả, ISBN, và từ khóa liên quan.",
    category: "general"
  },
  {
    id: 3,
    question: "Tôi có thể mua sách điện tử không?",
    answer: "Có, chúng tôi cung cấp cả sách giấy và sách điện tử (ebook). Sách điện tử có thể đọc ngay sau khi mua, không cần chờ giao hàng.",
    category: "general"
  },

  // Order
  {
    id: 4,
    question: "Làm thế nào để đặt hàng?",
    answer: "Chọn sách muốn mua → Thêm vào giỏ hàng → Xem giỏ hàng → Thanh toán → Điền thông tin giao hàng → Chọn phương thức thanh toán → Xác nhận đơn hàng.",
    category: "order"
  },
  {
    id: 5,
    question: "Tôi có thể hủy đơn hàng không?",
    answer: "Bạn có thể hủy đơn hàng miễn phí trước khi đơn hàng được xác nhận và đóng gói. Sau khi đã đóng gói, bạn cần liên hệ hotline để được hỗ trợ.",
    category: "order"
  },
  {
    id: 6,
    question: "Làm sao để theo dõi đơn hàng?",
    answer: "Vào Tài khoản → Đơn hàng của tôi → Chọn đơn hàng cần xem. Bạn sẽ thấy trạng thái chi tiết và mã vận đơn (nếu đã giao cho đơn vị vận chuyển).",
    category: "order"
  },

  // Payment
  {
    id: 7,
    question: "Có những hình thức thanh toán nào?",
    answer: "Chúng tôi chấp nhận: COD (thanh toán khi nhận hàng), chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ (Visa, Mastercard), ví điện tử (MoMo, ZaloPay, VNPay).",
    category: "payment"
  },
  {
    id: 8,
    question: "Thanh toán có an toàn không?",
    answer: "Hoàn toàn an toàn. Chúng tôi sử dụng mã hóa SSL và làm việc với các cổng thanh toán uy tín. Thông tin thẻ của bạn không được lưu trữ trên hệ thống của chúng tôi.",
    category: "payment"
  },
  {
    id: 9,
    question: "Tôi có nhận được hóa đơn không?",
    answer: "Có, bạn sẽ nhận được hóa đơn điện tử qua email sau khi đơn hàng được xác nhận. Nếu cần hóa đơn VAT, vui lòng ghi chú thông tin công ty khi đặt hàng.",
    category: "payment"
  },

  // Shipping
  {
    id: 10,
    question: "Phí vận chuyển là bao nhiêu?",
    answer: "Phí vận chuyển phụ thuộc vào trọng lượng và địa chỉ giao hàng. Miễn phí vận chuyển cho đơn hàng từ 300.000đ. Nội thành HCM/HN: 15.000-30.000đ. Tỉnh thành khác: 30.000-50.000đ.",
    category: "shipping"
  },
  {
    id: 11,
    question: "Bao lâu tôi nhận được hàng?",
    answer: "Nội thành HCM/HN: 1-2 ngày. Tỉnh thành khác: 3-7 ngày làm việc. Vùng sâu vùng xa có thể lâu hơn. Thời gian có thể thay đổi vào dịp lễ, tết.",
    category: "shipping"
  },
  {
    id: 12,
    question: "Giao hàng vào cuối tuần không?",
    answer: "Có, chúng tôi giao hàng cả thứ 7 và chủ nhật (trừ các ngày lễ lớn). Tuy nhiên, thời gian có thể lâu hơn một chút so với ngày thường.",
    category: "shipping"
  },

  // Return
  {
    id: 13,
    question: "Chính sách đổi trả như thế nào?",
    answer: "Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng, còn đầy đủ bao bì. Sách điện tử không được đổi trả sau khi đã tải về.",
    category: "return"
  },
  {
    id: 14,
    question: "Tôi nhận hàng bị lỗi thì sao?",
    answer: "Vui lòng chụp ảnh lỗi và liên hệ hotline trong vòng 48h. Chúng tôi sẽ đổi mới hoặc hoàn tiền 100%. Phí vận chuyển đổi trả do chúng tôi chịu.",
    category: "return"
  },
  {
    id: 15,
    question: "Hoàn tiền mất bao lâu?",
    answer: "Sau khi nhận và kiểm tra hàng hoàn trả, chúng tôi xử lý hoàn tiền trong 3-5 ngày làm việc. Tiền sẽ được hoàn về tài khoản/ví bạn đã thanh toán trong 7-14 ngày.",
    category: "return"
  },

  // Account
  {
    id: 16,
    question: "Làm sao để đăng ký tài khoản?",
    answer: "Click 'Đăng ký' ở góc trên bên phải → Điền thông tin → Xác nhận email. Hoặc đăng ký nhanh qua Google/Facebook.",
    category: "account"
  },
  {
    id: 17,
    question: "Quên mật khẩu thì làm sao?",
    answer: "Click 'Đăng nhập' → 'Quên mật khẩu' → Nhập email → Kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.",
    category: "account"
  },
  {
    id: 18,
    question: "Làm thế nào để thay đổi thông tin tài khoản?",
    answer: "Đăng nhập → Tài khoản → Thông tin cá nhân → Chỉnh sửa thông tin cần thay đổi → Lưu.",
    category: "account"
  }
];

const categories: { id: FAQCategory; name: string }[] = [
  { id: "general", name: "Chung" },
  { id: "order", name: "Đơn hàng" },
  { id: "payment", name: "Thanh toán" },
  { id: "shipping", name: "Vận chuyển" },
  { id: "return", name: "Đổi trả" },
  { id: "account", name: "Tài khoản" }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = faq.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Câu hỏi thường gặp</h1>
          <p className="text-lg opacity-90 mb-8">
            Tìm câu trả lời cho những thắc mắc của bạn
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">FAQ</span>
        </nav>

        <div className="max-w-6xl mx-auto">
          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  variant={selectedCategory === cat.id ? "primary" : "outline"}
                  size="md"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">Không tìm thấy câu hỏi phù hợp</p>
              </div>
            ) : (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-left">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                        openFAQ === faq.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-4 text-gray-600 border-t">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mt-12">
            <h2 className="text-2xl font-bold mb-3">Không tìm thấy câu trả lời?</h2>
            <p className="mb-6 opacity-90">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Liên hệ hỗ trợ
              </Link>
              <a
                href="tel:1900xxxx"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Gọi hotline
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
