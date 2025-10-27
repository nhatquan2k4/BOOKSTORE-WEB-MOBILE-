using BookStore.Domain.Entities.Identity;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.Entities.Common;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.Entities.Shipping;
using BookStore.Domain.Entities.Rental;
using BookStore.Domain.Entities.Analytics___Activity;
using BookStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using BookStore.Domain.Entities.Pricing_Inventory;

namespace BookStore.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        #region Identity
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<UserRole> UserRoles { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<RolePermission> RolePermissions { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<UserDevice> UserDevices { get; set; } = null!;
        public DbSet<UserAddress> UserAddresses { get; set; } = null!;
        public DbSet<UserProfile> UserProfiles { get; set; } = null!;
        #endregion

        #region Catalog
        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<Author> Authors { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Publisher> Publishers { get; set; } = null!;
        public DbSet<BookAuthor> BookAuthors { get; set; } = null!;
        public DbSet<BookCategory> BookCategories { get; set; } = null!;
        public DbSet<BookFile> BookFiles { get; set; } = null!;
        public DbSet<BookFormat> BookFormats { get; set; } = null!;
        public DbSet<BookImage> BookImages { get; set; } = null!;
        public DbSet<BookMetadata> BookMetadata { get; set; } = null!;
        #endregion

        #region Pricing & Inventory
        public DbSet<Price> Prices { get; set; } = null!;
        public DbSet<Discount> Discounts { get; set; } = null!;
        public DbSet<Coupon> Coupons { get; set; } = null!;
        public DbSet<StockItem> StockItems { get; set; } = null!;
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; } = null!;
        public DbSet<Warehouse> Warehouses { get; set; } = null!;
        #endregion

        #region Review
        public DbSet<Review> Reviews { get; set; } = null!;
        #endregion

        #region Ordering & Payment
        public DbSet<Cart> Carts { get; set; } = null!;
        public DbSet<CartItem> CartItems { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<OrderAddress> OrderAddresses { get; set; } = null!;
        public DbSet<OrderStatusLog> OrderStatusLogs { get; set; } = null!;
        public DbSet<OrderHistory> OrderHistories { get; set; } = null!;
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; } = null!;
        public DbSet<PaymentMethod> PaymentMethods { get; set; } = null!;
        public DbSet<PaymentProvider> PaymentProviders { get; set; } = null!;
        public DbSet<Refund> Refunds { get; set; } = null!;
        #endregion

        #region Shipping
        public DbSet<Shipment> Shipments { get; set; } = null!;
        public DbSet<ShipmentRoutePoint> ShipmentRoutePoints { get; set; } = null!;
        public DbSet<ShipmentStatus> ShipmentStatuses { get; set; } = null!;
        public DbSet<Shipper> Shippers { get; set; } = null!;
        #endregion

        #region Rental
        public DbSet<RentalPlan> RentalPlans { get; set; } = null!;
        public DbSet<BookRental> BookRentals { get; set; } = null!;
        public DbSet<RentalHistory> RentalHistories { get; set; } = null!;
        public DbSet<RentalAccessToken> RentalAccessTokens { get; set; } = null!;
        #endregion

        #region Analytics / Activity
        public DbSet<UserActivity> UserActivities { get; set; } = null!;
        public DbSet<BookView> BookViews { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        #endregion

        #region System
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<ErrorLogs> ErrorLogs { get; set; } = null!;
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //  Load toàn bộ configuration tự động từ Assembly
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            //  Global Query Filter cho soft delete
            modelBuilder.Entity<Review>().HasQueryFilter(e => !e.IsDeleted);

            base.OnModelCreating(modelBuilder);
        }
    }
}
