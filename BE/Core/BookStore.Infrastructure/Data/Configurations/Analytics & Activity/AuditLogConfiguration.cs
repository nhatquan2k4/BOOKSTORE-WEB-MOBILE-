using BookStore.Domain.Entities.Analytics___Activity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.AnalyticsActivity
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs", "analytics");

            builder.HasKey(l => l.Id);

            builder.Property(l => l.Action)
                .HasMaxLength(50)
                .IsRequired()
                .HasComment("Loại hành động: Create, Update, Delete...");

            builder.Property(l => l.TableName)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(l => l.RecordId)
                .HasMaxLength(100);

            builder.Property(l => l.ChangedBy)
                .HasMaxLength(150);

            builder.Property(l => l.OldValues)
                .HasColumnType("nvarchar(max)");

            builder.Property(l => l.NewValues)
                .HasColumnType("nvarchar(max)");

            builder.Property(l => l.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 📈 Index giúp truy vấn nhanh theo bảng và hành động
            builder.HasIndex(l => new { l.TableName, l.Action });
        }
    }
}
