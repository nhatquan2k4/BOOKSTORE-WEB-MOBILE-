using BookStore.Application.Dtos.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Application.Mappers.Inventory
{
    /// <summary>
    /// Mapper thủ công cho Price entity
    /// </summary>
    public static class PriceMapper
    {
        /// <summary>
        /// Map Price entity sang PriceDto
        /// </summary>
        public static PriceDto ToDto(this Price price)
        {
            return new PriceDto
            {
                Id = price.Id,
                BookId = price.BookId,
                BookTitle = price.Book?.Title ?? "",
                BookISBN = price.Book?.ISBN?.Value ?? "",
                Amount = price.Amount,
                Currency = price.Currency,
                IsCurrent = price.IsCurrent,
                EffectiveFrom = price.EffectiveFrom,
                EffectiveTo = price.EffectiveTo,
                DiscountId = price.DiscountId,
                DiscountCode = price.Discount?.Code
            };
        }

        /// <summary>
        /// Map CreatePriceDto sang Price entity
        /// </summary>
        public static Price ToEntity(this CreatePriceDto dto)
        {
            return new Price
            {
                Id = Guid.NewGuid(),
                BookId = dto.BookId,
                Amount = dto.Amount,
                Currency = dto.Currency,
                IsCurrent = true,
                EffectiveFrom = dto.EffectiveFrom ?? DateTime.UtcNow,
                DiscountId = dto.DiscountId
            };
        }

        /// <summary>
        /// Map UpdatePriceDto sang Price entity (tạo mới price với giá cập nhật)
        /// </summary>
        public static Price ToNewEntity(this UpdatePriceDto dto, Guid bookId)
        {
            return new Price
            {
                Id = Guid.NewGuid(),
                BookId = bookId,
                Amount = dto.Amount,
                Currency = "VND",
                IsCurrent = true,
                EffectiveFrom = dto.EffectiveFrom ?? DateTime.UtcNow,
                DiscountId = dto.DiscountId
            };
        }
    }
}
