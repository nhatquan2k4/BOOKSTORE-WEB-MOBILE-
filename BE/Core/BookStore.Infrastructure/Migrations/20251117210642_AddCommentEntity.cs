using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Comment",
                schema: "common",
                table: "Reviews",
                newName: "Content");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                schema: "common",
                table: "Reviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedBy",
                schema: "common",
                table: "Reviews",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsVerifiedPurchase",
                schema: "common",
                table: "Reviews",
                type: "bit",
                nullable: false,
                defaultValue: false,
                comment: "Đã xác thực mua hàng");

            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                schema: "common",
                table: "Reviews",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "common",
                table: "Reviews",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Pending",
                comment: "Trạng thái: Pending, Approved, Rejected");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                schema: "common",
                table: "Reviews",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                comment: "Tiêu đề đánh giá");

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

            migrationBuilder.CreateTable(
                name: "Comments",
                schema: "common",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ParentCommentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false, comment: "Comment content"),
                    IsEdited = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.CheckConstraint(
                        "CK_Comment_BookOrReview",
                        "(BookId IS NOT NULL AND ReviewId IS NULL) OR (BookId IS NULL AND ReviewId IS NOT NULL)");

                    table.ForeignKey(
                        name: "FK_Comments_Books_BookId",
                        column: x => x.BookId,
                        principalSchema: "catalog",
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);   // <--- đổi từ Cascade

                    table.ForeignKey(
                        name: "FK_Comments_Comments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalSchema: "common",
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);

                    table.ForeignKey(
                        name: "FK_Comments_Reviews_ReviewId",
                        column: x => x.ReviewId,
                        principalSchema: "common",
                        principalTable: "Reviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);

                    table.ForeignKey(
                        name: "FK_Comments_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                }
                );

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_BookId",
                schema: "common",
                table: "Reviews",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_OrderId",
                schema: "common",
                table: "Reviews",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_Status",
                schema: "common",
                table: "Reviews",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_BookId",
                schema: "common",
                table: "Comments",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CreatedAt",
                schema: "common",
                table: "Comments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentCommentId",
                schema: "common",
                table: "Comments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ReviewId",
                schema: "common",
                table: "Comments",
                column: "ReviewId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                schema: "common",
                table: "Comments",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Orders_OrderId",
                schema: "common",
                table: "Reviews",
                column: "OrderId",
                principalSchema: "ordering",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Orders_OrderId",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "Comments",
                schema: "common");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_BookId",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_OrderId",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_Status",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsVerifiedPurchase",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "OrderId",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "common",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Title",
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

            migrationBuilder.RenameColumn(
                name: "Content",
                schema: "common",
                table: "Reviews",
                newName: "Comment");
        }
    }
}
