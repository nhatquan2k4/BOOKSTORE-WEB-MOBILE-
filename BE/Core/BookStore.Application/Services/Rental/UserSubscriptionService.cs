using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService.Payment;
using BookStore.Application.IService.Rental;
using BookStore.Application.Mappers.Rental;
using BookStore.Domain.IRepository.Rental;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Rental
{
    public class UserSubscriptionService : IUserSubscriptionService
    {
        private readonly IUserSubscriptionRepository _subscriptionRepository;
        private readonly IRentalPlanRepository _rentalPlanRepository;
        // private readonly IPaymentService _paymentService; // TODO: Use when integrate payment gateway
        private readonly ILogger<UserSubscriptionService> _logger;

        public UserSubscriptionService(
            IUserSubscriptionRepository subscriptionRepository,
            IRentalPlanRepository rentalPlanRepository,
            // IPaymentService paymentService,
            ILogger<UserSubscriptionService> logger)
        {
            _subscriptionRepository = subscriptionRepository;
            _rentalPlanRepository = rentalPlanRepository;
            // _paymentService = paymentService;
            _logger = logger;
        }

        public async Task<SubscriptionResultDto> SubscribeAsync(Guid userId, SubscribeRentalPlanDto dto)
        {
            // Validate rental plan
            var plan = await _rentalPlanRepository.GetByIdAsync(dto.RentalPlanId);
            Guard.Against(plan == null, "Không tìm thấy gói thuê");
            Guard.Against(!plan!.IsActive, "Gói thuê này không còn hoạt động");

            // Check if user already has an active subscription
            var hasActive = await _subscriptionRepository.HasActiveSubscriptionAsync(userId);
            if (hasActive)
            {
                return new SubscriptionResultDto
                {
                    Success = false,
                    Message = "Bạn đang có gói thuê còn hạn. Vui lòng chờ hết hạn trước khi mua gói mới."
                };
            }

            // Generate transaction code
            var transactionCode = $"SUB-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6)}";

            // Create subscription
            var subscription = dto.ToEntity(userId, plan, transactionCode);
            await _subscriptionRepository.AddAsync(subscription);
            await _subscriptionRepository.SaveChangesAsync();

            _logger.LogInformation($"User {userId} subscribed to plan {plan.Name} (Transaction: {transactionCode})");

            var result = new SubscriptionResultDto
            {
                Success = true,
                Message = "Đăng ký gói thuê thành công",
                Subscription = subscription.ToDto(),
                PaymentTransactionCode = transactionCode
            };

            // If payment method is Online, create payment transaction and QR code
            if (dto.PaymentMethod == "Online")
            {
                // TODO: Integrate with payment gateway to create QR code
                // var payment = await _paymentService.CreatePaymentAsync(...);
                // result.QrCodeUrl = payment.QrCodeUrl;
                result.Message = "Vui lòng quét mã QR để thanh toán";
            }
            else
            {
                // Cash payment - mark as paid immediately
                result.Message = "Đăng ký thành công. Gói thuê đã được kích hoạt.";
            }

            return result;
        }

        public async Task<CheckSubscriptionDto> CheckUserSubscriptionAsync(Guid userId)
        {
            var activeSubscription = await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId);

            return new CheckSubscriptionDto
            {
                HasActiveSubscription = activeSubscription != null,
                ActiveSubscription = activeSubscription?.ToDto()
            };
        }

        public async Task<IEnumerable<UserSubscriptionDto>> GetUserSubscriptionsAsync(Guid userId)
        {
            var subscriptions = await _subscriptionRepository.GetByUserIdAsync(userId);
            return subscriptions.Select(s => s.ToDto());
        }

        public async Task<UserSubscriptionDto?> GetActiveSubscriptionAsync(Guid userId)
        {
            var subscription = await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId);
            return subscription?.ToDto();
        }

        public async Task<IEnumerable<UserSubscriptionDto>> GetAllSubscriptionsAsync()
        {
            var subscriptions = await _subscriptionRepository.GetAllAsync();
            return subscriptions.Select(s => s.ToDto());
        }

        public async Task CancelSubscriptionAsync(Guid subscriptionId)
        {
            var subscription = await _subscriptionRepository.GetByIdAsync(subscriptionId);
            Guard.Against(subscription == null, "Không tìm thấy subscription");

            subscription!.Status = "Cancelled";
            subscription.UpdatedAt = DateTime.UtcNow;

            _subscriptionRepository.Update(subscription);
            await _subscriptionRepository.SaveChangesAsync();

            _logger.LogInformation($"Cancelled subscription {subscriptionId}");
        }

        public async Task UpdateExpiredSubscriptionsAsync()
        {
            var expiredSubscriptions = await _subscriptionRepository.GetExpiredSubscriptionsAsync();

            foreach (var subscription in expiredSubscriptions)
            {
                subscription.Status = "Expired";
                subscription.UpdatedAt = DateTime.UtcNow;
                _subscriptionRepository.Update(subscription);

                _logger.LogInformation($"Marked subscription {subscription.Id} as Expired");
            }

            if (expiredSubscriptions.Any())
            {
                await _subscriptionRepository.SaveChangesAsync();
            }
        }

        public async Task<UserSubscriptionDto> ConfirmSubscriptionPaymentAsync(string transactionCode)
        {
            var subscription = await _subscriptionRepository.GetByTransactionCodeAsync(transactionCode);
            Guard.Against(subscription == null, $"Không tìm thấy subscription với mã {transactionCode}");

            subscription!.IsPaid = true;
            subscription.Status = "Active";
            subscription.UpdatedAt = DateTime.UtcNow;

            _subscriptionRepository.Update(subscription);
            await _subscriptionRepository.SaveChangesAsync();

            _logger.LogInformation($"Confirmed payment for subscription {subscription.Id} (Transaction: {transactionCode})");

            return subscription.ToDto();
        }
    }
}
