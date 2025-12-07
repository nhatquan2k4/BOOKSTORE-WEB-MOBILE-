using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStockAndWarehouseEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Books_BookId",
                schema: "common",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Reviews_ReviewId",
                schema: "common",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Users_UserId",
                schema: "common",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "AverageRating",
                schema: "catalog",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "TotalReviews",
                schema: "catalog",
                table: "Books");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Warehouses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "Warehouses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Books_BookId",
                schema: "common",
                table: "Comments",
                column: "BookId",
                principalSchema: "catalog",
                principalTable: "Books",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Reviews_ReviewId",
                schema: "common",
                table: "Comments",
                column: "ReviewId",
                principalSchema: "common",
                principalTable: "Reviews",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Users_UserId",
                schema: "common",
                table: "Comments",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                schema: "common",
                table: "Reviews",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Books_BookId",
                schema: "common",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Reviews_ReviewId",
                schema: "common",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Users_UserId",
                schema: "common",
                table: "Comments");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Warehouses");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Warehouses");

            migrationBuilder.AddColumn<decimal>(
                name: "AverageRating",
                schema: "catalog",
                table: "Books",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "TotalReviews",
                schema: "catalog",
                table: "Books",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Books_BookId",
                schema: "common",
                table: "Comments",
                column: "BookId",
                principalSchema: "catalog",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Reviews_ReviewId",
                schema: "common",
                table: "Comments",
                column: "ReviewId",
                principalSchema: "common",
                principalTable: "Reviews",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Users_UserId",
                schema: "common",
                table: "Comments",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                schema: "common",
                table: "Reviews",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
