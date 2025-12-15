using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class BookSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Books.AnyAsync())
                return;

            // Lấy dữ liệu từ các bảng đã seed
            var authors = await context.Authors.ToListAsync();
            var publishers = await context.Publishers.ToListAsync();
            var categories = await context.Categories.ToListAsync();
            var formats = await context.BookFormats.ToListAsync();

            if (!authors.Any() || !publishers.Any() || !categories.Any() || !formats.Any())
            {
                throw new InvalidOperationException("Please ensure Authors, Publishers, Categories, and BookFormats are seeded first.");
            }

            // Lấy các entities cụ thể
            var nxbTre = publishers.First(p => p.Name.Contains("Trẻ"));
            var nxbKimDong = publishers.First(p => p.Name.Contains("Kim Đồng"));
            var nxbVanHoc = publishers.First(p => p.Name.Contains("Văn học"));
            var nxbHoiNhaVan = publishers.First(p => p.Name.Contains("Hội Nhà Văn"));
            var firstNews = publishers.First(p => p.Name.Contains("First News"));

            // Authors
            var nguyenNhatAnh = authors.First(a => a.Name.Contains("Nguyễn Nhật Ánh"));
            var toHoai = authors.First(a => a.Name.Contains("Tô Hoài"));
            var namCao = authors.First(a => a.Name.Contains("Nam Cao"));
            var jkRowling = authors.First(a => a.Name.Contains("Rowling"));
            var harukiMurakami = authors.First(a => a.Name.Contains("Murakami"));
            var pauloCoelho = authors.First(a => a.Name.Contains("Coelho"));
            var daleCarnegie = authors.First(a => a.Name.Contains("Carnegie"));
            var danielKahneman = authors.First(a => a.Name.Contains("Kahneman"));
            var stephenKing = authors.First(a => a.Name.Contains("Stephen King"));
            var georgeOrwell = authors.First(a => a.Name.Contains("Orwell"));
            var yuvalHarari = authors.First(a => a.Name.Contains("Harari"));
            var danBrown = authors.First(a => a.Name.Contains("Dan Brown"));
            var agatha = authors.First(a => a.Name.Contains("Agatha"));
            var robinSharma = authors.First(a => a.Name.Contains("Robin Sharma"));
            var napoleonHill = authors.First(a => a.Name.Contains("Napoleon Hill"));
            var robertKiyosaki = authors.First(a => a.Name.Contains("Kiyosaki"));
            var stephenCovey = authors.First(a => a.Name.Contains("Covey"));
            var hemingway = authors.First(a => a.Name.Contains("Hemingway"));
            var fitzgerald = authors.First(a => a.Name.Contains("Fitzgerald"));
            var tolstoy = authors.First(a => a.Name.Contains("Tolstoy"));
            var ngoTatTo = authors.First(a => a.Name.Contains("Ngô Tất Tố"));
            var vuTrongPhung = authors.First(a => a.Name.Contains("Vũ Trọng Phụng"));
            var nguyenNgocTu = authors.First(a => a.Name.Contains("Nguyễn Ngọc Tư"));
            var anhKhang = authors.First(a => a.Name.Contains("Anh Khang"));

            // Categories
            var vanHocVN = categories.First(c => c.Name.Contains("Văn học Việt Nam"));
            var vanHocNN = categories.First(c => c.Name.Contains("Văn học nước ngoài"));
            var tieuThuyet = categories.First(c => c.Name.Contains("Tiểu thuyết"));
            var kyNangSong = categories.FirstOrDefault(c => c.Name == "Kỹ năng sống");
            var thieuNhi = categories.FirstOrDefault(c => c.Name == "Thiếu nhi");
            var trinhTham = categories.FirstOrDefault(c => c.Name.Contains("Trinh thám"));
            var kinhDi = categories.FirstOrDefault(c => c.Name.Contains("Kinh dị"));
            var kinhTe = categories.FirstOrDefault(c => c.Name == "Kinh tế");
            var lichSu = categories.FirstOrDefault(c => c.Name == "Lịch sử");
            var taiChinh = categories.FirstOrDefault(c => c.Name.Contains("Tài chính"));
            var giaotiep = categories.FirstOrDefault(c => c.Name.Contains("Giao tiếp"));
            var langMan = categories.FirstOrDefault(c => c.Name.Contains("Lãng mạn"));

            var biaMem = formats.First(f => f.FormatType.Contains("Bìa mềm"));
            var biaCung = formats.First(f => f.FormatType.Contains("Bìa cứng"));
            var ebook = formats.First(f => f.FormatType.Contains("Ebook"));

            // Tạo danh sách books
            var books = new List<Book>
            {
                // 1. Mắt biếc - Nguyễn Nhật Ánh
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Mắt biếc",
                    ISBN = new ISBN("9786041111981"),
                    Description = "Mắt biếc là một trong những tác phẩm văn học nổi tiếng nhất của nhà văn Nguyễn Nhật Ánh. Câu chuyện xoay quanh tình yêu đơn phương của Ngạn dành cho Hà Lan - cô bạn thơ ấu có đôi mắt biếc đẹp và trong trẻo.",
                    PublicationYear = 2020,
                    Language = "vi",
                    PageCount = 376,
                    Edition = "Tái bản lần 25",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.8m,
                    TotalReviews = 1523
                },

                // 2. Tôi thấy hoa vàng trên cỏ xanh - Nguyễn Nhật Ánh
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Tôi thấy hoa vàng trên cỏ xanh",
                    ISBN = new ISBN("9786041000315"),
                    Description = "Tác phẩm xoay quanh cuộc sống thơ ấu của hai anh em Thiều và Tường ở một vùng quê nghèo, với những tình cảm trong sáng, những kỷ niệm đẹp đẽ và cả những nỗi đau trong cuộc sống.",
                    PublicationYear = 2018,
                    Language = "vi",
                    PageCount = 488,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.7m,
                    TotalReviews = 2156
                },

                // 3. Cho tôi xin một vé về tuổi thơ - Nguyễn Nhật Ánh
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Cho tôi xin một vé về tuổi thơ",
                    ISBN = new ISBN("9786041046665"),
                    Description = "Nhân vật chính của truyện đã trải qua tuổi thơ nghèo khó ở miền quê. Những kỷ niệm về làng xóm nghèo khó nhưng thân thương, về tình bạn, tình thương yêu trong sáng luôn hiện hữu trong tâm trí ông.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 272,
                    Edition = "Tái bản lần 15",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.6m,
                    TotalReviews = 987
                },

                // 4. Dế Mèn phiêu lưu ký - Tô Hoài
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Dế Mèn phiêu lưu ký",
                    ISBN = new ISBN("9786041018341"),
                    Description = "Tác phẩm văn học thiếu nhi kinh điển của văn học Việt Nam, kể về cuộc phiêu lưu đầy thú vị và ý nghĩa của chú dế Mèn qua nhiều vùng đất khác nhau.",
                    PublicationYear = 2017,
                    Language = "vi",
                    PageCount = 248,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbKimDong.Id,
                    BookFormatId = biaCung.Id,
                    AverageRating = 4.9m,
                    TotalReviews = 3421
                },

                // 5. Chi Phèo - Nam Cao
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Chi Phèo",
                    ISBN = new ISBN("9786041055445"),
                    Description = "Tác phẩm văn học hiện thực xuất sắc, phản ánh cuộc sống đau khổ của người dân nghèo khổ nông thôn Việt Nam trước cách mạng. Chi Phèo là biểu tượng cho số phận những con người bị xã hội đẩy vào con đường sa ngã.",
                    PublicationYear = 2016,
                    Language = "vi",
                    PageCount = 156,
                    Edition = "Tái bản lần 12",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.5m,
                    TotalReviews = 756
                },

                // 6. Harry Potter và Hòn đá phù thủy
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Harry Potter và Hòn đá phù thủy",
                    ISBN = new ISBN("9786042068307"),
                    Description = "Cuốn sách đầu tiên trong series Harry Potter nổi tiếng thế giới. Câu chuyện bắt đầu khi cậu bé Harry Potter được nhận vào trường Hogwarts - Trường Phù thủy và Pháp sư và khám phá ra thế giới phép thuật kỳ diệu.",
                    PublicationYear = 2020,
                    Language = "vi",
                    PageCount = 368,
                    Edition = "Bản dịch mới",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaCung.Id,
                    AverageRating = 4.9m,
                    TotalReviews = 5234
                },

                // 7. Kafka bên bờ biển - Haruki Murakami
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Kafka bên bờ biển",
                    ISBN = new ISBN("9786041033825"),
                    Description = "Tác phẩm được đánh giá là một trong những tiểu thuyết hay nhất của Murakami, xoay quanh câu chuyện của cậu thiếu niên Kafka Tamura chạy trốn khỏi lời tiên tri định mệnh.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 672,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbHoiNhaVan.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.6m,
                    TotalReviews = 1876
                },

                // 8. Nhà giả kim - Paulo Coelho
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Nhà giả kim",
                    ISBN = new ISBN("9786041000612"),
                    Description = "Tác phẩm nổi tiếng nhất của Paulo Coelho kể về hành trình tìm kiếm ước mơ của chàng chăn cừu Santiago. Cuốn sách truyền cảm hứng về việc theo đuổi ước mơ và lắng nghe trái tim mình.",
                    PublicationYear = 2018,
                    Language = "vi",
                    PageCount = 228,
                    Edition = "Tái bản lần 30",
                    IsAvailable = true,
                    PublisherId = nxbHoiNhaVan.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.7m,
                    TotalReviews = 4521
                },

                // 9. Đắc nhân tâm - Dale Carnegie
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Đắc nhân tâm",
                    ISBN = new ISBN("9786041020887"),
                    Description = "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử, giúp bạn hiểu rõ hơn về con người và cách xây dựng mối quan hệ tốt đẹp với mọi người xung quanh.",
                    PublicationYear = 2020,
                    Language = "vi",
                    PageCount = 320,
                    Edition = "Tái bản lần 45",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.8m,
                    TotalReviews = 6789
                },

                // 10. Tư duy nhanh và chậm - Daniel Kahneman
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Tư duy nhanh và chậm",
                    ISBN = new ISBN("9786041046894"),
                    Description = "Cuốn sách phân tích hai hệ thống tư duy của con người: hệ thống tư duy nhanh (trực giác) và hệ thống tư duy chậm (lý trí), giúp người đọc hiểu rõ hơn về cách con người đưa ra quyết định.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 631,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.5m,
                    TotalReviews = 2341
                },

                // 11. Sapiens: Lược sử loài người - Yuval Noah Harari
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Sapiens: Lược sử loài người",
                    ISBN = new ISBN("9786045635926"),
                    Description = "Cuốn sách xem xét lại toàn bộ tiến trình lịch sử loài người, từ những con vượn người đầu tiên đến những bước đột phá trong cách mạng nhận thức, nông nghiệp và khoa học.",
                    PublicationYear = 2018,
                    Language = "vi",
                    PageCount = 544,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.7m,
                    TotalReviews = 3245
                },

                // 12. 1984 - George Orwell
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "1984",
                    ISBN = new ISBN("9786041069824"),
                    Description = "Tiểu thuyết phản địa đàng nổi tiếng về một xã hội toàn trị nơi Đảng và Big Brother giám sát mọi khía cạnh của cuộc sống. Một tác phẩm kinh điển về chính trị và tự do.",
                    PublicationYear = 2017,
                    Language = "vi",
                    PageCount = 396,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.6m,
                    TotalReviews = 2876
                },

                // 13. Mật mã Da Vinci - Dan Brown
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Mật mã Da Vinci",
                    ISBN = new ISBN("9786041028609"),
                    Description = "Tiểu thuyết trinh thám gay cấn xoay quanh vụ giết người bí ẩn ở bảo tàng Louvre và những bí mật ẩn giấu trong các tác phẩm nghệ thuật của Leonardo da Vinci.",
                    PublicationYear = 2016,
                    Language = "vi",
                    PageCount = 528,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.4m,
                    TotalReviews = 1987
                },

                // 14. Tắt đèn - Ngô Tất Tố
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Tắt đèn",
                    ISBN = new ISBN("9786041127586"),
                    Description = "Tiểu thuyết hiện thực phản ánh cuộc sống khốn khó của nông dân Việt Nam đầu thế kỷ 20. Tác phẩm phê phán gay gắt chế độ phong kiến và thực dân.",
                    PublicationYear = 2015,
                    Language = "vi",
                    PageCount = 264,
                    Edition = "Tái bản lần 18",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.7m,
                    TotalReviews = 1456
                },

                // 15. Số đỏ - Vũ Trọng Phụng
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Số đỏ",
                    ISBN = new ISBN("9786041098671"),
                    Description = "Tiểu thuyết châm biếm sắc sảo về giai cấp trí thức giả dối và xã hội Hà Nội thời Pháp thuộc. Tác phẩm nổi bật với phong cách viết hài hước, trào phúng.",
                    PublicationYear = 2016,
                    Language = "vi",
                    PageCount = 312,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.5m,
                    TotalReviews = 1123
                },

                // 16. Dạy con làm giàu - Robert Kiyosaki
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Dạy con làm giàu",
                    ISBN = new ISBN("9786041136809"),
                    Description = "Cuốn sách về tài chính cá nhân nổi tiếng, dạy cách quản lý tiền bạc, đầu tư và xây dựng tự do tài chính. Phá vỡ quan niệm truyền thống về tiền bạc và làm giàu.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 248,
                    Edition = "Tái bản lần 20",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.6m,
                    TotalReviews = 4567
                },

                // 17. Nhà giả kim nghĩ, và người nghèo nghĩ - Napoleon Hill
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Nghĩ giàu làm giàu",
                    ISBN = new ISBN("9786041095779"),
                    Description = "Tác phẩm kinh điển về thành công và làm giàu, tổng hợp kinh nghiệm của những người giàu có nhất thế giới. Chỉ ra 13 nguyên tắc để đạt được thành công trong cuộc sống.",
                    PublicationYear = 2018,
                    Language = "vi",
                    PageCount = 386,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.5m,
                    TotalReviews = 3456
                },

                // 18. 7 Thói quen của người thành đạt - Stephen Covey
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "7 Thói quen của người thành đạt",
                    ISBN = new ISBN("9786041120785"),
                    Description = "Cuốn sách self-help kinh điển hướng dẫn 7 thói quen giúp bạn trở thành người hiệu quả và thành công trong cả cuộc sống cá nhân và công việc.",
                    PublicationYear = 2020,
                    Language = "vi",
                    PageCount = 468,
                    Edition = "Tái bản mới",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.7m,
                    TotalReviews = 5234
                },

                // 19. Ông già và biển cả - Ernest Hemingway
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Ông già và biển cả",
                    ISBN = new ISBN("9786041087293"),
                    Description = "Tiểu thuyết ngắn đoạt giải Pulitzer về người ngư phủ già Santiago và cuộc chiến với con cá marlin khổng lồ. Tác phẩm về ý chí, nghị lực và phẩm giá con người.",
                    PublicationYear = 2017,
                    Language = "vi",
                    PageCount = 156,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.6m,
                    TotalReviews = 2345
                },

                // 20. Gatsby vĩ đại - F. Scott Fitzgerald
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Gatsby vĩ đại",
                    ISBN = new ISBN("9786041113268"),
                    Description = "Tiểu thuyết kinh điển về giấc mơ Mỹ, tình yêu và sự ảo tưởng trong thời kỳ phồn vinh những năm 1920. Câu chuyện về Jay Gatsby và tình yêu của ông dành cho Daisy Buchanan.",
                    PublicationYear = 2018,
                    Language = "vi",
                    PageCount = 224,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.5m,
                    TotalReviews = 1876
                },

                // 21. Chiến tranh và Hòa bình - Leo Tolstoy
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Chiến tranh và Hòa bình",
                    ISBN = new ISBN("9780307266934"),
                    Description = "Kiệt tác văn học thế giới về cuộc chiến tranh Napoleon ở Nga, đan xen giữa lịch sử và đời sống của nhiều gia đình quý tộc Nga.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 1456,
                    Edition = "Bản đầy đủ",
                    IsAvailable = true,
                    PublisherId = nxbVanHoc.Id,
                    BookFormatId = biaCung.Id,
                    AverageRating = 4.8m,
                    TotalReviews = 2567
                },

                // 22. Nhà lãnh đạo không chức danh - Robin Sharma
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Nhà lãnh đạo không chức danh",
                    ISBN = new ISBN("9786041095786"),
                    Description = "Cuốn sách về lãnh đạo và phát triển bản thân, khuyến khích mọi người trở thành nhà lãnh đạo trong cuộc sống và công việc của mình, bất kể vị trí nào.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 312,
                    Edition = "Tái bản",
                    IsAvailable = true,
                    PublisherId = firstNews.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.4m,
                    TotalReviews = 1987
                },

                // 23. Cánh đồng bất tận - Nguyễn Ngọc Tư
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Cánh đồng bất tận",
                    ISBN = new ISBN("9786041159235"),
                    Description = "Tập truyện ngắn về cuộc sống miền Tây Nam Bộ với những con người nghèo khổ nhưng mạnh mẽ, bền bỉ. Văn phong giản dị nhưng sâu sắc.",
                    PublicationYear = 2017,
                    Language = "vi",
                    PageCount = 268,
                    Edition = "Tái bản lần 8",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.6m,
                    TotalReviews = 1234
                },

                // 24. Bắt trẻ đồng xanh - J.D. Salinger (giả sử có tác giả)
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Tuổi trẻ đáng giá bao nhiêu",
                    ISBN = new ISBN("9786041142305"),
                    Description = "Cuốn sách về tuổi trẻ, ước mơ và hành trình tìm kiếm chính mình của thế hệ trẻ Việt Nam. Động lực cho những ai đang loay hoay tìm định hướng.",
                    PublicationYear = 2020,
                    Language = "vi",
                    PageCount = 296,
                    Edition = "Tái bản lần 30",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.3m,
                    TotalReviews = 8765
                },

                // 25. Tội ác và Hình phạt (giả sử một tác giả khác)
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Đời thừa",
                    ISBN = new ISBN("9786041148017"),
                    Description = "Tiểu thuyết về một thanh niên trí thức nghèo khó tìm cách sinh tồn ở Sài Gòn. Tác phẩm phản ánh hiện thực đô thị qua con mắt của thế hệ trẻ.",
                    PublicationYear = 2019,
                    Language = "vi",
                    PageCount = 324,
                    Edition = "Lần đầu xuất bản",
                    IsAvailable = true,
                    PublisherId = nxbTre.Id,
                    BookFormatId = biaMem.Id,
                    AverageRating = 4.4m,
                    TotalReviews = 2134
                }
            };

            await context.Books.AddRangeAsync(books);
            await context.SaveChangesAsync();

            // Seed BookAuthors (Many-to-Many)
            var bookAuthors = new List<BookAuthor>
            {
                // 1-10
                new BookAuthor { BookId = books[0].Id, AuthorId = nguyenNhatAnh.Id },
                new BookAuthor { BookId = books[1].Id, AuthorId = nguyenNhatAnh.Id },
                new BookAuthor { BookId = books[2].Id, AuthorId = nguyenNhatAnh.Id },
                new BookAuthor { BookId = books[3].Id, AuthorId = toHoai.Id },
                new BookAuthor { BookId = books[4].Id, AuthorId = namCao.Id },
                new BookAuthor { BookId = books[5].Id, AuthorId = jkRowling.Id },
                new BookAuthor { BookId = books[6].Id, AuthorId = harukiMurakami.Id },
                new BookAuthor { BookId = books[7].Id, AuthorId = pauloCoelho.Id },
                new BookAuthor { BookId = books[8].Id, AuthorId = daleCarnegie.Id },
                new BookAuthor { BookId = books[9].Id, AuthorId = danielKahneman.Id },
                // 11-25
                new BookAuthor { BookId = books[10].Id, AuthorId = yuvalHarari.Id },
                new BookAuthor { BookId = books[11].Id, AuthorId = georgeOrwell.Id },
                new BookAuthor { BookId = books[12].Id, AuthorId = danBrown.Id },
                new BookAuthor { BookId = books[13].Id, AuthorId = ngoTatTo.Id },
                new BookAuthor { BookId = books[14].Id, AuthorId = vuTrongPhung.Id },
                new BookAuthor { BookId = books[15].Id, AuthorId = robertKiyosaki.Id },
                new BookAuthor { BookId = books[16].Id, AuthorId = napoleonHill.Id },
                new BookAuthor { BookId = books[17].Id, AuthorId = stephenCovey.Id },
                new BookAuthor { BookId = books[18].Id, AuthorId = hemingway.Id },
                new BookAuthor { BookId = books[19].Id, AuthorId = fitzgerald.Id },
                new BookAuthor { BookId = books[20].Id, AuthorId = tolstoy.Id },
                new BookAuthor { BookId = books[21].Id, AuthorId = robinSharma.Id },
                new BookAuthor { BookId = books[22].Id, AuthorId = nguyenNgocTu.Id },
                new BookAuthor { BookId = books[23].Id, AuthorId = anhKhang.Id },
                new BookAuthor { BookId = books[24].Id, AuthorId = anhKhang.Id }
            };

            await context.BookAuthors.AddRangeAsync(bookAuthors);

            // Seed BookCategories (Many-to-Many)
            var bookCategories = new List<BookCategory>
            {
                // 1-10
                new BookCategory { BookId = books[0].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[0].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[1].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[1].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[2].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[3].Id, CategoryId = thieuNhi.Id },
                new BookCategory { BookId = books[3].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[4].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[4].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[5].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[5].Id, CategoryId = thieuNhi.Id },
                new BookCategory { BookId = books[6].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[6].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[7].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[7].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[8].Id, CategoryId = kyNangSong.Id },
                new BookCategory { BookId = books[8].Id, CategoryId = giaotiep?.Id ?? kyNangSong.Id },
                new BookCategory { BookId = books[9].Id, CategoryId = kyNangSong.Id },
                // 11-25
                new BookCategory { BookId = books[10].Id, CategoryId = lichSu?.Id ?? vanHocNN.Id },
                new BookCategory { BookId = books[11].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[11].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[12].Id, CategoryId = trinhTham?.Id ?? vanHocNN.Id },
                new BookCategory { BookId = books[12].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[13].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[13].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[14].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[14].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[15].Id, CategoryId = taiChinh?.Id ?? kinhTe?.Id ?? kyNangSong.Id },
                new BookCategory { BookId = books[15].Id, CategoryId = kyNangSong.Id },
                new BookCategory { BookId = books[16].Id, CategoryId = kyNangSong.Id },
                new BookCategory { BookId = books[16].Id, CategoryId = taiChinh?.Id ?? kyNangSong.Id },
                new BookCategory { BookId = books[17].Id, CategoryId = kyNangSong.Id },
                new BookCategory { BookId = books[18].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[18].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[19].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[19].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[19].Id, CategoryId = langMan?.Id ?? tieuThuyet.Id },
                new BookCategory { BookId = books[20].Id, CategoryId = vanHocNN.Id },
                new BookCategory { BookId = books[20].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[21].Id, CategoryId = kyNangSong.Id },
                new BookCategory { BookId = books[22].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[22].Id, CategoryId = tieuThuyet.Id },
                new BookCategory { BookId = books[23].Id, CategoryId = kyNangSong.Id },
                new BookCategory { BookId = books[24].Id, CategoryId = vanHocVN.Id },
                new BookCategory { BookId = books[24].Id, CategoryId = tieuThuyet.Id }
            };

            await context.BookCategories.AddRangeAsync(bookCategories);

            // Seed BookImages
            var bookImages = new List<BookImage>
            {
                // Mắt biếc
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[0].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Tôi thấy hoa vàng trên cỏ xanh
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[1].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/b8/14/89/a0f34da831e6f94719e3f0c1793b4d1e.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Cho tôi xin một vé về tuổi thơ
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[2].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/ca/eb/89/6f5756c1e788ed0c20a66198a608c5b5.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Dế Mèn phiêu lưu ký
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[3].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/44/69/ca/d05b4e15437e381c98a6c0f5f6e0f052.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Chi Phèo
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[4].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/96/89/72/bfb046fdd874f9e8a9dccf45e31b9e93.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Harry Potter
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[5].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/7f/14/72/8e1e69f00d415fb2c8c44e0de8e84b2f.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Kafka bên bờ biển
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[6].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/b2/08/df/2a2d847ac42be5f2c75c044e57f2e041.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Nhà giả kim
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[7].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/45/3b/fc/d41c5f83e9e250e86e10d399c6c5bcdf.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Đắc nhân tâm
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[8].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/d0/32/f5/6c40656cfb4a6b5ba0adcd5bb0ce5b7f.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Tư duy nhanh và chậm
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[9].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/52/ee/06/04b0f7156929cec2f1f048be9b4cf854.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Sapiens
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[10].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/16d6e54de2afa9a0b98d08044583fa06.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // 1984
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[11].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/d8/55/f2/0f5e5cfab77ccf9b374edbea9aa1f68b.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Mật mã Da Vinci
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[12].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/df/e5/3e/f5e1e96b0e9e9f4876e36c5ae27a0ed8.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Tắt đèn
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[13].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/ea/60/62/db0d5f6d3c18a9e00c4b037d0d843e44.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Số đỏ
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[14].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/32/25/a5/a0e7460814f37c97cf9d2e0d2f1e1e8f.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Dạy con làm giàu
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[15].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/cc/06/0f/8d736a11c1e51220c0ae5e4f6b6e8bfe.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Nghĩ giàu làm giàu
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[16].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/d0/7c/9c/7e48d7e8a8c688e72c0deeb34b0acef0.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // 7 Thói quen
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[17].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/66/8e/42/04b2af0e281b41a7adf11e802e0f30d8.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Ông già và biển cả
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[18].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/ba/c6/46/87b0bf9ab05f0af5d61da7dd07fcfe38.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Gatsby vĩ đại
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[19].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/5d/72/b7/6c1f1c0a1f0f844a41f25c16a7b2f70b.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Chiến tranh và Hòa bình
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[20].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/ec/d3/52/4e2da49d26ff17cb7e9a0c9bb6fe1e1c.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Nhà lãnh đạo không chức danh
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[21].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/14/53/76/45698c0a3f006e0b14f4f4f15ce5e36e.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Cánh đồng bất tận
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[22].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/5e/2b/6e/c2f44aaf8ff48c9e0ef58a7a12c2b1e9.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Tuổi trẻ đáng giá bao nhiêu
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[23].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/42/68/20/dd3ff04b36a05dc0933b8e2868fd4e58.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                },
                // Đời thừa
                new BookImage
                {
                    Id = Guid.NewGuid(),
                    BookId = books[24].Id,
                    ImageUrl = "https://salt.tikicdn.com/cache/w1200/ts/product/e6/fc/64/9f62da9d1a4b50a4c8c33d8b0d8fbce1.jpg",
                    IsCover = true,
                    DisplayOrder = 1
                }
            };

            await context.BookImages.AddRangeAsync(bookImages);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Seeded {books.Count} books with {bookAuthors.Count} author relationships, {bookCategories.Count} category relationships, and {bookImages.Count} images!");
        }
    }
}
