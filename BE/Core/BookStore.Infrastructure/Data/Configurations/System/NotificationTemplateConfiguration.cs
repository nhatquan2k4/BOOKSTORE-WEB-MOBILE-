using BookStore.Domain.Entities.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.System
{
    public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
    {
        public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
        {
            builder.ToTable("NotificationTemplates", "system");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Code)
                .HasMaxLength(100)
                .IsRequired()
                .HasComment("Unique code identifying the template");

            builder.Property(t => t.Subject)
                .HasMaxLength(200)
                .IsRequired()
                .HasComment("Email subject template");

            builder.Property(t => t.Body)
                .IsRequired()
                .HasComment("Email body template (HTML format)");

            builder.Property(t => t.Description)
                .HasMaxLength(500)
                .HasComment("Template description for admin reference");

            builder.Property(t => t.IsActive)
                .HasDefaultValue(true)
                .HasComment("Whether this template is active");

            builder.Property(t => t.Placeholders)
                .HasMaxLength(1000)
                .HasComment("Available placeholders (JSON format)");

            builder.Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Unique constraint on Code
            builder.HasIndex(t => t.Code)
                .IsUnique();

            // Index for filtering
            builder.HasIndex(t => t.IsActive);
        }
    }
}
