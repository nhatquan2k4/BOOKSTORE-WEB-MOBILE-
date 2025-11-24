using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedRolesData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Thêm Role "Admin" nếu chưa tồn tại
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM [identity].[Roles] WHERE [Name] = 'Admin')
                BEGIN
                    INSERT INTO [identity].[Roles] (Id, Name, Description)
                    VALUES (NEWID(), 'Admin', N'Quản trị viên')
                END
            ");

            // Thêm Role "User" nếu chưa tồn tại
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM [identity].[Roles] WHERE [Name] = 'User')
                BEGIN
                    INSERT INTO [identity].[Roles] (Id, Name, Description)
                    VALUES (NEWID(), 'User', N'Khách hàng')
                END
            ");

            // Thêm Role "Shipper" nếu chưa tồn tại
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM [identity].[Roles] WHERE [Name] = 'Shipper')
                BEGIN
                    INSERT INTO [identity].[Roles] (Id, Name, Description)
                    VALUES (NEWID(), 'Shipper', N'Nhân viên giao hàng')
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa role khi rollback migration
            migrationBuilder.Sql(@"
                DELETE FROM [identity].[Roles] WHERE [Name] IN ('Admin', 'User', 'Shipper')
            ");
        }
    }
}
