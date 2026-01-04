using BookStore.Application.Dtos.Checkout;
using BookStore.Application.Dtos.Ordering;
using PaymentDto = BookStore.Application.Dtos.Payment;

namespace BookStore.Application.IService.Checkout
{
    public interface ICheckoutService
    {

        Task<CheckoutPreviewDto> GetCheckoutPreviewAsync(Guid userId, string? couponCode = null);

        Task<CheckoutValidationResultDto> ValidateCheckoutAsync(Guid userId);

        Task<CheckoutResultDto> ProcessCheckoutAsync(CheckoutRequestDto dto);

        Task<CheckoutResultDto> QuickCheckoutAsync(Guid userId, CreateOrderAddressDto address, string? couponCode = null, string provider = "VietQR");

        Task<CheckoutResultDto> HandlePaymentCallbackAsync(PaymentDto.PaymentCallbackDto callbackDto);

        Task<bool> CancelCheckoutAsync(Guid orderId, Guid userId);

        Task<CheckoutResultDto?> GetCheckoutResultByOrderIdAsync(Guid orderId);
        Task<PaymentDto.PaymentTransactionDto?> GetCheckoutPaymentStatusAsync(Guid orderId);

        Task<CheckoutCalculationDto> CalculateCheckoutTotalAsync(Guid userId, string? couponCode = null);

        Task<bool> ValidateCouponAsync(string couponCode, Guid userId);
 
        Task<(List<CheckoutResultDto> Items, int TotalCount)> GetUserCheckoutHistoryAsync(Guid userId, int pageNumber = 1, int pageSize = 10);
    }
}
