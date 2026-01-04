using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Rental
{

    public class RenewBookRentalDto
    {

        [Required(ErrorMessage = "RentalPlanId là bắt buộc")]
        public Guid RentalPlanId { get; set; }

        [Required(ErrorMessage = "PaymentTransactionCode là bắt buộc")]
        public string PaymentTransactionCode { get; set; } = null!;
    }
}
