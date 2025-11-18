using BookStore.Application.Dtos.Rental;

namespace BookStore.Application.IService.Rental
{
    public interface IUserSubscriptionService
    {
        // User mua gói thuê
        Task<SubscriptionResultDto> SubscribeAsync(Guid userId, SubscribeRentalPlanDto dto);

        // Kiểm tra user có subscription còn hạn không
        Task<CheckSubscriptionDto> CheckUserSubscriptionAsync(Guid userId);

        // Lấy danh sách subscription của user
        Task<IEnumerable<UserSubscriptionDto>> GetUserSubscriptionsAsync(Guid userId);

        // Lấy subscription đang active của user
        Task<UserSubscriptionDto?> GetActiveSubscriptionAsync(Guid userId);

        // Admin: Lấy tất cả subscriptions
        Task<IEnumerable<UserSubscriptionDto>> GetAllSubscriptionsAsync();

        // Admin: Hủy subscription
        Task CancelSubscriptionAsync(Guid subscriptionId);

        // Background job: Tự động cập nhật các subscription hết hạn
        Task UpdateExpiredSubscriptionsAsync();

        // Xử lý callback thanh toán cho subscription
        Task<UserSubscriptionDto> ConfirmSubscriptionPaymentAsync(string transactionCode);
    }
}
