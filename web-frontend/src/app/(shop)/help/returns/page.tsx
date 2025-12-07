import Link from "next/link";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Chính sách đổi trả</h1>
          <p className="text-lg opacity-90">
            Đổi trả dễ dàng trong vòng 7 ngày
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
          <span className="text-gray-900">Chính sách đổi trả</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">7 ngày đổi trả</h3>
              <p className="text-gray-600 text-sm">Miễn phí đổi trả<br/>không cần lý do</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Hoàn tiền nhanh</h3>
              <p className="text-gray-600 text-sm">3-5 ngày làm việc<br/>sau khi nhận hàng</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Miễn phí ship</h3>
              <p className="text-gray-600 text-sm">Lỗi từ nhà bán<br/>chúng tôi chịu phí</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Điều kiện đổi trả</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>Sản phẩm được chấp nhận đổi trả khi:</strong></p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Sản phẩm còn <strong>nguyên vẹn</strong>, chưa qua sử dụng</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Còn đầy đủ <strong>bao bì, tem, nhãn</strong> gốc</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Có <strong>hóa đơn mua hàng</strong> hoặc mã đơn hàng</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Không có dấu hiệu <strong>cố ý làm hỏng</strong></span>
                  </div>
                </div>

                <p className="mt-6 mb-3"><strong>Sản phẩm KHÔNG được đổi trả:</strong></p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Sách điện tử (ebook)</strong> đã tải về</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Sách đã qua sử dụng, <strong>bị viết, vẽ, cắt xé</strong></span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Sách trong <strong>combo/bộ sưu tập</strong> (chỉ đổi cả bộ)</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Sản phẩm <strong>khuyến mãi đặc biệt</strong> (nếu có ghi chú)</span>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Quá <strong>7 ngày</strong> kể từ ngày nhận hàng</span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">2. Các trường hợp đổi trả</h2>
              <div className="text-gray-700 mb-6">
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    <svg className="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    A. Lỗi từ nhà bán (BookStore chịu 100% chi phí)
                  </h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Giao sai sản phẩm (sai tên sách, sai tác giả)</li>
                    <li>Sản phẩm bị hư hỏng, rách, móp méo khi nhận</li>
                    <li>Thiếu số lượng so với đơn hàng</li>
                    <li>Sản phẩm lỗi in ấn, thiếu trang</li>
                    <li>Hàng giả, hàng nhái</li>
                  </ul>
                  <p className="mt-2 text-sm text-red-900">
                    → <strong>Đổi mới hoặc hoàn tiền 100%</strong> + Miễn phí ship 2 chiều
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    B. Đổi ý không muốn mua (Khách hàng chịu phí ship)
                  </h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Không thích sản phẩm</li>
                    <li>Đặt nhầm sách</li>
                    <li>Tìm được giá rẻ hơn nơi khác</li>
                    <li>Thay đổi nhu cầu</li>
                  </ul>
                  <p className="mt-2 text-sm text-blue-900">
                    → Chấp nhận đổi/trả nhưng khách chịu phí ship hoàn trả (20.000-40.000đ)
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">3. Quy trình đổi trả</h2>
              <div className="text-gray-700 mb-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Tạo yêu cầu đổi trả</h4>
                      <p className="text-sm text-gray-600 mb-2">Truy cập: Tài khoản → Đơn hàng → Chọn đơn cần đổi/trả → "Yêu cầu đổi trả"</p>
                      <p className="text-sm text-gray-600">Hoặc liên hệ Hotline: <strong>1900 xxxx</strong></p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Cung cấp thông tin</h4>
                      <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                        <li>Mã đơn hàng</li>
                        <li>Lý do đổi/trả</li>
                        <li>Hình ảnh sản phẩm (nếu có lỗi)</li>
                        <li>Hình thức mong muốn: Đổi mới hay hoàn tiền</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Chờ xác nhận</h4>
                      <p className="text-sm text-gray-600">
                        Bộ phận CSKH kiểm tra và phản hồi trong vòng <strong>24 giờ</strong> làm việc
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Gửi hàng hoàn trả</h4>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1"><strong>Cách 1:</strong> Shipper đến lấy hàng tận nơi (lỗi nhà bán)</p>
                        <p><strong>Cách 2:</strong> Tự gửi về kho (đổi ý - khách chịu phí ship)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold mb-1">Kiểm tra hàng hoàn trả</h4>
                      <p className="text-sm text-gray-600">
                        Kho kiểm tra tình trạng sản phẩm trong <strong>1-2 ngày</strong> làm việc
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h4 className="font-semibold mb-1">Xử lý đổi/trả</h4>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">• <strong>Đổi hàng:</strong> Gửi sản phẩm mới trong 1-2 ngày</p>
                        <p>• <strong>Hoàn tiền:</strong> Chuyển khoản trong 3-5 ngày làm việc</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">4. Thời gian xử lý</h2>
              <div className="text-gray-700 mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Giai đoạn</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Xét duyệt yêu cầu</td>
                        <td className="border border-gray-300 px-4 py-2">24 giờ làm việc</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Vận chuyển hàng về kho</td>
                        <td className="border border-gray-300 px-4 py-2">2-5 ngày</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Kiểm tra sản phẩm</td>
                        <td className="border border-gray-300 px-4 py-2">1-2 ngày</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Hoàn tiền/Đổi hàng</td>
                        <td className="border border-gray-300 px-4 py-2">3-5 ngày</td>
                      </tr>
                      <tr className="bg-blue-50 font-semibold">
                        <td className="border border-gray-300 px-4 py-2">Tổng thời gian</td>
                        <td className="border border-gray-300 px-4 py-2">7-12 ngày làm việc</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">5. Hình thức hoàn tiền</h2>
              <div className="text-gray-700 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Thanh toán COD:</strong> Chuyển khoản ngân hàng (cung cấp STK)</li>
                  <li><strong>Thẻ tín dụng/ghi nợ:</strong> Hoàn về thẻ gốc trong 7-14 ngày</li>
                  <li><strong>Ví điện tử:</strong> Hoàn về ví trong 3-5 ngày</li>
                  <li><strong>Chuyển khoản:</strong> Hoàn về TK chuyển trong 3-5 ngày</li>
                </ul>
                <p className="mt-3 text-sm italic">
                  * Thời gian thực tế phụ thuộc vào ngân hàng/ví điện tử
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4">6. Chi phí đổi trả</h2>
              <div className="text-gray-700 mb-6">
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Miễn phí 100% (Lỗi nhà bán)</h4>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>Giao sai sản phẩm</li>
                      <li>Sản phẩm lỗi, hư hỏng</li>
                      <li>Thiếu số lượng</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Khách chịu phí ship (Đổi ý)</h4>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      <li>Nội thành: 20.000đ</li>
                      <li>Tỉnh thành: 30.000-40.000đ</li>
                      <li>Phí này sẽ được trừ vào số tiền hoàn lại</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">7. Lưu ý quan trọng</h2>
              <div className="text-gray-700 mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Chụp ảnh/quay video khi mở hàng làm bằng chứng nếu có vấn đề</li>
                    <li>Giữ nguyên bao bì, hóa đơn, phụ kiện đi kèm</li>
                    <li>Không tự ý gửi hàng về kho trước khi được xác nhận</li>
                    <li>Kiểm tra kỹ trước khi gửi để tránh thất lạc</li>
                    <li>Sách đã đóng seal không được mở nếu muốn đổi/trả</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">8. Địa chỉ gửi hàng hoàn trả</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <p className="font-semibold mb-2">Kho BookStore</p>
                <p className="text-sm mb-1">Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM</p>
                <p className="text-sm mb-1">Người nhận: Bộ phận Đổi trả</p>
                <p className="text-sm mb-1">SĐT: 0123 456 789</p>
                <p className="text-sm text-red-600 font-semibold mt-2 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Ghi rõ: &quot;Đơn hàng #[MÃ ĐƠN] - Hoàn trả&quot; lên kiện hàng</span>
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4">9. Liên hệ hỗ trợ</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <p className="font-semibold mb-3">Cần hỗ trợ về đổi trả?</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hotline: <strong>1900 xxxx</strong> (8:00 - 22:00)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email: <strong>return@bookstore.vn</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Live Chat: Góc phải màn hình
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Tài khoản <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> Yêu cầu đổi trả
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/help/shipping" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600">Chính sách giao hàng</h3>
              <p className="text-gray-600 text-sm">Thông tin về thời gian và phí vận chuyển</p>
            </Link>
            <Link href="/help/warranty" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition group">
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600">Chính sách bảo hành</h3>
              <p className="text-gray-600 text-sm">Điều kiện và quy trình bảo hành sản phẩm</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
