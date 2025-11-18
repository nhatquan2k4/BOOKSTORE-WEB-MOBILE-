namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO cho subscription của user
    /// </summary>
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

    /// <summary>
    /// DTO để user mua gói thuê
    /// </summary>
    public class SubscribeRentalPlanDto
    {
        public Guid RentalPlanId { get; set; }
        public string PaymentMethod { get; set; } = "Online"; // Online hoặc Cash
    }

    /// <summary>
    /// DTO response sau khi mua gói thành công
    /// </summary>
    public class SubscriptionResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public UserSubscriptionDto? Subscription { get; set; }
        public string? QrCodeUrl { get; set; } // Nếu thanh toán online
        public string? PaymentTransactionCode { get; set; }
    }

    /// <summary>
    /// DTO để kiểm tra user có subscription còn hạn không
    /// </summary>
    public class CheckSubscriptionDto
    {
        public bool HasActiveSubscription { get; set; }
        public UserSubscriptionDto? ActiveSubscription { get; set; }
    }
}
