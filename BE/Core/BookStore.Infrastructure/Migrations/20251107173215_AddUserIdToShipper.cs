using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToShipper : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                schema: "shipping",
                table: "Shippers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Shippers_UserId",
                schema: "shipping",
                table: "Shippers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Shippers_Users_UserId",
                schema: "shipping",
                table: "Shippers",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

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
            migrationBuilder.DropForeignKey(
                name: "FK_Shippers_Users_UserId",
                schema: "shipping",
                table: "Shippers");

            migrationBuilder.DropIndex(
                name: "IX_Shippers_UserId",
                schema: "shipping",
                table: "Shippers");

            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "shipping",
                table: "Shippers");
        }
    }
}
