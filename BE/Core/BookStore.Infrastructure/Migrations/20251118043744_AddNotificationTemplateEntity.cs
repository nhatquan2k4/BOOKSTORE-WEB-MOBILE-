using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationTemplateEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationTemplates",
                schema: "system",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, comment: "Unique code identifying the template"),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false, comment: "Email subject template"),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false, comment: "Email body template (HTML format)"),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true, comment: "Template description for admin reference"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true, comment: "Whether this template is active"),
                    Placeholders = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true, comment: "Available placeholders (JSON format)"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_Code",
                schema: "system",
                table: "NotificationTemplates",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationTemplates_IsActive",
                schema: "system",
                table: "NotificationTemplates",
                column: "IsActive");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationTemplates",
                schema: "system");
        }
    }
}
