import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Về chúng tôi</h1>
          <p className="text-xl opacity-90">
            Nơi kết nối độc giả với tri thức
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Về chúng tôi</span>
        </nav>

        {/* Story */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">Câu chuyện của chúng tôi</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-4">
                BookStore được thành lập với sứ mệnh làm cho việc đọc sách trở nên dễ dàng và thú vị hơn bao giờ hết. Chúng tôi tin rằng mỗi cuốn sách là một cánh cửa mở ra thế giới tri thức và trí tưởng tượng vô tận.
              </p>
              <p className="mb-4">
                Với hơn 10 năm hoạt động trong lĩnh vực xuất bản và phân phối sách, chúng tôi tự hào là đối tác tin cậy của hàng triệu độc giả trên toàn quốc. Từ sách giáo khoa đến sách nghệ thuật, từ văn học kinh điển đến sách kỹ năng sống, chúng tôi cam kết mang đến bộ sưu tập phong phú và đa dạng nhất.
              </p>
              <p>
                Đội ngũ của chúng tôi gồm những người yêu sách, hiểu sách và luôn sẵn sàng giúp bạn tìm được cuốn sách hoàn hảo cho mình.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Đa dạng</h3>
              <p className="text-gray-600 text-sm">Hàng triệu đầu sách từ mọi thể loại</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Uy tín</h3>
              <p className="text-gray-600 text-sm">Sản phẩm chính hãng, giá tốt nhất</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Nhanh chóng</h3>
              <p className="text-gray-600 text-sm">Giao hàng nhanh toàn quốc</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10+</div>
                <div className="text-sm opacity-90">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1M+</div>
                <div className="text-sm opacity-90">Khách hàng</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">500K+</div>
                <div className="text-sm opacity-90">Đầu sách</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">99%</div>
                <div className="text-sm opacity-90">Hài lòng</div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-gray-600 mb-6">
              Có câu hỏi? Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn
            </p>
            <Link
              href="/contact"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
