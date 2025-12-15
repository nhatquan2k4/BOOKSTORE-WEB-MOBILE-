import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Chính sách Cookie</h1>
          <p className="text-lg opacity-90">
            Cách chúng tôi sử dụng cookies và công nghệ tương tự
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Chính sách Cookie</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mb-8">
                <p className="text-amber-900 text-sm">
                  <strong>Cập nhật lần cuối:</strong> 01/12/2025<br/>
                  Chính sách này giải thích cách BookStore sử dụng cookies và các công nghệ theo dõi tương tự.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4">1. Cookie là gì?</h2>
              <p className="text-gray-700 mb-6">
                Cookie là những tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn (máy tính, điện thoại, tablet) 
                khi bạn truy cập website. Chúng giúp website ghi nhớ thông tin về chuyến thăm của bạn, 
                như ngôn ngữ ưa thích, giỏ hàng, và các tùy chọn khác, giúp trải nghiệm của bạn dễ dàng 
                và website hữu ích hơn.
              </p>

              <h2 className="text-2xl font-bold mb-4">2. Tại sao chúng tôi sử dụng cookies?</h2>
              <div className="text-gray-700 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Chức năng thiết yếu:</strong> Đăng nhập, giỏ hàng, thanh toán</li>
                  <li><strong>Cải thiện hiệu suất:</strong> Theo dõi tốc độ tải trang, lỗi kỹ thuật</li>
                  <li><strong>Cá nhân hóa:</strong> Ghi nhớ sở thích, đề xuất sản phẩm phù hợp</li>
                  <li><strong>Phân tích:</strong> Hiểu cách người dùng sử dụng website</li>
                  <li><strong>Quảng cáo:</strong> Hiển thị quảng cáo phù hợp với sở thích</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">3. Các loại cookies chúng tôi sử dụng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-blue-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Cookies thiết yếu (Bắt buộc)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Cookies cần thiết để website hoạt động. Không thể tắt.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li><strong>session_id:</strong> Duy trì phiên đăng nhập (Session, 2 giờ)</li>
                    <li><strong>cart_items:</strong> Lưu giỏ hàng (7 ngày)</li>
                    <li><strong>csrf_token:</strong> Bảo mật form (Session)</li>
                    <li><strong>language:</strong> Ngôn ngữ ưa thích (1 năm)</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-green-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Cookies phân tích
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Giúp chúng tôi hiểu cách người dùng tương tác với website.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li><strong>_ga, _gid:</strong> Google Analytics (2 năm, 24 giờ)</li>
                    <li><strong>_fbp:</strong> Facebook Pixel (3 tháng)</li>
                    <li><strong>analytics_session:</strong> Phân tích nội bộ (30 ngày)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-purple-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cookies marketing
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Theo dõi hoạt động để hiển thị quảng cáo phù hợp.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li><strong>_gcl_au:</strong> Google Ads (3 tháng)</li>
                    <li><strong>fr:</strong> Facebook retargeting (3 tháng)</li>
                    <li><strong>ads_prefs:</strong> Tùy chọn quảng cáo (1 năm)</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-orange-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Cookies cá nhân hóa
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Ghi nhớ tùy chọn và cải thiện trải nghiệm.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li><strong>user_preferences:</strong> Tùy chỉnh giao diện (1 năm)</li>
                    <li><strong>recently_viewed:</strong> Sản phẩm đã xem (30 ngày)</li>
                    <li><strong>wishlist:</strong> Danh sách yêu thích (1 năm)</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">4. Cookies bên thứ ba</h2>
              <p className="text-gray-700 mb-4">
                Chúng tôi sử dụng các dịch vụ bên thứ ba có thể đặt cookies của họ:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li><strong>Google Analytics:</strong> Phân tích lưu lượng truy cập</li>
                <li><strong>Facebook Pixel:</strong> Đo lường hiệu quả quảng cáo</li>
                <li><strong>Google Ads:</strong> Quảng cáo có mục tiêu</li>
                <li><strong>Hotjar:</strong> Ghi lại hành vi người dùng (heatmap)</li>
                <li><strong>Zendesk:</strong> Hỗ trợ khách hàng</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">5. Quản lý cookies</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>5.1. Qua trình duyệt:</strong></p>
                <p className="mb-3">Hầu hết trình duyệt cho phép bạn:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Xem cookies hiện có</li>
                  <li>Xóa cookies (tất cả hoặc từng cái)</li>
                  <li>Chặn cookies từ các website cụ thể</li>
                  <li>Chặn tất cả cookies từ tất cả website</li>
                  <li>Xóa cookies tự động khi đóng trình duyệt</li>
                </ul>

                <p className="mb-3"><strong>Hướng dẫn cho từng trình duyệt:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Chrome:</strong> Cài đặt &rarr; Quyền riêng tư và bảo mật &rarr; Cookie</li>
                  <li><strong>Firefox:</strong> Tùy chọn &rarr; Quyền riêng tư & Bảo mật &rarr; Cookie</li>
                  <li><strong>Safari:</strong> Tùy chọn &rarr; Quyền riêng tư &rarr; Quản lý dữ liệu trang web</li>
                  <li><strong>Edge:</strong> Cài đặt &rarr; Cookie và quyền của trang web</li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-4">
                  <p className="text-yellow-900 text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span><strong>Lưu ý:</strong> Nếu bạn chặn hoặc xóa cookies, một số tính năng của websiteite 
                    có thể không hoạt động đúng (ví dụ: giỏ hàng, đăng nhập).</span>
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">6. Do Not Track (DNT)</h2>
              <p className="text-gray-700 mb-6">
                Một số trình duyệt có tính năng "Do Not Track" để yêu cầu website không theo dõi. 
                Hiện tại chưa có tiêu chuẩn chung về DNT, nhưng chúng tôi tôn trọng quyền riêng tư của bạn 
                và cung cấp các tùy chọn quản lý cookies như trên.
              </p>

              <h2 className="text-2xl font-bold mb-4">7. Cookies trên thiết bị di động</h2>
              <p className="text-gray-700 mb-4">
                Trên mobile app, chúng tôi có thể sử dụng các công nghệ tương tự cookies như:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li><strong>Local Storage:</strong> Lưu dữ liệu cục bộ trên thiết bị</li>
                <li><strong>Device ID:</strong> Định danh thiết bị (có thể reset)</li>
                <li><strong>Advertising ID:</strong> IDFA (iOS), GAID (Android)</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">8. Thay đổi chính sách</h2>
              <p className="text-gray-700 mb-6">
                Chúng tôi có thể cập nhật chính sách cookies định kỳ. Thay đổi quan trọng sẽ được thông báo 
                qua banner hoặc email. Việc tiếp tục sử dụng website sau thay đổi đồng nghĩa bạn chấp nhận 
                chính sách mới.
              </p>

              <h2 className="text-2xl font-bold mb-4">9. Liên hệ</h2>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg">
                <p className="font-semibold mb-3">Có câu hỏi về cookies?</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email: <strong>privacy@bookstore.vn</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hotline: <strong>1900 xxxx</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mt-8">
                <h3 className="font-bold text-lg mb-3">Tài liệu liên quan</h3>
                <div className="space-y-2">
                  <Link href="/privacy" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Chính sách bảo mật
                  </Link>
                  <Link href="/terms" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Điều khoản sử dụng
                  </Link>
                  <a
                    href="https://www.allaboutcookies.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Tìm hiểu thêm về cookies (AllAboutCookies.org)
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
