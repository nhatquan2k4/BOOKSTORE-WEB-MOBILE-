using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;

namespace BookStore.Application.Services.Inventory
{
    public class PriceService : IPriceService
    {
        private readonly IPriceRepository _priceRepository;

        public PriceService(IPriceRepository priceRepository)
        {
            _priceRepository = priceRepository;
        }

        public async Task<PriceDto?> GetCurrentPriceByBookIdAsync(Guid bookId)
        {
            var price = await _priceRepository.GetCurrentPriceByBookIdAsync(bookId);
            return price?.ToDto();
        }

        public async Task<IEnumerable<PriceDto>> GetPriceHistoryByBookIdAsync(Guid bookId)
        {
            var prices = await _priceRepository.GetPriceHistoryByBookIdAsync(bookId);
            return prices.Select(p => p.ToDto());
        }

        public async Task<IEnumerable<PriceDto>> GetAllCurrentPricesAsync()
        {
            var prices = await _priceRepository.GetAllCurrentPricesAsync();
            return prices.Select(p => p.ToDto());
        }

        public async Task<PriceDto> CreatePriceAsync(CreatePriceDto dto)
        {
            // Deactivate current price if exists
            await _priceRepository.DeactivateCurrentPriceAsync(dto.BookId);

            var price = dto.ToEntity();

            await _priceRepository.AddAsync(price);
            await _priceRepository.SaveChangesAsync();

            // Reload to get Book info
            var created = await _priceRepository.GetCurrentPriceByBookIdAsync(dto.BookId);
            return created!.ToDto();
        }

        public async Task<PriceDto?> UpdatePriceAsync(Guid bookId, UpdatePriceDto dto)
        {
            // Deactivate old price
            await _priceRepository.DeactivateCurrentPriceAsync(bookId);

            // Create new price
            var newPrice = dto.ToNewEntity(bookId);

            await _priceRepository.AddAsync(newPrice);
            await _priceRepository.SaveChangesAsync();

            var updated = await _priceRepository.GetCurrentPriceByBookIdAsync(bookId);
            return updated!.ToDto();
        }

        public async Task BulkUpdatePricesAsync(BulkUpdatePriceDto dto)
        {
            foreach (var item in dto.Prices)
            {
                await _priceRepository.DeactivateCurrentPriceAsync(item.BookId);

                var updateDto = new UpdatePriceDto
                {
                    Amount = item.NewAmount,
                    DiscountId = null,
                    EffectiveFrom = DateTime.UtcNow
                };

                var newPrice = updateDto.ToNewEntity(item.BookId);
                await _priceRepository.AddAsync(newPrice);
            }

            await _priceRepository.SaveChangesAsync();
        }
    }
}
