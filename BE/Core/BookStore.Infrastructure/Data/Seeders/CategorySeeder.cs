using BookStore.Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class CategorySeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Categories.AnyAsync())
                return;

            // Tạo danh mục cha
            var vanHocParent = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Văn học",
                Description = "Các tác phẩm văn học trong và ngoài nước",
                ParentId = null
            };

            var kinhTeParent = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Kinh tế",
                Description = "Sách về kinh tế, kinh doanh và quản trị",
                ParentId = null
            };

            var kyNangSongParent = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Kỹ năng sống",
                Description = "Phát triển bản thân và kỹ năng mềm",
                ParentId = null
            };

            var thieuNhiParent = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Thiếu nhi",
                Description = "Sách dành cho trẻ em và thanh thiếu niên",
                ParentId = null
            };

            var khcnParent = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Khoa học - Công nghệ",
                Description = "Sách về khoa học, công nghệ và tin học",
                ParentId = null
            };

            var lichSuParent = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Lịch sử",
                Description = "Sách về lịch sử và nhân vật lịch sử",
                ParentId = null
            };

            await context.Categories.AddRangeAsync(new[]
            {
                vanHocParent,
                kinhTeParent,
                kyNangSongParent,
                thieuNhiParent,
                khcnParent,
                lichSuParent
            });

            await context.SaveChangesAsync();

            // Tạo danh mục con
            var subCategories = new[]
            {
                // Văn học con
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Văn học Việt Nam",
                    Description = "Tác phẩm văn học của các tác giả Việt Nam",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Văn học nước ngoài",
                    Description = "Tác phẩm văn học được dịch từ nước ngoài",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Tiểu thuyết",
                    Description = "Thể loại tiểu thuyết các loại",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Truyện ngắn",
                    Description = "Tuyển tập truyện ngắn",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Thơ ca",
                    Description = "Các tác phẩm thơ",
                    ParentId = vanHocParent.Id
                },

                // Kinh tế con
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Quản trị kinh doanh",
                    Description = "Sách về quản lý và điều hành doanh nghiệp",
                    ParentId = kinhTeParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Marketing - Bán hàng",
                    Description = "Chiến lược marketing và kỹ thuật bán hàng",
                    ParentId = kinhTeParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Khởi nghiệp",
                    Description = "Hướng dẫn khởi nghiệp và xây dựng startup",
                    ParentId = kinhTeParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Tài chính - Đầu tư",
                    Description = "Kiến thức về tài chính cá nhân và đầu tư",
                    ParentId = kinhTeParent.Id
                },

                // Kỹ năng sống con
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Giao tiếp và ứng xử",
                    Description = "Kỹ năng giao tiếp và ứng xử xã hội",
                    ParentId = kyNangSongParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Tư duy và sáng tạo",
                    Description = "Phát triển tư duy logic và sáng tạo",
                    ParentId = kyNangSongParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Quản lý thời gian",
                    Description = "Kỹ năng sắp xếp và quản lý thời gian hiệu quả",
                    ParentId = kyNangSongParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Tâm lý học",
                    Description = "Kiến thức về tâm lý và hành vi con người",
                    ParentId = kyNangSongParent.Id
                },

                // Thiếu nhi con
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Truyện tranh",
                    Description = "Truyện tranh cho thiếu nhi",
                    ParentId = thieuNhiParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Truyện cổ tích",
                    Description = "Truyện cổ tích Việt Nam và thế giới",
                    ParentId = thieuNhiParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Văn học tuổi teen",
                    Description = "Sách dành cho lứa tuổi thanh thiếu niên",
                    ParentId = thieuNhiParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Kiến thức bách khoa",
                    Description = "Sách kiến thức tổng hợp cho trẻ em",
                    ParentId = thieuNhiParent.Id
                },

                // Khoa học - Công nghệ con
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Lập trình",
                    Description = "Sách về các ngôn ngữ lập trình và phát triển phần mềm",
                    ParentId = khcnParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Trí tuệ nhân tạo",
                    Description = "AI, Machine Learning và Deep Learning",
                    ParentId = khcnParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Khoa học tự nhiên",
                    Description = "Vật lý, hóa học, sinh học",
                    ParentId = khcnParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Công nghệ thông tin",
                    Description = "Kiến thức về IT và các công nghệ mới",
                    ParentId = khcnParent.Id
                },

                // Lịch sử con
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Lịch sử Việt Nam",
                    Description = "Lịch sử dân tộc Việt Nam qua các thời kỳ",
                    ParentId = lichSuParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Lịch sử thế giới",
                    Description = "Lịch sử các quốc gia và nền văn minh thế giới",
                    ParentId = lichSuParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Nhân vật lịch sử",
                    Description = "Tiểu sử và câu chuyện về các nhân vật lịch sử",
                    ParentId = lichSuParent.Id
                },
                
                // Thêm categories mới
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Trinh thám - Bí ẩn",
                    Description = "Tiểu thuyết trinh thám và bí ẩn",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Kinh dị",
                    Description = "Truyện kinh dị, ma quái",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Lãng mạn",
                    Description = "Tiểu thuyết tình cảm, lãng mạn",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Phiêu lưu - Mạo hiểm",
                    Description = "Truyện phiêu lưu và mạo hiểm",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Khoa học viễn tưởng",
                    Description = "Tiểu thuyết khoa học viễn tưởng",
                    ParentId = vanHocParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Kỹ năng lãnh đạo",
                    Description = "Phát triển kỹ năng lãnh đạo và quản lý",
                    ParentId = kyNangSongParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Sức khỏe - Làm đẹp",
                    Description = "Chăm sóc sức khỏe và ngoại hình",
                    ParentId = kyNangSongParent.Id
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Nuôi dạy con",
                    Description = "Kiến thức về nuôi dạy và giáo dục trẻ",
                    ParentId = kyNangSongParent.Id
                }
            };

            await context.Categories.AddRangeAsync(subCategories);
            await context.SaveChangesAsync();
            
            Console.WriteLine($"✅ Seeded 6 parent categories and {subCategories.Length} sub-categories!");
        }
    }
}
