import Link from "next/link";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Chính sách bảo hành</h1>
          <p className="text-lg opacity-90">
            Cam kết chất lượng sản phẩm
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
          <span className="text-gray-900">Chính sách bảo hành</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg mb-2 text-blue-900">Cam kết chất lượng</h3>
                <p className="text-blue-800">
                  BookStore cam kết 100% sản phẩm chính hãng, mới 100%. Mọi sản phẩm lỗi do nhà sản xuất 
                  sẽ được đổi mới hoặc hoàn tiền đầy đủ theo quy định.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Sản phẩm được bảo hành</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Do đặc thù của sách và văn phòng phẩm, chúng tôi áp dụng chính sách "đổi trả" thay vì "bảo hành" truyền thống:</p>
                
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Được đổi mới/hoàn tiền:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Sách bị lỗi in ấn:</strong> Thiếu trang, lặp trang, chữ mờ, nhòe</li>
                    <li><strong>Sách bị hư hỏng:</strong> Rách, bể gáy, tróc bìa do lỗi đóng quyển</li>
                    <li><strong>Giao sai sản phẩm:</strong> Không đúng đầu sách đã đặt</li>
                    <li><strong>Sản phẩm kém chất lượng:</strong> Giấy xấu, mực loang, khác mô tả</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Không được bảo hành:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Sách đã qua sử dụng, viết vẽ, bẩn</li>
                    <li>Hư hỏng do bảo quản không đúng cách (ẩm mốc, nước, rách do người dùng)</li>
                    <li>Sách điện tử (ebook) đã tải về</li>
                    <li>Sản phẩm giảm giá đặc biệt (có ghi chú không đổi trả)</li>
                    <li>Quá thời hạn 7 ngày kể từ ngày nhận hàng</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                2. Thời gian bảo hành
              </h2>
              <div className="text-gray-700 mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Loại lỗi</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Thời hạn</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Xử lý</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Lỗi in ấn, đóng quyển</td>
                        <td className="border border-gray-300 px-4 py-2">7 ngày</td>
                        <td className="border border-gray-300 px-4 py-2">Đổi mới miễn phí</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Giao sai sản phẩm</td>
                        <td className="border border-gray-300 px-4 py-2">7 ngày</td>
                        <td className="border border-gray-300 px-4 py-2">Đổi đúng hoặc hoàn tiền</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Hư hỏng khi vận chuyển</td>
                        <td className="border border-gray-300 px-4 py-2">48 giờ</td>
                        <td className="border border-gray-300 px-4 py-2">Gửi sản phẩm mới</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Không thích, đổi ý</td>
                        <td className="border border-gray-300 px-4 py-2">7 ngày</td>
                        <td className="border border-gray-300 px-4 py-2">Hoàn tiền (trừ phí ship)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                3. Quy trình yêu cầu bảo hành
              </h2>
              <div className="text-gray-700 mb-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Liên hệ CSKH</h4>
                      <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                        <li>Hotline: 1900 xxxx</li>
                        <li>Email: support@bookstore.vn</li>
                        <li className="flex items-center gap-1">
                          <span>Hoặc: Tài khoản</span>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>Đơn hàng</span>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>&quot;Yêu cầu đổi trả&quot;</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Cung cấp thông tin</h4>
                      <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                        <li>Mã đơn hàng</li>
                        <li>Hình ảnh/video sản phẩm lỗi</li>
                        <li>Mô tả chi tiết lỗi</li>
                        <li>Hóa đơn (nếu có)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Xác nhận bảo hành</h4>
                      <p className="text-sm text-gray-600">
                        Bộ phận kỹ thuật kiểm tra và phản hồi trong <strong>24 giờ làm việc</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Gửi sản phẩm lỗi</h4>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1"><strong>Lỗi nhà bán:</strong> Shipper đến lấy hàng miễn phí</p>
                        <p><strong>Khác:</strong> Khách tự gửi về kho (có thể chịu phí)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold mb-1">Kiểm tra và xử lý</h4>
                      <p className="text-sm text-gray-600">
                        Kho kiểm tra sản phẩm và xử lý trong <strong>2-3 ngày làm việc</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Giao sản phẩm mới / Hoàn tiền</h4>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">• <strong>Đổi mới:</strong> Gửi sản phẩm mới trong 1-2 ngày</p>
                        <p>• <strong>Hoàn tiền:</strong> Chuyển khoản trong 3-5 ngày</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">4. Chi phí bảo hành</h2>
              <div className="text-gray-700 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Miễn phí 100%
                    </h4>
                    <p className="text-sm mb-2">Áp dụng khi:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Lỗi in ấn, đóng quyển</li>
                      <li>Giao sai sản phẩm</li>
                      <li>Hư hỏng trong vận chuyển</li>
                      <li>Hàng giả, hàng nhái</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Có phí
                    </h4>
                    <p className="text-sm mb-2">Khách chịu chi phí khi:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Đổi ý không mua (phí ship: 20k-40k)</li>
                      <li>Hư hỏng do người dùng</li>
                      <li>Không đủ điều kiện bảo hành</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">5. Lưu ý quan trọng</h2>
              <div className="text-gray-700 mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Chụp ảnh/video khi mở hàng:</strong> Bằng chứng nếu có lỗi</li>
                    <li><strong>Giữ nguyên bao bì:</strong> Cần thiết để đổi trả</li>
                    <li><strong>Kiểm tra ngay khi nhận:</strong> Báo lỗi trong 48h</li>
                    <li><strong>Không tự sửa chữa:</strong> Có thể mất quyền bảo hành</li>
                    <li><strong>Bảo quản đúng cách:</strong> Tránh ẩm mốc, nước, ánh sáng</li>
                    <li><strong>Đọc kỹ mô tả sản phẩm:</strong> Một số đặc điểm là bình thường, không phải lỗi</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">6. Các trường hợp đặc biệt</h2>
              <div className="text-gray-700 mb-6">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-1">Sách cũ/second-hand</h4>
                    <p className="text-sm text-gray-600">
                      Đã được mô tả tình trạng khi bán. Chỉ đổi trả nếu tình trạng thực tế kém hơn mô tả.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-1">Sách nhập khẩu</h4>
                    <p className="text-sm text-gray-600">
                      Thời gian xử lý có thể lâu hơn (10-15 ngày) do cần nhập hàng thay thế từ nước ngoài.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-1">Sách combo/bộ sưu tập</h4>
                    <p className="text-sm text-gray-600">
                      Nếu 1 cuốn trong bộ bị lỗi, có thể đổi riêng cuốn đó hoặc đổi cả bộ (tùy trường hợp).
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold mb-1">Sản phẩm hết hàng</h4>
                    <p className="text-sm text-gray-600">
                      Nếu không còn hàng để đổi, sẽ hoàn tiền 100% hoặc đổi sang sản phẩm tương đương (nếu khách đồng ý).
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">7. Quyền lợi của khách hàng</h2>
              <div className="text-gray-700 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Được đổi sản phẩm mới cùng loại hoặc tương đương</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Được hoàn tiền 100% nếu không muốn đổi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Không chịu phí vận chuyển (nếu lỗi từ nhà bán)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Được bồi thường nếu gây thiệt hại do lỗi sản phẩm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Được hỗ trợ 24/7 trong suốt quá trình bảo hành</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">8. Liên hệ bảo hành</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <p className="font-semibold mb-3">Bộ phận Bảo hành & Đổi trả</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Hotline: <strong>1900 xxxx</strong> (8:00 - 22:00)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email: <strong>warranty@bookstore.vn</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Live Chat: Góc phải màn hình</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-600 mt-4 italic">
                  * Vui lòng chuẩn bị mã đơn hàng và hình ảnh sản phẩm để được hỗ trợ nhanh hơn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
