using BookStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class RoleSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            var roles = new[]
            {
                new Role { Name = "Admin", Description = "Quản trị viên" },
                new Role { Name = "User", Description = "Khách hàng" },
                new Role { Name = "Shipper", Description = "Nhân viên giao hàng" }
            };

            foreach (var role in roles)
            {
                if (!await context.Roles.AnyAsync(r => r.Name == role.Name))
                {
                    await context.Roles.AddAsync(role);
                }
            }

            await context.SaveChangesAsync();
        }
    }
}