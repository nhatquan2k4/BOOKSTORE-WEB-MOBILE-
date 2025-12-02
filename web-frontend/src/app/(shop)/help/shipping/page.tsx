import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Chính sách giao hàng</h1>
          <p className="text-lg opacity-90">
            Giao hàng nhanh chóng, an toàn trên toàn quốc
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/help" className="hover:text-blue-600">Hỗ trợ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Giao hàng & vận chuyển</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600 text-sm">1-2 ngày nội thành<br/>3-7 ngày toàn quốc</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Miễn phí vận chuyển</h3>
              <p className="text-gray-600 text-sm">Đơn hàng từ 300.000đ<br/>trên toàn quốc</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Đóng gói cẩn thận</h3>
              <p className="text-gray-600 text-sm">Bảo vệ sách tránh<br/>móp méo, hư hỏng</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                1. Khu vực giao hàng
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">BookStore giao hàng toàn quốc:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Nội thành Hà Nội & TP.HCM:</strong> Giao hàng trong 1-2 ngày làm việc</li>
                  <li><strong>Tỉnh thành phố lớn:</strong> Giao hàng trong 2-4 ngày làm việc</li>
                  <li><strong>Vùng sâu, vùng xa:</strong> Giao hàng trong 5-7 ngày làm việc</li>
                  <li><strong>Vùng hải đảo:</strong> Tùy thuộc vào điều kiện vận chuyển</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                2. Thời gian giao hàng
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>Thời gian xử lý đơn hàng:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Đơn hàng trước 14h: Xử lý và giao trong ngày (nội thành)</li>
                  <li>Đơn hàng sau 14h: Xử lý và giao vào ngày hôm sau</li>
                  <li>Đơn hàng cuối tuần/lễ: Xử lý vào ngày làm việc tiếp theo</li>
                </ul>

                <p className="mb-3"><strong>Thời gian giao hàng:</strong></p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Khu vực</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Thời gian</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Phí ship</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Nội thành HCM/HN</td>
                        <td className="border border-gray-300 px-4 py-2">1-2 ngày</td>
                        <td className="border border-gray-300 px-4 py-2">15.000 - 30.000đ</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Tỉnh thành lớn</td>
                        <td className="border border-gray-300 px-4 py-2">2-4 ngày</td>
                        <td className="border border-gray-300 px-4 py-2">30.000 - 40.000đ</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Vùng xa</td>
                        <td className="border border-gray-300 px-4 py-2">5-7 ngày</td>
                        <td className="border border-gray-300 px-4 py-2">40.000 - 50.000đ</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="border border-gray-300 px-4 py-2" colSpan={3}>
                          <strong>Miễn phí ship</strong> cho đơn hàng từ <strong>300.000đ</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                3. Đơn vị vận chuyển
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Chúng tôi hợp tác với các đơn vị vận chuyển uy tín:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Giao Hàng Nhanh (GHN):</strong> Dịch vụ chính cho nội thành</li>
                  <li><strong>Giao Hàng Tiết Kiệm (GHTK):</strong> Dịch vụ tiết kiệm</li>
                  <li><strong>J&T Express:</strong> Giao hàng toàn quốc</li>
                  <li><strong>Viettel Post:</strong> Vùng sâu, vùng xa</li>
                  <li><strong>Vietnam Post:</strong> Giao hàng đảo xa</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">4. Theo dõi đơn hàng</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Bạn có thể theo dõi đơn hàng qua:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Đăng nhập <svg className="w-3 h-3 inline mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> <strong>Tài khoản của tôi</strong> <svg className="w-3 h-3 inline mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> <strong>Đơn hàng</strong></li>
                  <li>Nhận thông báo qua Email khi đơn hàng thay đổi trạng thái</li>
                  <li>Nhận thông báo qua SMS khi hàng đang giao</li>
                  <li>Sử dụng mã vận đơn để tra cứu trên website đơn vị vận chuyển</li>
                </ol>
              </div>

              <h2 className="text-2xl font-bold mb-4">5. Quy trình giao hàng</h2>
              <div className="text-gray-700 mb-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Xác nhận đơn hàng</h4>
                      <p className="text-sm text-gray-600">Đơn hàng được kiểm tra và xác nhận trong vòng 2-4 giờ</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Đóng gói</h4>
                      <p className="text-sm text-gray-600">Sách được đóng gói cẩn thận, chống ẩm, chống va đập</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Bàn giao vận chuyển</h4>
                      <p className="text-sm text-gray-600">Đơn hàng được giao cho đơn vị vận chuyển, bạn nhận được mã vận đơn</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Giao hàng</h4>
                      <p className="text-sm text-gray-600">Shipper liên hệ và giao hàng tận nơi cho bạn</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Hoàn tất</h4>
                      <p className="text-sm text-gray-600">Kiểm tra hàng và xác nhận đã nhận</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">6. Lưu ý khi nhận hàng</h2>
              <div className="text-gray-700 mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-4">
                  <p className="font-semibold text-yellow-900 mb-2">Kiểm tra hàng trước khi thanh toán (COD):</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Kiểm tra bao bì có nguyên vẹn không</li>
                    <li>Kiểm tra số lượng sách có đủ không</li>
                    <li>Kiểm tra sách có bị hư hỏng, móp méo không</li>
                    <li>Từ chối nhận hàng nếu có vấn đề và liên hệ ngay hotline</li>
                  </ul>
                </div>

                <p className="mb-3"><strong>Các trường hợp đặc biệt:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Giao hàng 3 lần không thành công:</strong> Đơn hàng sẽ được hoàn về kho. Bạn có thể đặt lại hoặc hủy đơn</li>
                  <li><strong>Shipper không liên hệ được:</strong> Vui lòng cập nhật số điện thoại chính xác</li>
                  <li><strong>Địa chỉ không chính xác:</strong> Có thể phát sinh phí ship phụ khi giao lại</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">7. Phí vận chuyển đặc biệt</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Một số trường hợp phát sinh phí:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Đơn hàng cồng kềnh:</strong> Trên 5kg, có thể phát sinh phí thêm</li>
                  <li><strong>Vùng hải đảo:</strong> Phí vận chuyển riêng (liên hệ để biết chi tiết)</li>
                  <li><strong>Giao hàng ngoài giờ:</strong> Có thể phát sinh phí (nếu yêu cầu)</li>
                  <li><strong>Thay đổi địa chỉ sau khi gửi hàng:</strong> Phí ship phụ 10.000-20.000đ</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">8. Liên hệ hỗ trợ</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="mb-3 font-semibold">Cần hỗ trợ về giao hàng? Liên hệ ngay:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Hotline: <strong>1900 xxxx</strong> (8:00 - 22:00)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email: <strong>support@bookstore.vn</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Live Chat: Góc phải màn hình</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/help/returns" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600">Chính sách đổi trả</h3>
              <p className="text-gray-600 text-sm">Tìm hiểu về quy trình đổi trả sản phẩm</p>
            </Link>
            <Link href="/help/payment" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600">Phương thức thanh toán</h3>
              <p className="text-gray-600 text-sm">Các hình thức thanh toán được hỗ trợ</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
