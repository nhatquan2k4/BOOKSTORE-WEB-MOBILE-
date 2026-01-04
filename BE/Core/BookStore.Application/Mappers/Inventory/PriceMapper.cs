using BookStore.Application.Dtos.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Application.Mappers.Inventory
{

    public static class PriceMapper
    {

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
