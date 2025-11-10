using BookStore.Application.Dtos.Checkout;
using BookStore.Application.Dtos.Ordering;
using PaymentDto = BookStore.Application.Dtos.Payment;

namespace BookStore.Application.IService.Checkout
{
    public interface ICheckoutService
    {
        /// <summary>
        /// Xem trước thông tin checkout từ giỏ hàng
        /// </summary>
        Task<CheckoutPreviewDto> GetCheckoutPreviewAsync(Guid userId, string? couponCode = null);

        /// <summary>
        /// Validate giỏ hàng trước khi checkout
        /// </summary>
        Task<CheckoutValidationResultDto> ValidateCheckoutAsync(Guid userId);

        /// <summary>
        /// Thực hiện checkout hoàn chỉnh: tạo order từ cart và payment
        /// </summary>
        Task<CheckoutResultDto> ProcessCheckoutAsync(CheckoutRequestDto dto);

        /// <summary>
        /// Checkout nhanh: validate cart, tạo order và payment
        /// </summary>
        Task<CheckoutResultDto> QuickCheckoutAsync(Guid userId, CreateOrderAddressDto address, string? couponCode = null, string provider = "VietQR");

        /// <summary>
        /// Xử lý callback từ payment gateway
        /// </summary>
        Task<CheckoutResultDto> HandlePaymentCallbackAsync(PaymentDto.PaymentCallbackDto callbackDto);

        /// <summary>
        /// Hủy checkout và khôi phục giỏ hàng
        /// </summary>
        Task<bool> CancelCheckoutAsync(Guid orderId, Guid userId);

        /// <summary>
        /// Lấy thông tin checkout theo order ID
        /// </summary>
        Task<CheckoutResultDto?> GetCheckoutResultByOrderIdAsync(Guid orderId);

        /// <summary>
        /// Kiểm tra trạng thái thanh toán của một checkout
        /// </summary>
        Task<PaymentDto.PaymentTransactionDto?> GetCheckoutPaymentStatusAsync(Guid orderId);

        /// <summary>
        /// Tính toán tổng tiền với coupon
        /// </summary>
        Task<CheckoutCalculationDto> CalculateCheckoutTotalAsync(Guid userId, string? couponCode = null);

        /// <summary>
        /// Xác minh coupon có hợp lệ không
        /// </summary>
        Task<bool> ValidateCouponAsync(string couponCode, Guid userId);

        /// <summary>
        /// Lấy lịch sử checkout của user
        /// </summary>
        Task<(List<CheckoutResultDto> Items, int TotalCount)> GetUserCheckoutHistoryAsync(Guid userId, int pageNumber = 1, int pageSize = 10);
    }
}
