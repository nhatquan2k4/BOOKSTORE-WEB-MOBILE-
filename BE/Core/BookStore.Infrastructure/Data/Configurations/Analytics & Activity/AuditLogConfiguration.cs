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

            builder.Property(l => l.AdminId)
                .IsRequired();

            builder.Property(l => l.Action)
                .HasMaxLength(50)
                .IsRequired()
                .HasComment("Action type: CREATE, UPDATE, DELETE, etc.");

            builder.Property(l => l.EntityName)
                .HasMaxLength(100)
                .IsRequired()
                .HasComment("Entity name being audited");

            builder.Property(l => l.EntityId)
                .HasMaxLength(100)
                .IsRequired()
                .HasComment("ID of the entity being audited");

            builder.Property(l => l.Description)
                .HasMaxLength(500)
                .HasComment("Human-readable description of the action");

            builder.Property(l => l.OldValues)
                .HasColumnType("nvarchar(max)")
                .HasComment("JSON of old values");

            builder.Property(l => l.NewValues)
                .HasColumnType("nvarchar(max)")
                .HasComment("JSON of new values");

            builder.Property(l => l.IpAddress)
                .HasMaxLength(45);

            builder.Property(l => l.UserAgent)
                .HasMaxLength(500);

            builder.Property(l => l.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Indexes for fast queries
            builder.HasIndex(l => l.AdminId)
                .HasDatabaseName("IX_AuditLogs_AdminId");

            builder.HasIndex(l => l.EntityName)
                .HasDatabaseName("IX_AuditLogs_EntityName");

            builder.HasIndex(l => l.CreatedAt)
                .HasDatabaseName("IX_AuditLogs_CreatedAt");

            builder.HasIndex(l => new { l.EntityName, l.EntityId })
                .HasDatabaseName("IX_AuditLogs_Entity");
        }
    }
}
