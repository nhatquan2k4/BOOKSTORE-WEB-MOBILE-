using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class AuthorSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Authors.AnyAsync())
                return;

            var authors = new[]
            {
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Nguyễn Nhật Ánh",
                    Biography = "Nhà văn nổi tiếng Việt Nam, tác giả của nhiều tác phẩm văn học thiếu nhi và tuổi teen được yêu thích.",
                    AvartarUrl = "/images/authors/nguyen-nhat-anh.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Tô Hoài",
                    Biography = "Nhà văn lớn của văn học Việt Nam hiện đại, tác giả Dế Mèn phiêu lưu ký.",
                    AvartarUrl = "/images/authors/to-hoai.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Nam Cao",
                    Biography = "Nhà văn hiện thực xuất sắc, tác giả Chi Phèo, Lão Hạc và nhiều tác phẩm kinh điển khác.",
                    AvartarUrl = "/images/authors/nam-cao.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Ngô Tất Tố",
                    Biography = "Nhà văn nổi tiếng với tác phẩm Tắt đèn - một trong những tác phẩm văn học Việt Nam quan trọng nhất.",
                    AvartarUrl = "/images/authors/ngo-tat-to.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Nguyễn Du",
                    Biography = "Đại thi hào Việt Nam, tác giả Truyện Kiều - tác phẩm văn học lưu danh thiên cổ.",
                    AvartarUrl = "/images/authors/nguyen-du.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "J.K. Rowling",
                    Biography = "Tác giả người Anh nổi tiếng thế giới với series Harry Potter.",
                    AvartarUrl = "/images/authors/jk-rowling.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Haruki Murakami",
                    Biography = "Nhà văn Nhật Bản đương đại, tác giả của nhiều tác phẩm văn học hiện đại nổi tiếng.",
                    AvartarUrl = "/images/authors/haruki-murakami.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Paulo Coelho",
                    Biography = "Nhà văn Brazil nổi tiếng, tác giả Nhà giả kim - một trong những cuốn sách bán chạy nhất mọi thời đại.",
                    AvartarUrl = "/images/authors/paulo-coelho.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Dale Carnegie",
                    Biography = "Tác giả người Mỹ nổi tiếng với các tác phẩm về kỹ năng sống và phát triển bản thân.",
                    AvartarUrl = "/images/authors/dale-carnegie.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Tony Buzan",
                    Biography = "Chuyên gia tâm lý học, tác giả phương pháp Mind Map nổi tiếng.",
                    AvartarUrl = "/images/authors/tony-buzan.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Stephen King",
                    Biography = "Ông vua truyện kinh dị người Mỹ với hàng trăm tác phẩm bán chạy.",
                    AvartarUrl = "/images/authors/stephen-king.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "George Orwell",
                    Biography = "Nhà văn và nhà báo người Anh, tác giả 1984 và Trại súc vật.",
                    AvartarUrl = "/images/authors/george-orwell.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Yuval Noah Harari",
                    Biography = "Sử học và triết gia người Israel, tác giả Sapiens - Lược sử loài người.",
                    AvartarUrl = "/images/authors/yuval-harari.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Malcolm Gladwell",
                    Biography = "Nhà báo và tác giả người Canada-Anh, nổi tiếng với các tác phẩm về tâm lý học xã hội.",
                    AvartarUrl = "/images/authors/malcolm-gladwell.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Rosie Nguyễn",
                    Biography = "Tác giả trẻ Việt Nam với các tác phẩm về phát triển bản thân và tư duy tích cực.",
                    AvartarUrl = "/images/authors/rosie-nguyen.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Nguyễn Ngọc Tư",
                    Biography = "Nhà văn Việt Nam đương đại, tác giả Sông, Cánh đồng bất tận.",
                    AvartarUrl = "/images/authors/nguyen-ngoc-tu.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Anh Khang",
                    Biography = "Tác giả trẻ Việt Nam với nhiều tác phẩm văn học tuổi teen được yêu thích.",
                    AvartarUrl = "/images/authors/anh-khang.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Nguyễn Văn Học",
                    Biography = "Nhà văn nổi tiếng với các tác phẩm về đề tài nông thôn Việt Nam.",
                    AvartarUrl = "/images/authors/nguyen-van-hoc.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Tôn Nữ Quỳnh Trân",
                    Biography = "Tác giả của loạt sách Vườn địa đàng và các tác phẩm văn học thiếu nhi.",
                    AvartarUrl = "/images/authors/ton-nu-quynh-tran.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Ernest Hemingway",
                    Biography = "Nhà văn Mỹ đoạt giải Nobel Văn học, tác giả Ông già và biển cả.",
                    AvartarUrl = "/images/authors/ernest-hemingway.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "F. Scott Fitzgerald",
                    Biography = "Tiểu thuyết gia người Mỹ, tác giả Gatsby vĩ đại.",
                    AvartarUrl = "/images/authors/f-scott-fitzgerald.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Jane Austen",
                    Biography = "Nữ văn sĩ Anh nổi tiếng với các tiểu thuyết lãng mạn như Kiêu hãnh và Định kiến.",
                    AvartarUrl = "/images/authors/jane-austen.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Leo Tolstoy",
                    Biography = "Nhà văn vĩ đại người Nga, tác giả Chiến tranh và Hòa bình, Anna Karenina.",
                    AvartarUrl = "/images/authors/leo-tolstoy.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Fyodor Dostoevsky",
                    Biography = "Tiểu thuyết gia và triết gia người Nga, tác giả Tội ác và hình phạt.",
                    AvartarUrl = "/images/authors/fyodor-dostoevsky.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Gabriel García Márquez",
                    Biography = "Nhà văn Colombia đoạt giải Nobel, tác giả Trăm năm cô đơn.",
                    AvartarUrl = "/images/authors/gabriel-garcia-marquez.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Dan Brown",
                    Biography = "Tác giả người Mỹ nổi tiếng với các tiểu thuyết trinh thám như Mật mã Da Vinci.",
                    AvartarUrl = "/images/authors/dan-brown.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Agatha Christie",
                    Biography = "Nữ hoàng truyện trinh thám người Anh với hơn 80 tác phẩm.",
                    AvartarUrl = "/images/authors/agatha-christie.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Robin Sharma",
                    Biography = "Tác giả người Canada, chuyên gia về lãnh đạo và phát triển bản thân.",
                    AvartarUrl = "/images/authors/robin-sharma.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Napoleon Hill",
                    Biography = "Tác giả người Mỹ, nổi tiếng với cuốn Nghĩ giàu làm giàu.",
                    AvartarUrl = "/images/authors/napoleon-hill.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Robert Kiyosaki",
                    Biography = "Doanh nhân và tác giả người Mỹ, tác giả Dạy con làm giàu.",
                    AvartarUrl = "/images/authors/robert-kiyosaki.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Stephen Covey",
                    Biography = "Tác giả người Mỹ nổi tiếng với 7 Thói quen của người thành đạt.",
                    AvartarUrl = "/images/authors/stephen-covey.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Daniel Kahneman",
                    Biography = "Nhà tâm lý học đoạt giải Nobel Kinh tế, tác giả Tư duy nhanh và chậm.",
                    AvartarUrl = "/images/authors/daniel-kahneman.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Vũ Trọng Phụng",
                    Biography = "Nhà văn Việt Nam thời kỳ Pháp thuộc, tác giả Số đỏ, Dumb Luck.",
                    AvartarUrl = "/images/authors/vu-trong-phung.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Nguyễn Tuân",
                    Biography = "Nhà văn Việt Nam với phong cách viết độc đáo, tác giả Vang bóng một thời.",
                    AvartarUrl = "/images/authors/nguyen-tuan.jpg"
                },
                new Author
                {
                    Id = Guid.NewGuid(),
                    Name = "Tạ Duy Anh",
                    Biography = "Nhà văn hóa học người Việt, tác giả Việt Nam văn hóa sử cương.",
                    AvartarUrl = "/images/authors/ta-duy-anh.jpg"
                }
            };

            await context.Authors.AddRangeAsync(authors);
            await context.SaveChangesAsync();
            
            Console.WriteLine($"✅ Seeded {authors.Length} authors!");
        }
    }
}
