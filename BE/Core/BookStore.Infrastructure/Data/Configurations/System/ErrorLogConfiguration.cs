using BookStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.System
{
    public class ErrorLogConfiguration : IEntityTypeConfiguration<ErrorLogs>
    {
        public void Configure(EntityTypeBuilder<ErrorLogs> builder)
        {
            builder.ToTable("ErrorLogs", "system");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Message)
                .HasMaxLength(1000)
                .IsRequired()
                .HasComment("Mô tả lỗi chính");

            builder.Property(e => e.StackTrace)
                .HasColumnType("nvarchar(max)")
                .HasComment("Thông tin stack trace");

            builder.Property(e => e.Source)
                .HasMaxLength(100)
                .HasComment("Nguồn gây lỗi (Service, Controller,...)");

            builder.Property(e => e.UserId)
                .HasMaxLength(100)
                .HasComment("Ai đang thao tác khi xảy ra lỗi");

            builder.Property(e => e.IsResolved)
                .HasDefaultValue(false);

            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 📈 Index giúp tìm nhanh lỗi chưa xử lý
            builder.HasIndex(e => new { e.IsResolved, e.CreatedAt });
        }
    }
}
