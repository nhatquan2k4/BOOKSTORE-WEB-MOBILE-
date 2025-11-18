using BookStore.Application.Dtos.Rental;
using BookStore.Domain.Entities.Rental;

namespace BookStore.Application.Mappers.Rental
{
    public static class UserSubscriptionMapper
    {
        public static UserSubscriptionDto ToDto(this UserSubscription entity)
        {
            return new UserSubscriptionDto
            {
                Id = entity.Id,
                UserId = entity.UserId,
                UserEmail = entity.User?.Email ?? string.Empty,
                RentalPlanId = entity.RentalPlanId,
                RentalPlan = entity.RentalPlan.ToDto(),
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Status = entity.Status,
                IsPaid = entity.IsPaid,
                PaymentTransactionCode = entity.PaymentTransactionCode,
                CreatedAt = entity.CreatedAt,
                IsValid = entity.IsValid()
            };
        }

        public static UserSubscription ToEntity(this SubscribeRentalPlanDto dto, Guid userId, RentalPlan plan, string transactionCode)
        {
            var startDate = DateTime.UtcNow;
            var endDate = startDate.AddDays(plan.DurationDays);

            return new UserSubscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RentalPlanId = plan.Id,
                RentalPlan = plan,
                StartDate = startDate,
                EndDate = endDate,
                Status = "Active",
                IsPaid = dto.PaymentMethod == "Cash", // Cash thì tạm set Paid = true, Online thì chờ callback
                PaymentTransactionCode = transactionCode,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}
