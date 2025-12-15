import Link from "next/link";

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h1 className="text-5xl font-bold mb-4">Chương trình Affiliate</h1>
          <p className="text-xl opacity-90 mb-8">
            Kiếm tiền bằng cách giới thiệu sách - Hoa hồng lên đến 15%
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Đăng ký ngay
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Affiliate</span>
        </nav>

        <div className="max-w-6xl mx-auto">
          {/* What is Affiliate */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold mb-4">Affiliate Marketing là gì?</h2>
            <p className="text-gray-700 mb-4">
              Affiliate (Tiếp thị liên kết) là hình thức kiếm tiền online bằng cách giới thiệu sản phẩm 
              của BookStore đến người khác. Khi có người mua hàng qua link của bạn, bạn sẽ nhận được hoa hồng.
            </p>
            <p className="text-gray-700">
              Đây là cách tuyệt vời để kiếm thêm thu nhập, đặc biệt phù hợp với blogger, reviewer, 
              influencer, hoặc bất kỳ ai có đam mê với sách.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Tại sao tham gia chương trình?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Hoa hồng hấp dẫn</h3>
                <p className="text-gray-600 text-sm">
                  5-15% cho mỗi đơn hàng thành công, không giới hạn thu nhập
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Dễ dàng tham gia</h3>
                <p className="text-gray-600 text-sm">
                  Đăng ký miễn phí, nhận link và bắt đầu kiếm tiền ngay
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Nhiều ưu đãi</h3>
                <p className="text-gray-600 text-sm">
                  Thưởng thêm cho top seller, voucher, quà tặng hấp dẫn
                </p>
              </div>
            </div>
          </div>

          {/* Commission Structure */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">Cấu trúc hoa hồng</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">Cấp độ</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Doanh số/tháng</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Hoa hồng</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Ưu đãi thêm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">Bronze</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">Dưới 10 triệu</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-600">5%</td>
                    <td className="border border-gray-300 px-4 py-3">-</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Silver</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">10 - 30 triệu</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-600">8%</td>
                    <td className="border border-gray-300 px-4 py-3">Voucher 500k</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Gold</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">30 - 50 triệu</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-600">12%</td>
                    <td className="border border-gray-300 px-4 py-3">Voucher 1 triệu</td>
                  </tr>
                  <tr className="bg-purple-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Platinum</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">Trên 50 triệu</td>
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-600">15%</td>
                    <td className="border border-gray-300 px-4 py-3">Voucher 2 triệu + Quà đặc biệt</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">
              * Hoa hồng được tính trên tổng giá trị đơn hàng sau khi trừ phí vận chuyển
            </p>
          </div>

          {/* How it Works */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Cách thức hoạt động</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                  1
                </div>
                <h4 className="font-bold mb-2">Đăng ký</h4>
                <p className="text-sm text-gray-600">Tạo tài khoản Affiliate miễn phí</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                  2
                </div>
                <h4 className="font-bold mb-2">Nhận link</h4>
                <p className="text-sm text-gray-600">Lấy link affiliate cho sản phẩm bạn muốn</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                  3
                </div>
                <h4 className="font-bold mb-2">Chia sẻ</h4>
                <p className="text-sm text-gray-600">Đăng link trên blog, social, email</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Kiếm tiền</h4>
                <p className="text-sm text-gray-600">Nhận hoa hồng khi có người mua</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">Điều kiện tham gia</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3 text-green-600">
                  <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Yêu cầu
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Từ 18 tuổi trở lên
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Có tài khoản BookStore
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Có blog/website/fanpage/kênh social
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Nội dung lành mạnh, tuân thủ pháp luật
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cam kết không spam, gian lận
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 text-blue-600 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Phù hợp với
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Blogger, content creator
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    YouTuber, reviewer sách
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Influencer, KOL
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Group/Community admin
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Giáo viên, sinh viên
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Bất kỳ ai muốn kiếm thêm thu nhập
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tools & Support */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">Công cụ & hỗ trợ</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-green-600 pl-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Link Affiliate tùy chỉnh
                </h4>
                <p className="text-sm text-gray-600">Tạo link ngắn, đẹp, dễ nhớ cho mỗi sản phẩm</p>
              </div>

              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard theo dõi
                </h4>
                <p className="text-sm text-gray-600">Xem click, đơn hàng, doanh thu theo thời gian thực</p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Banner & creative
                </h4>
                <p className="text-sm text-gray-600">Thư viện hình ảnh, banner chuyên nghiệp miễn phí</p>
              </div>

              <div className="border-l-4 border-orange-600 pl-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Hỗ trợ 24/7
                </h4>
                <p className="text-sm text-gray-600">Đội ngũ Affiliate Manager luôn sẵn sàng giúp đỡ</p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">Thanh toán</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Chu kỳ:</strong> Thanh toán vào ngày 15 hàng tháng</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Tối thiểu:</strong> 500.000đ để được rút tiền</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Phương thức:</strong> Chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Thời gian:</strong> 2-3 ngày làm việc sau khi duyệt</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Minh bạch:</strong> Báo cáo chi tiết từng đơn hàng, hoa hồng</span>
              </li>
            </ul>
          </div>

          {/* Rules */}
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mb-12">
            <h3 className="font-bold text-lg mb-3 text-yellow-900 flex items-center gap-2">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Quy định quan trọng
            </h3>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li>• Không được tự mua hàng qua link của mình để hưởng hoa hồng</li>
              <li>• Không spam link trên diễn đàn, group không liên quan</li>
              <li>• Không sử dụng Google Ads, Facebook Ads với từ khóa thương hiệu BookStore</li>
              <li>• Không đăng nội dung sai sự thật, lừa đảo về sản phẩm</li>
              <li>• Vi phạm nghiêm trọng sẽ bị khóa tài khoản và tịch thu hoa hồng</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
            <p className="text-lg opacity-90 mb-6">
              Tham gia ngay để kiếm thu nhập thụ động từ đam mê sách của bạn
            </p>
            
            <div className="bg-white/10 rounded-xl p-6 max-w-2xl mx-auto text-left mb-6">
              <p className="font-semibold mb-3">Liên hệ hỗ trợ Affiliate:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email: <strong>affiliate@bookstore.vn</strong>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hotline: <strong>1900 xxxx</strong> (phím 3)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Live Chat: Góc phải màn hình
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Đăng ký Affiliate
              </button>
              <Link
                href="/faq"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Xem FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
