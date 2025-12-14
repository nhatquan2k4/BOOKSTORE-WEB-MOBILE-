import Link from "next/link";

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Phương thức thanh toán</h1>
          <p className="text-lg opacity-90">
            Thanh toán an toàn, nhanh chóng, tiện lợi
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
          <span className="text-gray-900">Phương thức thanh toán</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Payment Methods Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Thẻ thanh toán</h3>
              <p className="text-gray-600 text-sm">Visa, Mastercard, JCB, AMEX</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Ví điện tử</h3>
              <p className="text-gray-600 text-sm">MoMo, ZaloPay, VNPay, ShopeePay</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Chuyển khoản</h3>
              <p className="text-gray-600 text-sm">Internet Banking, QR Code</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Thanh toán COD</h3>
              <p className="text-gray-600 text-sm">Tiền mặt khi nhận hàng</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                1. Thanh toán khi nhận hàng (COD)
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Thanh toán trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.</p>
                
                <div className="bg-green-50 p-4 rounded-lg mb-3">
                  <p className="font-semibold text-green-900 mb-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Ưu điểm:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Không cần tài khoản ngân hàng</li>
                    <li>Kiểm tra hàng trước khi thanh toán</li>
                    <li>An toàn cho người chưa quen mua online</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-3">
                  <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Lưu ý:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Chỉ chấp nhận tiền mặt (không nhận thẻ, chuyển khoản tại chỗ)</li>
                    <li>Chuẩn bị sẵn tiền lẻ để giao dịch nhanh</li>
                    <li>Phí COD: 5.000đ - 15.000đ (tùy khu vực)</li>
                    <li>Giới hạn: Tối đa 5.000.000đ/đơn hàng</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                2. Thẻ tín dụng / Thẻ ghi nợ
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Chấp nhận các loại thẻ quốc tế và nội địa:</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="border rounded-lg p-3 text-center">
                    <img src="/image/visa.png" alt="Visa" className="h-8 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Visa</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <img src="/image/mastercard.png" alt="Mastercard" className="h-8 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Mastercard</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <img src="/image/jcb.png" alt="JCB" className="h-8 mx-auto mb-2" />
                    <p className="text-xs font-semibold">JCB</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <img src="/image/amex.png" alt="AMEX" className="h-8 mx-auto mb-2" />
                    <p className="text-xs font-semibold">AMEX</p>
                  </div>
                </div>

                <p className="mb-3"><strong>Cách thanh toán:</strong></p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Chọn "Thanh toán bằng thẻ" khi checkout</li>
                  <li>Nhập thông tin thẻ (số thẻ, tên, ngày hết hạn, CVV)</li>
                  <li>Xác thực qua OTP từ ngân hàng (3D Secure)</li>
                  <li>Hoàn tất thanh toán</li>
                </ol>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Bảo mật:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Mã hóa SSL 256-bit</li>
                    <li>Tuân thủ chuẩn PCI DSS</li>
                    <li>Không lưu trữ thông tin thẻ</li>
                    <li>Xác thực 2 lớp (3D Secure, OTP)</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                3. Ví điện tử
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Thanh toán nhanh chóng với ví điện tử:</p>

                <div className="space-y-3">
                  <div className="border-l-4 border-pink-500 pl-4">
                    <h4 className="font-semibold mb-1">MoMo</h4>
                    <p className="text-sm text-gray-600">Quét QR hoặc liên kết ví → Xác nhận thanh toán</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-1">ZaloPay</h4>
                    <p className="text-sm text-gray-600">Đăng nhập ZaloPay → Xác nhận số tiền → Thanh toán</p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold mb-1">VNPay</h4>
                    <p className="text-sm text-gray-600">Chọn ngân hàng liên kết → Xác thực → Hoàn tất</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold mb-1">ShopeePay</h4>
                    <p className="text-sm text-gray-600">Liên kết tài khoản Shopee → Thanh toán qua app</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="font-semibold text-green-900 mb-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Ưu đãi:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Hoàn tiền 5-10% cho người dùng mới</li>
                    <li>Voucher giảm giá định kỳ</li>
                    <li>Tích điểm đổi quà</li>
                    <li>Miễn phí giao dịch</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                4. Chuyển khoản ngân hàng
              </h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>A. Internet Banking:</strong></p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Chọn "Chuyển khoản" khi checkout</li>
                  <li>Hệ thống hiển thị thông tin tài khoản BookStore</li>
                  <li>Đăng nhập Internet Banking của bạn</li>
                  <li>Chuyển khoản đúng số tiền và nội dung</li>
                  <li>Đơn hàng tự động xác nhận sau 5-10 phút</li>
                </ol>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2">Thông tin tài khoản:</p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Ngân hàng:</strong> Vietcombank - Chi nhánh TP.HCM</li>
                    <li><strong>Số tài khoản:</strong> 0123456789</li>
                    <li><strong>Chủ tài khoản:</strong> CÔNG TY BOOKSTORE</li>
                    <li className="text-red-600"><strong>Nội dung CK:</strong> [Mã đơn hàng] [Số điện thoại]</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-2 italic">
                    * Ví dụ: DH12345 0901234567
                  </p>
                </div>

                <p className="mb-3"><strong>B. Quét mã QR:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Quét QR code hiển thị trên trang thanh toán</li>
                  <li>Mở app ngân hàng → Quét mã</li>
                  <li>Xác nhận thông tin → Thanh toán</li>
                  <li>Hệ thống tự động cập nhật đơn hàng</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">5. So sánh phương thức thanh toán</h2>
              <div className="text-gray-700 mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Phương thức</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Thời gian xử lý</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Phí giao dịch</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Ưu điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">COD</td>
                        <td className="border border-gray-300 px-4 py-2">Khi nhận hàng</td>
                        <td className="border border-gray-300 px-4 py-2">5.000-15.000đ</td>
                        <td className="border border-gray-300 px-4 py-2">Kiểm tra trước khi trả tiền</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Thẻ</td>
                        <td className="border border-gray-300 px-4 py-2">Ngay lập tức</td>
                        <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                        <td className="border border-gray-300 px-4 py-2">Nhanh, an toàn</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Ví điện tử</td>
                        <td className="border border-gray-300 px-4 py-2">Ngay lập tức</td>
                        <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                        <td className="border border-gray-300 px-4 py-2">Có ưu đãi, hoàn tiền</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Chuyển khoản</td>
                        <td className="border border-gray-300 px-4 py-2">5-10 phút</td>
                        <td className="border border-gray-300 px-4 py-2">Miễn phí</td>
                        <td className="border border-gray-300 px-4 py-2">Không giới hạn số tiền</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">6. Bảo mật thanh toán</h2>
              <div className="text-gray-700 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Chúng tôi làm gì:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Mã hóa SSL 256-bit</li>
                      <li>Tuân thủ PCI DSS Level 1</li>
                      <li>Xác thực 2 lớp (2FA)</li>
                      <li>Giám sát giao dịch 24/7</li>
                      <li>Không lưu thông tin thẻ</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Bạn nên:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Kiểm tra URL có khóa <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></li>
                      <li>Không chia sẻ OTP, CVV</li>
                      <li>Dùng mật khẩu mạnh</li>
                      <li>Đăng xuất sau khi thanh toán</li>
                      <li>Không thanh toán qua WiFi công cộng</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">7. Câu hỏi thường gặp</h2>
              <div className="text-gray-700 space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">❓ Thanh toán không thành công?</h4>
                  <p className="text-sm">Kiểm tra số dư, hạn mức thẻ, thông tin nhập có đúng không. Liên hệ ngân hàng hoặc hotline 1900 xxxx.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">❓ Thẻ bị trừ tiền nhưng đơn hàng không được tạo?</h4>
                  <p className="text-sm">Giao dịch đang pending, tiền sẽ được hoàn trong 3-7 ngày. Liên hệ CSKH để được hỗ trợ.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">❓ Có thể thanh toán một phần không?</h4>
                  <p className="text-sm">Hiện tại chưa hỗ trợ. Bạn cần thanh toán toàn bộ giá trị đơn hàng.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">❓ Có được đổi phương thức thanh toán sau khi đặt hàng?</h4>
                  <p className="text-sm">Có, liên hệ CSKH trước khi đơn hàng được xác nhận để thay đổi.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mt-8">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> Khuyến mãi thanh toán</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Giảm 50.000đ cho đơn đầu tiên thanh toán online</li>
                  <li className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Hoàn 10% tối đa 100.000đ qua MoMo</li>
                  <li className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Giảm 5% khi thanh toán bằng thẻ Visa</li>
                  <li className="flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Tặng voucher 20.000đ cho đơn tiếp theo</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3 italic">* Điều kiện và thời gian áp dụng có thể thay đổi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
