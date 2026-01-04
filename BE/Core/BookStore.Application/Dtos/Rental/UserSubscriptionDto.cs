namespace BookStore.Application.Dtos.Rental
{
    public class UserSubscriptionDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public Guid RentalPlanId { get; set; }
        public RentalPlanDto RentalPlan { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
        public string? PaymentTransactionCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsValid { get; set; } // Còn hạn không
    }


    public class SubscribeRentalPlanDto
    {
        public Guid RentalPlanId { get; set; }
        public string PaymentMethod { get; set; } = "Online"; // Online hoặc Cash
    }


    public class SubscriptionResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public UserSubscriptionDto? Subscription { get; set; }
        public string? QrCodeUrl { get; set; } // Nếu thanh toán online
        public string? PaymentTransactionCode { get; set; }
    }


    public class CheckSubscriptionDto
    {
        public bool HasActiveSubscription { get; set; }
        public UserSubscriptionDto? ActiveSubscription { get; set; }
    }

    public class SubscribeMockDto
    {
        public Guid RentalPlanId { get; set; }
    }
}
