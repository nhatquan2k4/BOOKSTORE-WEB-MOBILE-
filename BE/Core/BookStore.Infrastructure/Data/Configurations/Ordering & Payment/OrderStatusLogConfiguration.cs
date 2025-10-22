using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class OrderStatusLogConfiguration : IEntityTypeConfiguration<OrderStatusLog>
    {
        public void Configure(EntityTypeBuilder<OrderStatusLog> builder)
        {
            builder.ToTable("OrderStatusLogs", "ordering");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.OldStatus)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(s => s.NewStatus)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(s => s.ChangedBy)
                .HasMaxLength(255);
        }
    }
}
