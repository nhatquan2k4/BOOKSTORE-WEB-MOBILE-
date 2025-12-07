import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Điều khoản sử dụng</h1>
          <p className="text-lg opacity-90">
            Quy định và điều kiện khi sử dụng dịch vụ
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Điều khoản sử dụng</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <div className="bg-amber-50 border-l-4 border-amber-600 p-4 mb-8">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-amber-900 text-sm">
                      <strong>Cập nhật lần cuối:</strong> 01/12/2025<br/>
                      Vui lòng đọc kỹ điều khoản trước khi sử dụng dịch vụ. Việc bạn tiếp tục sử dụng đồng nghĩa 
                      với việc bạn chấp nhận các điều khoản này.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">1. Giới thiệu</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">
                  Chào mừng bạn đến với BookStore! Website này thuộc sở hữu và vận hành bởi 
                  <strong> Công ty Cổ phần Sách BookStore</strong>.
                </p>
                <p className="mb-3">
                  Khi truy cập và sử dụng website bookstore.vn cùng các dịch vụ liên quan, bạn đồng ý tuân thủ 
                  và bị ràng buộc bởi các điều khoản và điều kiện sau đây.
                </p>
                <p>
                  Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng không sử dụng dịch vụ của chúng tôi.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4">2. Định nghĩa</h2>
              <div className="text-gray-700 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"Chúng tôi", "BookStore":</strong> Công ty Cổ phần Sách BookStore</li>
                  <li><strong>"Bạn", "Khách hàng", "Người dùng":</strong> Cá nhân/tổ chức sử dụng dịch vụ</li>
                  <li><strong>"Website":</strong> Trang web bookstore.vn và các trang phụ</li>
                  <li><strong>"Dịch vụ":</strong> Tất cả dịch vụ cung cấp trên website</li>
                  <li><strong>"Sản phẩm":</strong> Sách, văn phòng phẩm và hàng hóa khác</li>
                  <li><strong>"Nội dung":</strong> Văn bản, hình ảnh, video, dữ liệu trên website</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">3. Đăng ký tài khoản</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>3.1. Điều kiện đăng ký:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Từ đủ 16 tuổi trở lên</li>
                  <li>Cung cấp thông tin chính xác, đầy đủ</li>
                  <li>Chịu trách nhiệm về tính bảo mật của tài khoản</li>
                  <li>Không được chia sẻ tài khoản cho người khác</li>
                </ul>

                <p className="mb-3"><strong>3.2. Trách nhiệm người dùng:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bảo mật mật khẩu, thông tin đăng nhập</li>
                  <li>Thông báo ngay nếu tài khoản bị truy cập trái phép</li>
                  <li>Cập nhật thông tin chính xác khi có thay đổi</li>
                  <li>Chịu trách nhiệm về mọi hoạt động từ tài khoản của mình</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">4. Mua hàng & thanh toán</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>4.1. Đặt hàng:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Đơn hàng được coi là hợp lệ khi nhận được xác nhận qua email</li>
                  <li>Giá sản phẩm có thể thay đổi mà không cần báo trước</li>
                  <li>Chúng tôi có quyền từ chối/hủy đơn hàng trong trường hợp đặc biệt</li>
                  <li>Khách hàng chịu trách nhiệm về tính chính xác của thông tin đặt hàng</li>
                </ul>

                <p className="mb-3"><strong>4.2. Thanh toán:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Chấp nhận các phương thức: COD, thẻ, ví điện tử, chuyển khoản</li>
                  <li>Thanh toán online qua cổng bảo mật</li>
                  <li>Không lưu trữ thông tin thẻ của khách hàng</li>
                  <li>Phí giao dịch (nếu có) sẽ được thông báo rõ ràng</li>
                </ul>

                <p className="mb-3"><strong>4.3. Hủy đơn hàng:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Khách hàng có thể hủy trước khi đơn hàng được xác nhận</li>
                  <li>Sau khi xác nhận, liên hệ CSKH để được hỗ trợ</li>
                  <li>Hoàn tiền trong 3-7 ngày làm việc (nếu đã thanh toán)</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">5. Giao hàng</h2>
              <div className="text-gray-700 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Thời gian giao hàng chỉ mang tính chất ước tính</li>
                  <li>Chúng tôi không chịu trách nhiệm về chậm trễ do bất khả kháng</li>
                  <li>Khách hàng cần kiểm tra hàng trước khi thanh toán (COD)</li>
                  <li>Từ chối nhận hàng nếu có dấu hiệu hư hỏng</li>
                  <li>Liên hệ trong 48h nếu phát hiện vấn đề sau khi nhận</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">6. Đổi trả & hoàn tiền</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">Xem chi tiết tại: <Link href="/help/returns" className="text-blue-600 hover:underline">Chính sách đổi trả</Link></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Đổi trả trong 7 ngày với điều kiện nhất định</li>
                  <li>Sản phẩm phải còn nguyên vẹn, chưa sử dụng</li>
                  <li>Không áp dụng cho sách điện tử đã tải</li>
                  <li>Hoàn tiền trong 7-14 ngày kể từ khi nhận hàng trả</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">7. Quyền sở hữu trí tuệ</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>7.1. Nội dung của BookStore:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Logo, thương hiệu, thiết kế website thuộc sở hữu của BookStore</li>
                  <li>Mô tả sản phẩm, hình ảnh, video do chúng tôi tạo ra</li>
                  <li>Không được sao chép, phân phối mà không có sự cho phép</li>
                  <li>Vi phạm sẽ bị xử lý theo pháp luật</li>
                </ul>

                <p className="mb-3"><strong>7.2. Nội dung người dùng:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Đánh giá, nhận xét, hình ảnh bạn đăng vẫn thuộc quyền sở hữu của bạn</li>
                  <li>Bạn cấp cho BookStore quyền sử dụng nội dung này cho mục đích kinh doanh</li>
                  <li>Nội dung không được vi phạm pháp luật, xúc phạm người khác</li>
                  <li>BookStore có quyền xóa nội dung không phù hợp</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">8. Hành vi bị cấm</h2>
              <div className="text-gray-700 mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">Người dùng KHÔNG ĐƯỢC:</p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                    <li>Giả mạo thông tin, lừa đảo</li>
                    <li>Hack, phá hoại hệ thống, website</li>
                    <li>Sao chép, tái bản nội dung trái phép</li>
                    <li>Spam, quấy rối người dùng khác</li>
                    <li>Sử dụng bot, script để thao túng hệ thống</li>
                    <li>Đăng nội dung vi phạm pháp luật, đạo đức</li>
                    <li>Khai thác lỗ hổng để trục lợi</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">9. Giới hạn trách nhiệm</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>BookStore KHÔNG chịu trách nhiệm về:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Thiệt hại gián tiếp, ngẫu nhiên, đặc biệt do sử dụng dịch vụ</li>
                  <li>Gián đoạn dịch vụ do bảo trì, nâng cấp, sự cố kỹ thuật</li>
                  <li>Nội dung từ website bên thứ ba được liên kết</li>
                  <li>Hành vi của người dùng khác</li>
                  <li>Mất mát do lỗi của bên thứ ba (ngân hàng, vận chuyển)</li>
                  <li>Thông tin sai lệch do người dùng cung cấp</li>
                </ul>
                <p className="mt-3 text-sm italic">
                  * Trách nhiệm tối đa của BookStore không vượt quá giá trị đơn hàng
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4">10. Bảo mật thông tin</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3">
                  Xem chi tiết tại: <Link href="/privacy" className="text-blue-600 hover:underline">Chính sách bảo mật</Link>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Thu thập và sử dụng thông tin theo chính sách bảo mật</li>
                  <li>Áp dụng các biện pháp bảo mật hợp lý</li>
                  <li>Không chia sẻ thông tin cá nhân với bên thứ ba (trừ trường hợp cần thiết)</li>
                  <li>Tuân thủ luật bảo vệ dữ liệu cá nhân</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">11. Chấm dứt tài khoản</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-3"><strong>11.1. Bạn có quyền:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Xóa tài khoản bất cứ lúc nào qua cài đặt</li>
                  <li>Dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày</li>
                  <li>Lịch sử giao dịch được lưu theo quy định pháp luật</li>
                </ul>

                <p className="mb-3"><strong>11.2. BookStore có quyền:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tạm khóa/khóa vĩnh viễn tài khoản vi phạm điều khoản</li>
                  <li>Hủy đơn hàng đáng ngờ</li>
                  <li>Từ chối dịch vụ với người dùng vi phạm nghiêm trọng</li>
                  <li>Không hoàn lại phí/tiền đã thanh toán (nếu vi phạm)</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">12. Thay đổi điều khoản</h2>
              <div className="text-gray-700 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li>BookStore có quyền sửa đổi điều khoản bất cứ lúc nào</li>
                  <li>Thay đổi quan trọng sẽ được thông báo qua email/website</li>
                  <li>Việc tiếp tục sử dụng sau thay đổi đồng nghĩa với chấp nhận</li>
                  <li>Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">13. Luật áp dụng</h2>
              <div className="text-gray-700 mb-6">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Điều khoản này tuân thủ pháp luật Việt Nam</li>
                  <li>Mọi tranh chấp sẽ được giải quyết thông qua thương lượng</li>
                  <li>Nếu không thể thương lượng, sẽ giải quyết tại Tòa án có thẩm quyền tại TP.HCM</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">14. Liên hệ</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="font-semibold mb-3">Nếu có câu hỏi về Điều khoản sử dụng:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email: <strong>legal@bookstore.vn</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hotline: <strong>1900 xxxx</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM
                  </li>
                  <li>🕐 Thời gian: Thứ 2-6, 8:00-18:00</li>
                </ul>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mt-8 text-center">
                <p className="text-sm text-gray-700">
                  Bằng việc sử dụng dịch vụ BookStore, bạn xác nhận đã đọc, hiểu và đồng ý với 
                  <strong> Điều khoản sử dụng</strong> này.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Cập nhật lần cuối: 01/12/2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
