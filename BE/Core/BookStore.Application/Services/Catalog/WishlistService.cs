using BookStore.Application.Dtos.Catalog.Wishlist;
using BookStore.Application.IService.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Catalog
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<WishlistService> _logger;

        public WishlistService(
            IWishlistRepository wishlistRepository,
            IBookRepository bookRepository,
            ILogger<WishlistService> logger)
        {
            _wishlistRepository = wishlistRepository;
            _bookRepository = bookRepository;
            _logger = logger;
        }

        public async Task<List<WishlistDto>> GetUserWishlistAsync(Guid userId)
        {
            var wishlistItems = await _wishlistRepository.GetWishlistByUserIdAsync(userId);

            return wishlistItems.Select(w => new WishlistDto
            {
                Id = w.Id,
                UserId = w.UserId,
                BookId = w.BookId,
                CreatedAt = w.CreatedAt,
                BookTitle = w.Book.Title,
                BookISBN = w.Book.ISBN.Value,
                BookImageUrl = w.Book.Images.FirstOrDefault()?.ImageUrl,
                BookPrice = w.Book.Prices
                    .Where(p => p.IsCurrent && p.EffectiveFrom <= DateTime.UtcNow && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                    .OrderByDescending(p => p.EffectiveFrom)
                    .Select(p => p.Amount)
                    .FirstOrDefault(),
                BookDiscountPrice = w.Book.Prices
                    .Where(p => p.IsCurrent && p.EffectiveFrom <= DateTime.UtcNow && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow) && p.DiscountId.HasValue)
                    .OrderByDescending(p => p.EffectiveFrom)
                    .Select(p => p.Amount)
                    .FirstOrDefault(),
                AuthorNames = string.Join(", ", w.Book.BookAuthors.Select(ba => ba.Author.Name)),
                PublisherName = w.Book.Publisher?.Name
            }).ToList();
        }

        public async Task<WishlistDto> AddToWishlistAsync(Guid userId, Guid bookId)
        {
            // Kiểm tra sách có tồn tại không
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Sách không tồn tại");

            // Kiểm tra đã có trong wishlist chưa
            var exists = await _wishlistRepository.IsBookInWishlistAsync(userId, bookId);
            if (exists)
            {
                // Trả về item hiện có
                var existingItem = await _wishlistRepository.GetWishlistItemAsync(userId, bookId);
                return new WishlistDto
                {
                    Id = existingItem!.Id,
                    UserId = existingItem.UserId,
                    BookId = existingItem.BookId,
                    CreatedAt = existingItem.CreatedAt
                };
            }

            // Thêm vào wishlist
            var wishlistItem = await _wishlistRepository.AddToWishlistAsync(userId, bookId);

            _logger.LogInformation("User {UserId} added book {BookId} to wishlist", userId, bookId);

            return new WishlistDto
            {
                Id = wishlistItem.Id,
                UserId = wishlistItem.UserId,
                BookId = wishlistItem.BookId,
                CreatedAt = wishlistItem.CreatedAt
            };
        }

        public async Task<bool> RemoveFromWishlistAsync(Guid userId, Guid bookId)
        {
            var result = await _wishlistRepository.RemoveFromWishlistAsync(userId, bookId);

            if (result)
            {
                _logger.LogInformation("User {UserId} removed book {BookId} from wishlist", userId, bookId);
            }

            return result;
        }

        public async Task<bool> IsBookInWishlistAsync(Guid userId, Guid bookId)
        {
            return await _wishlistRepository.IsBookInWishlistAsync(userId, bookId);
        }

        public async Task<int> GetWishlistCountAsync(Guid userId)
        {
            return await _wishlistRepository.GetWishlistCountAsync(userId);
        }

        public async Task ClearWishlistAsync(Guid userId)
        {
            await _wishlistRepository.ClearWishlistAsync(userId);
            _logger.LogInformation("User {UserId} cleared their wishlist", userId);
        }

        public async Task<WishlistSummaryDto> GetWishlistSummaryAsync(Guid userId)
        {
            var bookIds = await _wishlistRepository.GetWishlistBookIdsAsync(userId);

            return new WishlistSummaryDto
            {
                TotalItems = bookIds.Count,
                BookIds = bookIds
            };
        }
    }
}
