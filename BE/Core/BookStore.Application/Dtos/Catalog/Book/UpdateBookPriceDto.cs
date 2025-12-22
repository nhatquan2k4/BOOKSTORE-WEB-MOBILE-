namespace BookStore.Application.Dtos.Catalog.Book
{
    public class UpdateBookPriceDto
    {
        public decimal Price { get; set; }
        public DateTime? EffectiveTo { get; set; } // Optional: Khi nào giá này hết hiệu lực
    }
}
