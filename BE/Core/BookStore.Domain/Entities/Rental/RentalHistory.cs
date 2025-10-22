using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Rental
{
    public class RentalHistory
    {
        public Guid Id { get; set; }

        public Guid BookRentalId { get; set; }                  // FK: Lượt thuê liên quan
        public virtual BookRental BookRental { get; set; } = null!;

        public string Action { get; set; } = null!;             // Hành động (Rented, Renewed, Returned, Cancelled)
        public string? Note { get; set; }                       // Ghi chú chi tiết (VD: “Gia hạn thêm 7 ngày”)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời điểm xảy ra hành động

    }
}
