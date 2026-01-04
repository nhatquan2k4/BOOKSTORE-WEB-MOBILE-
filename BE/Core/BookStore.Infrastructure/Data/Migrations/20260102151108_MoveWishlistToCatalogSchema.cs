using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MoveWishlistToCatalogSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookRentals_Books_BookId",
                schema: "rental",
                table: "BookRentals");

            migrationBuilder.DropForeignKey(
                name: "FK_StockItems_Books_BookId",
                table: "StockItems");

            migrationBuilder.RenameTable(
                name: "Wishlists",
                newName: "Wishlists",
                newSchema: "catalog");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                schema: "catalog",
                table: "Wishlists",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_UserId_BookId",
                schema: "catalog",
                table: "Wishlists",
                columns: new[] { "UserId", "BookId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookRentals_Books_BookId",
                schema: "rental",
                table: "BookRentals",
                column: "BookId",
                principalSchema: "catalog",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockItems_Books_BookId",
                table: "StockItems",
                column: "BookId",
                principalSchema: "catalog",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookRentals_Books_BookId",
                schema: "rental",
                table: "BookRentals");

            migrationBuilder.DropForeignKey(
                name: "FK_StockItems_Books_BookId",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_Wishlists_UserId_BookId",
                schema: "catalog",
                table: "Wishlists");

            migrationBuilder.RenameTable(
                name: "Wishlists",
                schema: "catalog",
                newName: "Wishlists");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Wishlists",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddForeignKey(
                name: "FK_BookRentals_Books_BookId",
                schema: "rental",
                table: "BookRentals",
                column: "BookId",
                principalSchema: "catalog",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockItems_Books_BookId",
                table: "StockItems",
                column: "BookId",
                principalSchema: "catalog",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
