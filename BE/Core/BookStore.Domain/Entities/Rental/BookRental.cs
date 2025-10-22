using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Rental
{
    public class BookRental
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }                        // FK: Người thuê
        public virtual User User { get; set; } = null!;

        public Guid BookId { get; set; }                        // FK: Sách được thuê
        public virtual Book Book { get; set; } = null!;

        public Guid RentalPlanId { get; set; }                  // FK: Gói thuê áp dụng
        public virtual RentalPlan RentalPlan { get; set; } = null!;

        public DateTime StartDate { get; set; } = DateTime.UtcNow;  // Ngày bắt đầu thuê
        public DateTime EndDate { get; set; }                        // Ngày kết thúc thuê
        public bool IsReturned { get; set; } = false;                // Đã hết hạn hay chưa
        public bool IsRenewed { get; set; } = false;                 // Đã gia hạn gói thuê hay chưa
        public string? Status { get; set; } = "Active";              // Trạng thái: Active, Expired, Cancelled

        // 🔗 1-n: Lịch sử hành động thuê/gia hạn/trả
        public virtual ICollection<RentalHistory> Histories { get; set; } = new List<RentalHistory>();

    }
}
