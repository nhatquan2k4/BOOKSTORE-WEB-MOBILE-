using BookStore.Domain.Entities.Ordering___Payment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Ordering
{
    public class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
    {
        public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
        {
            builder.ToTable("PaymentTransactions", "ordering");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Provider)
                .HasMaxLength(100)
                .HasDefaultValue("VNPay");

            builder.Property(p => p.TransactionCode)
                .HasMaxLength(100)
                .IsRequired();

            builder.HasIndex(p => p.TransactionCode).IsUnique();

            builder.Property(p => p.PaymentMethod)
                .HasMaxLength(50)
                .HasDefaultValue("Online");

            builder.Property(p => p.Amount)
                .HasColumnType("decimal(18,2)");

            builder.Property(p => p.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(p => p.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // 🔗 1-n: PaymentTransaction – Refund
            builder.HasMany(p => p.Refunds)
                .WithOne(r => r.PaymentTransaction)
                .HasForeignKey(r => r.PaymentTransactionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
