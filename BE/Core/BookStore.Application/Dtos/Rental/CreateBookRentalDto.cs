using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO để tạo lượt thuê sách mới
    /// </summary>
    public class CreateBookRentalDto
    {
        /// <summary>
        /// ID của sách muốn thuê
        /// </summary>
        [Required(ErrorMessage = "BookId là bắt buộc")]
        public Guid BookId { get; set; }

        /// <summary>
        /// ID của gói thuê (7 ngày, 30 ngày, 90 ngày...)
        /// </summary>
        [Required(ErrorMessage = "RentalPlanId là bắt buộc")]
        public Guid RentalPlanId { get; set; }

        /// <summary>
        /// Mã giao dịch thanh toán (từ VNPay, Momo...)
        /// </summary>
        [Required(ErrorMessage = "PaymentTransactionCode là bắt buộc")]
        public string PaymentTransactionCode { get; set; } = null!;
    }
}
