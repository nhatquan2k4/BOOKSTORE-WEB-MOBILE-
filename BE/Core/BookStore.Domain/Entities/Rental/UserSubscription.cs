using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.Entities.Rental
{
    /// <summary>
    /// Gói thuê sách mà User đã mua (Story 18)
    /// User mua gói → Có quyền đọc ebook trong thời hạn gói
    /// </summary>
    public class UserSubscription
    {
        public Guid Id { get; set; }

        // FK: User đã mua gói
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        // FK: Gói thuê đã mua
        public Guid RentalPlanId { get; set; }
        public virtual RentalPlan RentalPlan { get; set; } = null!;

        // Thời gian bắt đầu
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        // Thời gian kết thúc (StartDate + RentalPlan.DurationDays)
        public DateTime EndDate { get; set; }

        // Trạng thái: Active, Expired, Cancelled
        public string Status { get; set; } = "Active";

        // Đã thanh toán chưa
        public bool IsPaid { get; set; } = false;

        // Payment transaction code (nếu thanh toán online)
        public string? PaymentTransactionCode { get; set; }

        // Ngày tạo
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Ngày cập nhật
        public DateTime? UpdatedAt { get; set; }

        // Helper method: Kiểm tra gói còn hạn không
        public bool IsValid()
        {
            return Status == "Active" && IsPaid && DateTime.UtcNow < EndDate;
        }
    }
}
