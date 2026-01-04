namespace BookStore.Infrastructure.Data.Seeders
{

    public static class DatabaseSeeder
    {

        public static async Task SeedAllAsync(AppDbContext context)
        {
            // 1. Seed Identity - Roles và Permissions (phải seed trước)
            await RoleSeeder.SeedAsync(context);
            await RolePermissionSeeder.SeedAsync(context);
            
            // 2. Seed Catalog - các entity độc lập không có foreign key
            await AuthorSeeder.SeedAsync(context);
            await PublisherSeeder.SeedAsync(context);
            await CategorySeeder.SeedAsync(context);
            await BookFormatSeeder.SeedAsync(context);
            
            // 3. Seed Payment - phương thức thanh toán và provider
            await PaymentMethodSeeder.SeedAsync(context);
            await PaymentProviderSeeder.SeedAsync(context);
            
            // 4. Seed Inventory - kho hàng
            await WarehouseSeeder.SeedAsync(context);
            
            // 5. Seed Rental - gói thuê sách và subscription
            await RentalPlanSeeder.SeedAsync(context);

            // 6. Seed Users - phụ thuộc vào Roles
            await UserSeeder.SeedAsync(context);
            
            // 7. Seed Books - phụ thuộc vào Authors, Publishers, Categories, BookFormats
            await BookSeeder.SeedAsync(context);
            
            // 8. Seed Prices - phụ thuộc vào Books
            await PriceSeeder.SeedAsync(context);
            
            // 9. Seed Stock Items - phụ thuộc vào Books và Warehouses
            await StockItemSeeder.SeedAsync(context);
        }
    }
}


