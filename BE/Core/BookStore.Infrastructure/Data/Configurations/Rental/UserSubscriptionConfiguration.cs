using BookStore.Domain.Entities.Rental;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStore.Infrastructure.Data.Configurations.Rental
{
    public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
    {
        public void Configure(EntityTypeBuilder<UserSubscription> builder)
        {
            builder.ToTable("UserSubscriptions", "rental");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.Status)
                .HasMaxLength(50)
                .IsRequired()
                .HasDefaultValue("Active");

            builder.Property(s => s.IsPaid)
                .HasDefaultValue(false);

            builder.Property(s => s.PaymentTransactionCode)
                .HasMaxLength(100);

            builder.Property(s => s.StartDate)
                .IsRequired();

            builder.Property(s => s.EndDate)
                .IsRequired();

            builder.Property(s => s.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Indexes cho query nhanh
            builder.HasIndex(s => s.UserId);
            builder.HasIndex(s => new { s.UserId, s.Status });
            builder.HasIndex(s => s.PaymentTransactionCode);
            builder.HasIndex(s => s.EndDate);

            // 🔗 n-1: UserSubscription → User
            builder.HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔗 n-1: UserSubscription → RentalPlan
            builder.HasOne(s => s.RentalPlan)
                .WithMany(p => p.UserSubscriptions)
                .HasForeignKey(s => s.RentalPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
