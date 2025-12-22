using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixStockItemBookRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockItems_BookId",
                table: "StockItems");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_BookId",
                table: "StockItems",
                column: "BookId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockItems_BookId",
                table: "StockItems");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_BookId",
                table: "StockItems",
                column: "BookId",
                unique: true);
        }
    }
}
