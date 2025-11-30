import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Chính sách bảo mật</h1>
          <p className="text-gray-600 mt-2">Cập nhật lần cuối: 01/01/2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Chính sách bảo mật</span>
        </nav>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
              <p className="text-blue-900 font-medium">
                BookStore cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. 
                Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">1. Thông tin chúng tôi thu thập</h2>
            <div className="text-gray-700 mb-6">
              <p className="mb-3"><strong>1.1. Thông tin cá nhân:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Họ tên, email, số điện thoại</li>
                <li>Địa chỉ giao hàng</li>
                <li>Thông tin tài khoản (username, mật khẩu đã mã hóa)</li>
                <li>Ngày sinh, giới tính (nếu cung cấp)</li>
              </ul>

              <p className="mb-3"><strong>1.2. Thông tin giao dịch:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Lịch sử mua hàng, đơn hàng</li>
                <li>Thông tin thanh toán (được mã hóa)</li>
                <li>Phương thức vận chuyển</li>
              </ul>

              <p className="mb-3"><strong>1.3. Thông tin kỹ thuật:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Địa chỉ IP, loại trình duyệt</li>
                <li>Cookies và dữ liệu phiên làm việc</li>
                <li>Hành vi duyệt web, sở thích đọc</li>
                <li>Thiết bị sử dụng (desktop, mobile)</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4">2. Mục đích sử dụng thông tin</h2>
            <div className="text-gray-700 mb-6 space-y-3">
              <p><strong>2.1.</strong> Xử lý đơn hàng và giao hàng</p>
              <p><strong>2.2.</strong> Cung cấp dịch vụ khách hàng và hỗ trợ</p>
              <p><strong>2.3.</strong> Gửi thông báo về đơn hàng, khuyến mãi (nếu đồng ý)</p>
              <p><strong>2.4.</strong> Cải thiện trải nghiệm người dùng</p>
              <p><strong>2.5.</strong> Đề xuất sách phù hợp với sở thích</p>
              <p><strong>2.6.</strong> Phân tích và thống kê nội bộ</p>
              <p><strong>2.7.</strong> Phát hiện và ngăn chặn gian lận</p>
              <p><strong>2.8.</strong> Tuân thủ các yêu cầu pháp lý</p>
            </div>

            <h2 className="text-2xl font-bold mb-4">3. Bảo vệ thông tin</h2>
            <div className="text-gray-700 mb-6">
              <p className="mb-3">Chúng tôi áp dụng các biện pháp bảo mật:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Mã hóa SSL/TLS:</strong> Bảo vệ dữ liệu truyền tải</li>
                <li><strong>Mã hóa mật khẩu:</strong> Sử dụng bcrypt/argon2</li>
                <li><strong>Tường lửa:</strong> Ngăn chặn truy cập trái phép</li>
                <li><strong>Backup định kỳ:</strong> Sao lưu dữ liệu thường xuyên</li>
                <li><strong>Giám sát 24/7:</strong> Phát hiện và xử lý sự cố kịp thời</li>
                <li><strong>Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới truy cập dữ liệu</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4">4. Chia sẻ thông tin</h2>
            <div className="text-gray-700 mb-6">
              <p className="mb-3">Chúng tôi có thể chia sẻ thông tin với:</p>
              <p><strong>4.1. Đối tác giao hàng:</strong> Thông tin cần thiết để giao hàng</p>
              <p><strong>4.2. Cổng thanh toán:</strong> Xử lý giao dịch an toàn</p>
              <p><strong>4.3. Nhà cung cấp dịch vụ:</strong> Hosting, analytics, email marketing</p>
              <p><strong>4.4. Cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp</p>
              <p className="mt-3 text-sm italic">
                * Chúng tôi không bán hoặc cho thuê thông tin cá nhân cho bên thứ ba
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
            <div className="text-gray-700 mb-6">
              <p className="mb-3">Chúng tôi sử dụng cookies để:</p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
                <li>Ghi nhớ thông tin đăng nhập</li>
                <li>Lưu giỏ hàng của bạn</li>
                <li>Phân tích lưu lượng truy cập</li>
                <li>Cá nhân hóa nội dung</li>
              </ul>
              <p className="text-sm">
                Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đúng.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">6. Quyền của bạn</h2>
            <div className="text-gray-700 mb-6">
              <p className="mb-3">Bạn có quyền:</p>
              <p><strong>6.1. Truy cập:</strong> Xem thông tin cá nhân chúng tôi lưu trữ</p>
              <p><strong>6.2. Chỉnh sửa:</strong> Cập nhật thông tin không chính xác</p>
              <p><strong>6.3. Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu</p>
              <p><strong>6.4. Từ chối:</strong> Không nhận email marketing</p>
              <p><strong>6.5. Xuất dữ liệu:</strong> Tải về bản sao dữ liệu của bạn</p>
              <p><strong>6.6. Khiếu nại:</strong> Liên hệ với cơ quan quản lý</p>
            </div>

            <h2 className="text-2xl font-bold mb-4">7. Lưu trữ dữ liệu</h2>
            <div className="text-gray-700 mb-6">
              <p><strong>7.1.</strong> Dữ liệu tài khoản: Cho đến khi bạn yêu cầu xóa</p>
              <p><strong>7.2.</strong> Lịch sử đơn hàng: 5 năm (theo yêu cầu pháp lý)</p>
              <p><strong>7.3.</strong> Dữ liệu analytics: 24 tháng</p>
              <p><strong>7.4.</strong> Cookies: Tùy loại (session hoặc persistent)</p>
            </div>

            <h2 className="text-2xl font-bold mb-4">8. Trẻ em</h2>
            <p className="text-gray-700 mb-6">
              Dịch vụ của chúng tôi không dành cho người dưới 16 tuổi. Chúng tôi không cố ý thu thập thông tin từ trẻ em. 
              Nếu phát hiện, chúng tôi sẽ xóa dữ liệu đó ngay lập tức.
            </p>

            <h2 className="text-2xl font-bold mb-4">9. Liên kết bên thứ ba</h2>
            <p className="text-gray-700 mb-6">
              Website có thể chứa liên kết đến trang web bên thứ ba. Chúng tôi không chịu trách nhiệm về chính sách 
              bảo mật của các trang này. Vui lòng đọc chính sách bảo mật của họ.
            </p>

            <h2 className="text-2xl font-bold mb-4">10. Thay đổi chính sách</h2>
            <p className="text-gray-700 mb-6">
              Chúng tôi có thể cập nhật chính sách này theo thời gian. Những thay đổi quan trọng sẽ được thông báo 
              qua email hoặc thông báo trên website. Ngày cập nhật cuối cùng được hiển thị ở đầu trang.
            </p>

            <h2 className="text-2xl font-bold mb-4">11. Liên hệ</h2>
            <div className="text-gray-700 mb-6">
              <p className="mb-3">Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền của mình:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Bộ phận Bảo vệ Dữ liệu</p>
                <ul className="list-none space-y-2">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email: privacy@bookstore.vn</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> Hotline: 1900 xxxx</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM</li>
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Thời gian: Thứ 2-6, 8:00-18:00</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mt-8">
              <p className="text-yellow-900 text-sm">
                <strong>Lưu ý:</strong> Việc bạn tiếp tục sử dụng website sau khi có thay đổi chính sách đồng nghĩa 
                với việc bạn chấp nhận các điều khoản mới.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
