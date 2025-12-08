using BookStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class UserSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Users.AnyAsync())
                return;

            // Get roles
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            var userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            var shipperRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Shipper");

            if (adminRole == null || userRole == null || shipperRole == null)
            {
                throw new InvalidOperationException("Roles must be seeded before users. Run RoleSeeder first.");
            }

            // Tạo users
            var users = new[]
            {
                // Admin user
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "admin@bookstore.vn",
                    // Password: Admin@123 (should be hashed in real implementation)
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                
                // Regular users
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "nguyenvana@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "tranthib@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "levanc@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                
                // Shipper users
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "shipper1@bookstore.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Shipper@123"),
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "shipper2@bookstore.vn",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Shipper@123"),
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();

            // Gán roles cho users
            var userRoles = new List<UserRole>
            {
                // Admin user - role Admin
                new UserRole
                {
                    UserId = users[0].Id,
                    RoleId = adminRole.Id
                },
                
                // Regular users - role User
                new UserRole
                {
                    UserId = users[1].Id,
                    RoleId = userRole.Id
                },
                new UserRole
                {
                    UserId = users[2].Id,
                    RoleId = userRole.Id
                },
                new UserRole
                {
                    UserId = users[3].Id,
                    RoleId = userRole.Id
                },
                
                // Shipper users - role Shipper
                new UserRole
                {
                    UserId = users[4].Id,
                    RoleId = shipperRole.Id
                },
                new UserRole
                {
                    UserId = users[5].Id,
                    RoleId = shipperRole.Id
                }
            };

            await context.UserRoles.AddRangeAsync(userRoles);
            await context.SaveChangesAsync();

            // Tạo user profiles
            var userProfiles = new[]
            {
                new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = users[0].Id,
                    FullName = "Quản trị viên",
                    PhoneNumber = "0901234567",
                    DateOfBirth = new DateTime(1990, 1, 1),
                    Gender = "Nam",
                    AvatarUrl = "/images/avatars/admin.jpg"
                },
                new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = users[1].Id,
                    FullName = "Nguyễn Văn A",
                    PhoneNumber = "0912345678",
                    DateOfBirth = new DateTime(1995, 5, 15),
                    Gender = "Nam",
                    AvatarUrl = "/images/avatars/user1.jpg"
                },
                new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = users[2].Id,
                    FullName = "Trần Thị B",
                    PhoneNumber = "0923456789",
                    DateOfBirth = new DateTime(1998, 8, 20),
                    Gender = "Nữ",
                    AvatarUrl = "/images/avatars/user2.jpg"
                },
                new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = users[3].Id,
                    FullName = "Lê Văn C",
                    PhoneNumber = "0934567890",
                    DateOfBirth = new DateTime(1992, 12, 10),
                    Gender = "Nam",
                    AvatarUrl = "/images/avatars/user3.jpg"
                },
                new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = users[4].Id,
                    FullName = "Phạm Văn Shipper 1",
                    PhoneNumber = "0945678901",
                    DateOfBirth = new DateTime(1993, 3, 25),
                    Gender = "Nam",
                    AvatarUrl = "/images/avatars/shipper1.jpg"
                },
                new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = users[5].Id,
                    FullName = "Hoàng Thị Shipper 2",
                    PhoneNumber = "0956789012",
                    DateOfBirth = new DateTime(1996, 7, 30),
                    Gender = "Nữ",
                    AvatarUrl = "/images/avatars/shipper2.jpg"
                }
            };

            await context.UserProfiles.AddRangeAsync(userProfiles);
            await context.SaveChangesAsync();
        }
    }
}
