import Link from "next/link";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-4xl font-bold mb-4">Tính năng trợ năng</h1>
          <p className="text-lg opacity-90">
            Cam kết mang đến trải nghiệm tốt nhất cho mọi người dùng
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Trợ năng</span>
        </nav>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold mb-4">Cam kết về trợ năng</h2>
              <p className="text-gray-700 mb-6">
                BookStore cam kết xây dựng một nền tảng có thể truy cập được cho tất cả mọi người, 
                bao gồm cả người khuyết tật. Chúng tôi nỗ lực tuân thủ các tiêu chuẩn trợ năng web 
                (WCAG 2.1 Level AA) để đảm bảo website dễ sử dụng cho mọi người.
              </p>

              <h2 className="text-2xl font-bold mb-4">Các tính năng trợ năng</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-blue-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Điều hướng bàn phím
                  </h3>
                  <p className="text-sm text-gray-700">
                    Website hỗ trợ đầy đủ điều hướng bằng bàn phím. Bạn có thể sử dụng Tab để di chuyển 
                    giữa các phần tử, Enter để chọn, và các phím mũi tên cho menu.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-green-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Hỗ trợ screen reader
                  </h3>
                  <p className="text-sm text-gray-700">
                    Tương thích với các phần mềm đọc màn hình phổ biến như NVDA, JAWS, VoiceOver. 
                    Tất cả hình ảnh đều có text mô tả thay thế (alt text).
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-purple-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Zoom và phóng to
                  </h3>
                  <p className="text-sm text-gray-700">
                    Website hỗ trợ zoom lên đến 200% mà không làm mất nội dung hoặc chức năng. 
                    Sử dụng Ctrl + / Ctrl - hoặc pinch zoom trên mobile.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-orange-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Độ tương phản cao
                  </h3>
                  <p className="text-sm text-gray-700">
                    Tất cả văn bản đều đảm bảo tỷ lệ tương phản tối thiểu 4.5:1 so với nền, 
                    giúp người khiếm thị hoặc có vấn đề về thị lực dễ đọc hơn.
                  </p>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-pink-900 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Phím tắt
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">Các phím tắt hữu ích:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                    <li><kbd className="px-2 py-1 bg-white rounded">Alt + H</kbd> - Về trang chủ</li>
                    <li><kbd className="px-2 py-1 bg-white rounded">Alt + S</kbd> - Focus vào ô tìm kiếm</li>
                    <li><kbd className="px-2 py-1 bg-white rounded">Alt + M</kbd> - Mở menu</li>
                    <li><kbd className="px-2 py-1 bg-white rounded">Esc</kbd> - Đóng modal/popup</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Hướng dẫn sử dụng</h2>
              <div className="text-gray-700 mb-6">
                <h3 className="font-semibold mb-2">Cho người khiếm thị:</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Bật screen reader (NVDA, JAWS, VoiceOver)</li>
                  <li>Sử dụng phím Tab để điều hướng qua các liên kết và nút</li>
                  <li>Sử dụng heading navigation (H) để nhảy giữa các phần</li>
                  <li>Landmarks (region, navigation, main) được đánh dấu rõ ràng</li>
                </ul>

                <h3 className="font-semibold mb-2">Cho người khó di chuyển:</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Tất cả chức năng đều có thể truy cập bằng bàn phím</li>
                  <li>Không cần thao tác phức tạp hoặc timing chính xác</li>
                  <li>Vùng click/tap đủ lớn (tối thiểu 44x44 pixel)</li>
                </ul>

                <h3 className="font-semibold mb-2">Cho người khiếm thính:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Video có phụ đề (nếu có)</li>
                  <li>Không dùng âm thanh là cách duy nhất để truyền tải thông tin</li>
                  <li>Hỗ trợ liên hệ qua email, chat thay vì chỉ điện thoại</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4">Các tiêu chuẩn tuân thủ</h2>
              <p className="text-gray-700 mb-4">BookStore tuân thủ các tiêu chuẩn:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</li>
                <li><strong>Section 508:</strong> Tiêu chuẩn của chính phủ Mỹ</li>
                <li><strong>ARIA:</strong> Sử dụng ARIA roles và attributes</li>
                <li><strong>Semantic HTML:</strong> Sử dụng đúng thẻ HTML để cấu trúc</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Vấn đề đang được cải thiện</h2>
              <p className="text-gray-700 mb-4">
                Chúng tôi liên tục nỗ lực cải thiện trải nghiệm trợ năng. Một số tính năng đang được phát triển:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>Chế độ tương phản cao (high contrast mode)</li>
                <li>Điều chỉnh font size dễ dàng hơn</li>
                <li>Hỗ trợ ngôn ngữ ký hiệu (sign language) cho video</li>
                <li>Tùy chọn giảm animation cho người nhạy cảm với chuyển động</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Phản hồi & hỗ trợ</h2>
              <p className="text-gray-700 mb-4">
                Nếu bạn gặp khó khăn khi sử dụng website hoặc có đề xuất về cải thiện trợ năng, 
                vui lòng liên hệ với chúng tôi:
              </p>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="font-semibold mb-3">Liên hệ hỗ trợ trợ năng:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email: <strong>accessibility@bookstore.vn</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hotline: <strong>1900 xxxx</strong> (phím 4)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Live Chat: Có hỗ trợ cho screen reader
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Form liên hệ: <Link href="/contact" className="text-blue-600 hover:underline">Trang liên hệ</Link>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mt-8">
                <p className="text-sm text-gray-700 text-center">
                  Chúng tôi cam kết đáp ứng trong vòng 2 ngày làm việc và sẽ nỗ lực khắc phục 
                  các vấn đề trợ năng nghiêm trọng trong thời gian sớm nhất.
                </p>
              </div>

              <div className="mt-8 text-center">
                <h3 className="font-bold text-lg mb-4">Tài liệu tham khảo</h3>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="https://www.w3.org/WAI/WCAG21/quickref/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    WCAG 2.1 Guidelines
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                  <a
                    href="https://www.section508.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    Section 508
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                  <a
                    href="https://www.w3.org/WAI/ARIA/apg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    ARIA Practices
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
