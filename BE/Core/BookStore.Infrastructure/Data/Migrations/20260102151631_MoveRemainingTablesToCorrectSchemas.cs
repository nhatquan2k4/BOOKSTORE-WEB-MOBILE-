using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MoveRemainingTablesToCorrectSchemas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "inventory");

            migrationBuilder.RenameTable(
                name: "Warehouses",
                newName: "Warehouses",
                newSchema: "inventory");

            migrationBuilder.RenameTable(
                name: "StockItems",
                newName: "StockItems",
                newSchema: "inventory");

            migrationBuilder.RenameTable(
                name: "PasswordResetTokens",
                newName: "PasswordResetTokens",
                newSchema: "identity");

            migrationBuilder.RenameTable(
                name: "InventoryTransactions",
                newName: "InventoryTransactions",
                newSchema: "inventory");

            migrationBuilder.RenameTable(
                name: "EmailVerificationTokens",
                newName: "EmailVerificationTokens",
                newSchema: "identity");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                schema: "identity",
                table: "PasswordResetTokens",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IsUsed",
                schema: "identity",
                table: "PasswordResetTokens",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                schema: "identity",
                table: "PasswordResetTokens",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                schema: "identity",
                table: "EmailVerificationTokens",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "IsUsed",
                schema: "identity",
                table: "EmailVerificationTokens",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                schema: "identity",
                table: "EmailVerificationTokens",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_ExpiryDate",
                schema: "identity",
                table: "PasswordResetTokens",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_Token",
                schema: "identity",
                table: "PasswordResetTokens",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationTokens_ExpiryDate",
                schema: "identity",
                table: "EmailVerificationTokens",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_EmailVerificationTokens_Token",
                schema: "identity",
                table: "EmailVerificationTokens",
                column: "Token");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_ExpiryDate",
                schema: "identity",
                table: "PasswordResetTokens");

            migrationBuilder.DropIndex(
                name: "IX_PasswordResetTokens_Token",
                schema: "identity",
                table: "PasswordResetTokens");

            migrationBuilder.DropIndex(
                name: "IX_EmailVerificationTokens_ExpiryDate",
                schema: "identity",
                table: "EmailVerificationTokens");

            migrationBuilder.DropIndex(
                name: "IX_EmailVerificationTokens_Token",
                schema: "identity",
                table: "EmailVerificationTokens");

            migrationBuilder.RenameTable(
                name: "Warehouses",
                schema: "inventory",
                newName: "Warehouses");

            migrationBuilder.RenameTable(
                name: "StockItems",
                schema: "inventory",
                newName: "StockItems");

            migrationBuilder.RenameTable(
                name: "PasswordResetTokens",
                schema: "identity",
                newName: "PasswordResetTokens");

            migrationBuilder.RenameTable(
                name: "InventoryTransactions",
                schema: "inventory",
                newName: "InventoryTransactions");

            migrationBuilder.RenameTable(
                name: "EmailVerificationTokens",
                schema: "identity",
                newName: "EmailVerificationTokens");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "PasswordResetTokens",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<bool>(
                name: "IsUsed",
                table: "PasswordResetTokens",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PasswordResetTokens",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "Token",
                table: "EmailVerificationTokens",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<bool>(
                name: "IsUsed",
                table: "EmailVerificationTokens",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "EmailVerificationTokens",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");
        }
    }
}
