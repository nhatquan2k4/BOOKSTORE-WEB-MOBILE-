namespace BookStore.Application.Dtos.Checkout
{
    public class CheckoutValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> ErrorMessages { get; set; } = new();
        public List<CheckoutItemValidationDto> ItemValidations { get; set; } = new();
    }

    public class CheckoutItemValidationDto
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int RequestedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
