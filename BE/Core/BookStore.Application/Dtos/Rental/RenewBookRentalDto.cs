using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO để gia hạn lượt thuê sách
    /// </summary>
    public class RenewBookRentalDto
    {
        /// <summary>
        /// ID gói thuê mới (có thể giống hoặc khác gói cũ)
        /// </summary>
        [Required(ErrorMessage = "RentalPlanId là bắt buộc")]
        public Guid RentalPlanId { get; set; }

        /// <summary>
        /// Mã giao dịch thanh toán cho gia hạn
        /// </summary>
        [Required(ErrorMessage = "PaymentTransactionCode là bắt buộc")]
        public string PaymentTransactionCode { get; set; } = null!;
    }
}
