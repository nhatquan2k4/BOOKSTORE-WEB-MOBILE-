using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAnalyticsSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_TableName_Action",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "ChangedBy",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "RecordId",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "TableName",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.RenameColumn(
                name: "IPAddress",
                schema: "analytics",
                table: "BookViews",
                newName: "IpAddress");

            migrationBuilder.AlterColumn<string>(
                name: "IpAddress",
                schema: "analytics",
                table: "BookViews",
                type: "nvarchar(45)",
                maxLength: 45,
                nullable: true,
                comment: "IP address of the viewer",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                schema: "analytics",
                table: "BookViews",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                comment: "Session ID for tracking unique sessions");

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                schema: "analytics",
                table: "BookViews",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                comment: "Browser/client user agent");

            migrationBuilder.AlterColumn<string>(
                name: "OldValues",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: true,
                comment: "JSON of old values",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NewValues",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: true,
                comment: "JSON of new values",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                comment: "Action type: CREATE, UPDATE, DELETE, etc.",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldComment: "Loại hành động: Create, Update, Delete...");

            migrationBuilder.AddColumn<Guid>(
                name: "AdminId",
                schema: "analytics",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                comment: "Human-readable description of the action");

            migrationBuilder.AddColumn<string>(
                name: "EntityId",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                comment: "ID of the entity being audited");

            migrationBuilder.AddColumn<string>(
                name: "EntityName",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                comment: "Entity name being audited");

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookViews_BookId",
                schema: "analytics",
                table: "BookViews",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookViews_ViewedAt",
                schema: "analytics",
                table: "BookViews",
                column: "ViewedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_AdminId",
                schema: "analytics",
                table: "AuditLogs",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAt",
                schema: "analytics",
                table: "AuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Entity",
                schema: "analytics",
                table: "AuditLogs",
                columns: new[] { "EntityName", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_EntityName",
                schema: "analytics",
                table: "AuditLogs",
                column: "EntityName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookViews_BookId",
                schema: "analytics",
                table: "BookViews");

            migrationBuilder.DropIndex(
                name: "IX_BookViews_ViewedAt",
                schema: "analytics",
                table: "BookViews");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_AdminId",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_CreatedAt",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_Entity",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_EntityName",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "SessionId",
                schema: "analytics",
                table: "BookViews");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                schema: "analytics",
                table: "BookViews");

            migrationBuilder.DropColumn(
                name: "AdminId",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "Description",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "EntityId",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "EntityName",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                schema: "analytics",
                table: "AuditLogs");

            migrationBuilder.RenameColumn(
                name: "IpAddress",
                schema: "analytics",
                table: "BookViews",
                newName: "IPAddress");

            migrationBuilder.AlterColumn<string>(
                name: "IPAddress",
                schema: "analytics",
                table: "BookViews",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(45)",
                oldMaxLength: 45,
                oldNullable: true,
                oldComment: "IP address of the viewer");

            migrationBuilder.AlterColumn<string>(
                name: "OldValues",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true,
                oldComment: "JSON of old values");

            migrationBuilder.AlterColumn<string>(
                name: "NewValues",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true,
                oldComment: "JSON of new values");

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                comment: "Loại hành động: Create, Update, Delete...",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldComment: "Action type: CREATE, UPDATE, DELETE, etc.");

            migrationBuilder.AddColumn<string>(
                name: "ChangedBy",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecordId",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TableName",
                schema: "analytics",
                table: "AuditLogs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_TableName_Action",
                schema: "analytics",
                table: "AuditLogs",
                columns: new[] { "TableName", "Action" });
        }
    }
}
