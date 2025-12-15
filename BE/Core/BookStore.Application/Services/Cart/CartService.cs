using BookStore.Application.Dtos.Cart;
using BookStore.Application.IService.Cart;
using BookStore.Domain.Entities.Cart;
using BookStore.Domain.IRepository.Cart;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Cart
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<CartService> _logger;

        public CartService(
            ICartRepository cartRepository,
            ICartItemRepository cartItemRepository,
            IBookRepository bookRepository,
            ILogger<CartService> logger)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _bookRepository = bookRepository;
            _logger = logger;
        }

        #region Get Cart

        public async Task<CartDto?> GetActiveCartByUserIdAsync(Guid userId)
        {
            var cart = await _cartRepository.GetActiveCartByUserIdAsync(userId);
            return cart == null ? null : MapToCartDto(cart);
        }

        public async Task<CartDto?> GetCartByIdAsync(Guid cartId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(cartId);
            return cart == null ? null : MapToCartDto(cart);
        }

        public async Task<CartDto> GetOrCreateCartAsync(Guid userId)
        {
            var cart = await _cartRepository.GetOrCreateCartAsync(userId);
            return cart.ToDto();
        }

        #endregion

        #region Manage Cart Items

        public async Task<CartDto> AddToCartAsync(AddToCartDto dto)
        {
            // Validate book exists and available
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            Guard.Against(book == null, "Sách không tồn tại");

            Guard.Against(book != null && !book.IsAvailable, "Sách hiện không còn hàng");

            // Add or update item in cart
            await _cartRepository.AddOrUpdateItemAsync(dto.UserId, dto.BookId, dto.Quantity);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation($"Added book {dto.BookId} to cart of user {dto.UserId}");

            // Return updated cart
            var cart = await _cartRepository.GetActiveCartByUserIdAsync(dto.UserId);
            Guard.Against(cart == null, "Không thể tạo hoặc lấy giỏ hàng");

            return MapToCartDto(cart!);
        }

        public async Task<CartDto> RemoveFromCartAsync(RemoveFromCartDto dto)
        {
            await _cartRepository.RemoveItemAsync(dto.UserId, dto.BookId);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation($"Removed book {dto.BookId} from cart of user {dto.UserId}");

            var cart = await _cartRepository.GetActiveCartByUserIdAsync(dto.UserId);
            return cart == null ? new CartDto() : MapToCartDto(cart);
        }

        public async Task<CartDto> UpdateCartItemQuantityAsync(UpdateCartItemDto dto)
        {
            // Validate book stock
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            Guard.Against(book == null, "Sách không tồn tại");

            if (dto.Quantity <= 0)
            {
                // Remove item if quantity is 0 or negative
                return await RemoveFromCartAsync(new RemoveFromCartDto
                {
                    UserId = dto.UserId,
                    BookId = dto.BookId
                });
            }

            await _cartRepository.UpdateItemQuantityAsync(dto.UserId, dto.BookId, dto.Quantity);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation($"Updated quantity of book {dto.BookId} to {dto.Quantity} in cart of user {dto.UserId}");

            var cart = await _cartRepository.GetActiveCartByUserIdAsync(dto.UserId);
            Guard.Against(cart == null, "Không thể lấy giỏ hàng");

            return MapToCartDto(cart!);
        }

        public async Task<CartDto> ClearCartAsync(ClearCartDto dto)
        {
            await _cartRepository.ClearCartAsync(dto.UserId);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation($"Cleared cart of user {dto.UserId}");

            var cart = await _cartRepository.GetActiveCartByUserIdAsync(dto.UserId);
            return cart == null ? new CartDto() : MapToCartDto(cart);
        }

        #endregion

        #region Cart Info

        public async Task<int> GetCartItemCountAsync(Guid userId)
        {
            return await _cartRepository.GetCartItemCountAsync(userId);
        }

        public async Task<decimal> GetCartTotalAsync(Guid userId)
        {
            return await _cartRepository.GetCartTotalAsync(userId);
        }

        #endregion

        #region Checkout

        public async Task DeactivateCartAsync(Guid cartId)
        {
            await _cartRepository.DeactivateCartAsync(cartId);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation($"Deactivated cart {cartId}");
        }

        public async Task<bool> ValidateCartForCheckoutAsync(Guid userId)
        {
            var cart = await _cartRepository.GetActiveCartByUserIdAsync(userId);

            if (cart == null || !cart.Items.Any())
            {
                return false;
            }

            // Check if all items are still available
            foreach (var item in cart.Items)
            {
                if (!item.Book.IsAvailable)
                {
                    _logger.LogWarning($"Book {item.BookId} in cart is no longer available");
                    return false;
                }
            }

            return true;
        }

        #endregion

        #region Cleanup

        public async Task CleanupStaleCartsAsync(int daysThreshold = 30)
        {
            await _cartItemRepository.DeleteStaleItemsAsync(daysThreshold);
            await _cartItemRepository.SaveChangesAsync();

            _logger.LogInformation($"Cleaned up stale cart items older than {daysThreshold} days");
        }

        #endregion

        // Mapping delegated to CartMapper for better separation of concerns
    }
}
