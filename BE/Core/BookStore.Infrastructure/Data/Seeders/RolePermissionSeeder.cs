using BookStore.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Data.Seeders
{
    public static class RolePermissionSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Kiểm tra xem đã có dữ liệu chưa
            if (await context.Roles.AnyAsync() || await context.Permissions.AnyAsync())
            {
                return; // Đã có dữ liệu, không cần seed
            }

            // ===== ĐỊNH NGHĨA CÁC PERMISSIONS =====
            var permissions = new List<Permission>
            {
                // Book Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Book.View", Description = "Xem thông tin sách" },
                new Permission { Id = Guid.NewGuid(), Name = "Book.Create", Description = "Tạo sách mới" },
                new Permission { Id = Guid.NewGuid(), Name = "Book.Update", Description = "Cập nhật thông tin sách" },
                new Permission { Id = Guid.NewGuid(), Name = "Book.Delete", Description = "Xóa sách" },
                
                // Category Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Category.View", Description = "Xem danh mục" },
                new Permission { Id = Guid.NewGuid(), Name = "Category.Create", Description = "Tạo danh mục mới" },
                new Permission { Id = Guid.NewGuid(), Name = "Category.Update", Description = "Cập nhật danh mục" },
                new Permission { Id = Guid.NewGuid(), Name = "Category.Delete", Description = "Xóa danh mục" },
                
                // Author Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Author.View", Description = "Xem tác giả" },
                new Permission { Id = Guid.NewGuid(), Name = "Author.Create", Description = "Tạo tác giả mới" },
                new Permission { Id = Guid.NewGuid(), Name = "Author.Update", Description = "Cập nhật tác giả" },
                new Permission { Id = Guid.NewGuid(), Name = "Author.Delete", Description = "Xóa tác giả" },
                
                // Order Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Order.View", Description = "Xem đơn hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Order.ViewAll", Description = "Xem tất cả đơn hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Order.Create", Description = "Tạo đơn hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Order.Update", Description = "Cập nhật đơn hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Order.Cancel", Description = "Hủy đơn hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Order.Delete", Description = "Xóa đơn hàng" },
                
                // User Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "User.View", Description = "Xem người dùng" },
                new Permission { Id = Guid.NewGuid(), Name = "User.ViewAll", Description = "Xem tất cả người dùng" },
                new Permission { Id = Guid.NewGuid(), Name = "User.Create", Description = "Tạo người dùng mới" },
                new Permission { Id = Guid.NewGuid(), Name = "User.Update", Description = "Cập nhật người dùng" },
                new Permission { Id = Guid.NewGuid(), Name = "User.Delete", Description = "Xóa người dùng" },
                new Permission { Id = Guid.NewGuid(), Name = "User.UpdateProfile", Description = "Cập nhật hồ sơ cá nhân" },
                
                // Role Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Role.View", Description = "Xem vai trò" },
                new Permission { Id = Guid.NewGuid(), Name = "Role.Create", Description = "Tạo vai trò mới" },
                new Permission { Id = Guid.NewGuid(), Name = "Role.Update", Description = "Cập nhật vai trò" },
                new Permission { Id = Guid.NewGuid(), Name = "Role.Delete", Description = "Xóa vai trò" },
                new Permission { Id = Guid.NewGuid(), Name = "Role.AssignPermission", Description = "Gán quyền cho vai trò" },
                
                // Inventory Management Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Inventory.View", Description = "Xem kho hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Inventory.Update", Description = "Cập nhật kho hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Inventory.Import", Description = "Nhập kho" },
                new Permission { Id = Guid.NewGuid(), Name = "Inventory.Export", Description = "Xuất kho" },
                
                // Pricing & Discount Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Price.View", Description = "Xem giá" },
                new Permission { Id = Guid.NewGuid(), Name = "Price.Update", Description = "Cập nhật giá" },
                new Permission { Id = Guid.NewGuid(), Name = "Discount.View", Description = "Xem khuyến mãi" },
                new Permission { Id = Guid.NewGuid(), Name = "Discount.Create", Description = "Tạo khuyến mãi" },
                new Permission { Id = Guid.NewGuid(), Name = "Discount.Update", Description = "Cập nhật khuyến mãi" },
                new Permission { Id = Guid.NewGuid(), Name = "Discount.Delete", Description = "Xóa khuyến mãi" },
                
                // Shipping Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Shipment.View", Description = "Xem thông tin vận chuyển" },
                new Permission { Id = Guid.NewGuid(), Name = "Shipment.ViewAll", Description = "Xem tất cả vận chuyển" },
                new Permission { Id = Guid.NewGuid(), Name = "Shipment.Create", Description = "Tạo đơn vận chuyển" },
                new Permission { Id = Guid.NewGuid(), Name = "Shipment.Update", Description = "Cập nhật trạng thái vận chuyển" },
                new Permission { Id = Guid.NewGuid(), Name = "Shipment.AssignShipper", Description = "Phân công shipper" },
                new Permission { Id = Guid.NewGuid(), Name = "Shipment.UpdateStatus", Description = "Cập nhật trạng thái giao hàng" },
                
                // Review Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Review.View", Description = "Xem đánh giá" },
                new Permission { Id = Guid.NewGuid(), Name = "Review.Create", Description = "Tạo đánh giá" },
                new Permission { Id = Guid.NewGuid(), Name = "Review.Update", Description = "Cập nhật đánh giá" },
                new Permission { Id = Guid.NewGuid(), Name = "Review.Delete", Description = "Xóa đánh giá" },
                new Permission { Id = Guid.NewGuid(), Name = "Review.Moderate", Description = "Kiểm duyệt đánh giá" },
                
                // Cart Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Cart.View", Description = "Xem giỏ hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Cart.AddItem", Description = "Thêm sản phẩm vào giỏ" },
                new Permission { Id = Guid.NewGuid(), Name = "Cart.RemoveItem", Description = "Xóa sản phẩm khỏi giỏ" },
                new Permission { Id = Guid.NewGuid(), Name = "Cart.UpdateItem", Description = "Cập nhật giỏ hàng" },
                new Permission { Id = Guid.NewGuid(), Name = "Cart.Clear", Description = "Xóa giỏ hàng" },
                
                // Rental Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Rental.View", Description = "Xem thuê sách" },
                new Permission { Id = Guid.NewGuid(), Name = "Rental.Create", Description = "Thuê sách" },
                new Permission { Id = Guid.NewGuid(), Name = "Rental.Return", Description = "Trả sách" },
                new Permission { Id = Guid.NewGuid(), Name = "Rental.Extend", Description = "Gia hạn thuê sách" },
                
                // Payment Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Payment.View", Description = "Xem thanh toán" },
                new Permission { Id = Guid.NewGuid(), Name = "Payment.ViewAll", Description = "Xem tất cả thanh toán" },
                new Permission { Id = Guid.NewGuid(), Name = "Payment.Process", Description = "Xử lý thanh toán" },
                new Permission { Id = Guid.NewGuid(), Name = "Payment.Refund", Description = "Hoàn tiền" },
                
                // Report & Analytics Permissions
                new Permission { Id = Guid.NewGuid(), Name = "Report.View", Description = "Xem báo cáo" },
                new Permission { Id = Guid.NewGuid(), Name = "Report.Export", Description = "Xuất báo cáo" },
                new Permission { Id = Guid.NewGuid(), Name = "Analytics.View", Description = "Xem phân tích" },
                
                // System Permissions
                new Permission { Id = Guid.NewGuid(), Name = "System.ViewLogs", Description = "Xem logs hệ thống" },
                new Permission { Id = Guid.NewGuid(), Name = "System.ManageSettings", Description = "Quản lý cài đặt hệ thống" },
                new Permission { Id = Guid.NewGuid(), Name = "System.ManageNotifications", Description = "Quản lý thông báo" }
            };

            await context.Permissions.AddRangeAsync(permissions);
            await context.SaveChangesAsync();

            // ===== ĐỊNH NGHĨA CÁC ROLES =====
            var adminRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Description = "Quản trị viên có toàn quyền trong hệ thống"
            };

            var userRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "User",
                Description = "Người dùng thông thường có thể mua sách, đánh giá và quản lý tài khoản cá nhân"
            };

            var shipperRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Shipper",
                Description = "Nhân viên giao hàng có thể xem và cập nhật trạng thái đơn hàng giao cho mình"
            };

            var roles = new List<Role> { adminRole, userRole, shipperRole };
            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();

            // ===== GÁN QUYỀN CHO CÁC ROLES =====
            var rolePermissions = new List<RolePermission>();

            // ADMIN - Có tất cả quyền
            foreach (var permission in permissions)
            {
                rolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id
                });
            }

            // USER - Quyền cơ bản
            var userPermissionNames = new[]
            {
                // Xem thông tin
                "Book.View",
                "Category.View",
                "Author.View",
                "Price.View",
                "Discount.View",
                
                // Quản lý tài khoản
                "User.View",
                "User.UpdateProfile",
                
                // Đơn hàng
                "Order.View",
                "Order.Create",
                "Order.Cancel",
                
                // Giỏ hàng
                "Cart.View",
                "Cart.AddItem",
                "Cart.RemoveItem",
                "Cart.UpdateItem",
                "Cart.Clear",
                
                // Đánh giá
                "Review.View",
                "Review.Create",
                "Review.Update",
                "Review.Delete",
                
                // Thanh toán
                "Payment.View",
                "Payment.Process",
                
                // Thuê sách
                "Rental.View",
                "Rental.Create",
                "Rental.Return",
                "Rental.Extend"
            };

            foreach (var permissionName in userPermissionNames)
            {
                var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
                if (permission != null)
                {
                    rolePermissions.Add(new RolePermission
                    {
                        RoleId = userRole.Id,
                        PermissionId = permission.Id
                    });
                }
            }

            // SHIPPER - Quyền liên quan đến vận chuyển
            var shipperPermissionNames = new[]
            {
                // Xem thông tin cơ bản
                "Book.View",
                "Category.View",
                
                // Đơn hàng
                "Order.View",
                "Order.Update",
                
                // Vận chuyển
                "Shipment.View",
                "Shipment.ViewAll",
                "Shipment.Update",
                "Shipment.UpdateStatus",
                
                // Cập nhật hồ sơ cá nhân
                "User.View",
                "User.UpdateProfile"
            };

            foreach (var permissionName in shipperPermissionNames)
            {
                var permission = permissions.FirstOrDefault(p => p.Name == permissionName);
                if (permission != null)
                {
                    rolePermissions.Add(new RolePermission
                    {
                        RoleId = shipperRole.Id,
                        PermissionId = permission.Id
                    });
                }
            }

            await context.RolePermissions.AddRangeAsync(rolePermissions);
            await context.SaveChangesAsync();

            Console.WriteLine($"Seeded {permissions.Count} permissions, {roles.Count} roles, and {rolePermissions.Count} role-permission mappings.");
        }
    }
}