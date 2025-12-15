import Link from "next/link";

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: "Mua sắm",
      links: [
        { name: "Trang chủ", url: "/" },
        { name: "Tất cả sách", url: "/books" },
        { name: "Sách mới", url: "/new-arrivals" },
        { name: "Bestsellers", url: "/bestsellers" },
        { name: "Sách trending", url: "/trending" },
        { name: "Sách nổi bật", url: "/featured" },
        { name: "Sách đọc nhiều nhất", url: "/most-read" },
        { name: "Khuyến mãi", url: "/promotions" },
        { name: "Thuê sách", url: "/rent" },
      ]
    },
    {
      title: "Danh mục",
      links: [
        { name: "Văn học", url: "/literature" },
        { name: "Kinh tế", url: "/economics" },
        { name: "Kỹ năng sống", url: "/life-skills" },
        { name: "Thiếu nhi", url: "/children" },
        { name: "Ngoại ngữ", url: "/foreign-languages" },
        { name: "Lập trình", url: "/programming" },
        { name: "Kinh doanh", url: "/business" },
        { name: "Thiết kế", url: "/design" },
      ]
    },
    {
      title: "Thông tin",
      links: [
        { name: "Tác giả", url: "/authors" },
        { name: "Nhà xuất bản", url: "/publishers" },
        { name: "Về chúng tôi", url: "/about" },
        { name: "Liên hệ", url: "/contact" },
      ]
    },
    {
      title: "Tài khoản",
      links: [
        { name: "Đăng nhập", url: "/login" },
        { name: "Đăng ký", url: "/register" },
        { name: "Thông tin cá nhân", url: "/account/profile" },
        { name: "Đơn hàng", url: "/account/orders" },
        { name: "Thư viện", url: "/account/library-book" },
        { name: "Thành tích", url: "/account/achievements" },
        { name: "Thông báo", url: "/account/notifications" },
      ]
    },
    {
      title: "Hỗ trợ khách hàng",
      links: [
        { name: "Câu hỏi thường gặp", url: "/faq" },
        { name: "Giao hàng & vận chuyển", url: "/help/shipping" },
        { name: "Chính sách đổi trả", url: "/help/returns" },
        { name: "Phương thức thanh toán", url: "/help/payment" },
        { name: "Chính sách bảo hành", url: "/help/warranty" },
      ]
    },
    {
      title: "Chính sách",
      links: [
        { name: "Điều khoản sử dụng", url: "/terms" },
        { name: "Chính sách bảo mật", url: "/privacy" },
        { name: "Chính sách Cookie", url: "/cookies" },
      ]
    },
    {
      title: "Về công ty",
      links: [
        { name: "Tuyển dụng", url: "/careers" },
        { name: "Đối tác", url: "/partners" },
        { name: "Chương trình Affiliate", url: "/affiliate" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Sơ đồ trang web</h1>
          <p className="text-lg opacity-90">
            Khám phá tất cả các trang trên BookStore
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Sơ đồ trang web</span>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitemapSections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-lg font-bold mb-4 text-blue-600 border-b-2 border-blue-600 pb-2">
                    {section.title}
                  </h2>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.url}
                          className="text-gray-700 hover:text-blue-600 hover:underline text-sm flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold mb-4">Trang hỗ trợ khác</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/sitemap" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Sơ đồ trang web
                </Link>
                <Link href="/accessibility" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Trợ năng
                </Link>
                <Link href="/cookies" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Chính sách Cookie
                </Link>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 p-6 rounded-lg text-center">
              <p className="text-gray-700 mb-4">
                Không tìm thấy trang bạn cần? Hãy liên hệ với chúng tôi để được hỗ trợ.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
