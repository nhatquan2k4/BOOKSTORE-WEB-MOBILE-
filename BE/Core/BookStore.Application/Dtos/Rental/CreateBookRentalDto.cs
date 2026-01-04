using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Rental
{

    public class CreateBookRentalDto
    {

        [Required(ErrorMessage = "BookId là bắt buộc")]
        public Guid BookId { get; set; }


        [Required(ErrorMessage = "RentalPlanId là bắt buộc")]
        public Guid RentalPlanId { get; set; }


        [Required(ErrorMessage = "PaymentTransactionCode là bắt buộc")]
        public string PaymentTransactionCode { get; set; } = null!;
    }
}
