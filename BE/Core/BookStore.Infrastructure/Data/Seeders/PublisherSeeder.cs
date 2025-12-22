using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class PublisherSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Publishers.AnyAsync())
                return;

            var publishers = new[]
            {
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Trẻ",
                    Address = "161B Lý Chính Thắng, Phường 7, Quận 3, TP.HCM",
                    Email = "info@nxbtre.com.vn",
                    PhoneNumber = "028-39316211"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Kim Đồng",
                    Address = "55 Quang Trung, Quận Hai Bà Trưng, Hà Nội",
                    Email = "info@nxbkimdong.com.vn",
                    PhoneNumber = "024-39434730"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Văn học",
                    Address = "18 Nguyễn Trường Tộ, Ba Đình, Hà Nội",
                    Email = "info@nxbvanhoc.com.vn",
                    PhoneNumber = "024-38222135"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Hội Nhà Văn",
                    Address = "65 Nguyễn Du, Quận 1, TP.HCM",
                    Email = "info@nxbhoinv.com.vn",
                    PhoneNumber = "028-38216009"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Lao Động",
                    Address = "175 Giảng Võ, Đống Đa, Hà Nội",
                    Email = "info@nxblaodong.com.vn",
                    PhoneNumber = "024-38515380"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Thanh Niên",
                    Address = "64 Bà Triệu, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbthanhnien.vn",
                    PhoneNumber = "024-39424018"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Tổng hợp TP.HCM",
                    Address = "62 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
                    Email = "info@nxbhcm.com.vn",
                    PhoneNumber = "028-38225340"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Phụ nữ",
                    Address = "39 Hàng Chuối, Phường Phạm Đình Hổ, Hai Bà Trưng, Hà Nội",
                    Email = "info@nxbphunu.com.vn",
                    PhoneNumber = "024-39714899"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Hà Nội",
                    Address = "50 Hàng Bài, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbhanoi.com.vn",
                    PhoneNumber = "024-38269345"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Dân Trí",
                    Address = "9 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
                    Email = "info@nxbdantri.com.vn",
                    PhoneNumber = "024-35742345"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "First News - Trí Việt",
                    Address = "Tầng 7, 162-164 Lý Chính Thắng, Phường 9, Quận 3, TP.HCM",
                    Email = "info@firstnews.com.vn",
                    PhoneNumber = "028-39430309"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Thế Giới",
                    Address = "46 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
                    Email = "info@thegioipublishers.vn",
                    PhoneNumber = "024-38253841"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Alphabooks",
                    Address = "Tầng 5, 104 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
                    Email = "info@alphabooks.vn",
                    PhoneNumber = "028-62701919"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Đại học Quốc gia Hà Nội",
                    Address = "16 Hàng Chuối, Hai Bà Trưng, Hà Nội",
                    Email = "info@vnupress.vnu.edu.vn",
                    PhoneNumber = "024-38694534"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Chính trị Quốc gia - Sự thật",
                    Address = "6/86 Duy Tân, Cầu Giấy, Hà Nội",
                    Email = "info@nxbctqg.org.vn",
                    PhoneNumber = "024-38221811"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Tri Thức",
                    Address = "27 Nguyễn Trường Tộ, Ba Đình, Hà Nội",
                    Email = "info@nxbtrithuc.vn",
                    PhoneNumber = "024-37733544"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Giao thông Vận tải",
                    Address = "80A Núi Trúc, Ba Đình, Hà Nội",
                    Email = "info@nxbgtvt.vn",
                    PhoneNumber = "024-37663388"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Công an Nhân dân",
                    Address = "47 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội",
                    Email = "info@nxbcand.vn",
                    PhoneNumber = "024-37692788"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Khoa học và Kỹ thuật",
                    Address = "46 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbkhkt.vn",
                    PhoneNumber = "024-39422131"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Hồng Đức",
                    Address = "65 Tràng Thi, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbhongduc.vn",
                    PhoneNumber = "024-39260024"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "IPM (Thái Hà Books)",
                    Address = "Số 7 Ngõ 150 Thái Hà, Đống Đa, Hà Nội",
                    Email = "info@ipm.vn",
                    PhoneNumber = "024-35631632"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Thông tin và Truyền thông",
                    Address = "115 Trần Duy Hưng, Cầu Giấy, Hà Nội",
                    Email = "info@nxbthongtin.vn",
                    PhoneNumber = "024-37834924"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Tài chính",
                    Address = "27B Lý Thường Kiệt, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbtaichinh.vn",
                    PhoneNumber = "024-39420908"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Văn hóa Văn nghệ",
                    Address = "51 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbvhvn.com.vn",
                    PhoneNumber = "024-39434082"
                },
                new Publisher
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhà xuất bản Giáo dục Việt Nam",
                    Address = "81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
                    Email = "info@nxbgd.vn",
                    PhoneNumber = "024-38220801"
                }
            };

            await context.Publishers.AddRangeAsync(publishers);
            await context.SaveChangesAsync();
            
            Console.WriteLine($"✅ Seeded {publishers.Length} publishers!");
        }
    }
}
