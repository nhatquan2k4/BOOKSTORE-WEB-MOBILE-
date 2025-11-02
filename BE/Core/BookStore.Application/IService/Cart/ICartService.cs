using BookStore.Application.Dtos.Cart;

namespace BookStore.Application.IService.Cart
{
    public interface ICartService
    {
        // Get Cart
        Task<CartDto?> GetActiveCartByUserIdAsync(Guid userId);
        Task<CartDto?> GetCartByIdAsync(Guid cartId);
        Task<CartDto> GetOrCreateCartAsync(Guid userId);
        
        // Manage Cart Items
        Task<CartDto> AddToCartAsync(AddToCartDto dto);
        Task<CartDto> RemoveFromCartAsync(RemoveFromCartDto dto);
        Task<CartDto> UpdateCartItemQuantityAsync(UpdateCartItemDto dto);
        Task<CartDto> ClearCartAsync(ClearCartDto dto);
        
        // Cart Info
        Task<int> GetCartItemCountAsync(Guid userId);
        Task<decimal> GetCartTotalAsync(Guid userId);
        
        // Checkout
        Task DeactivateCartAsync(Guid cartId);
        Task<bool> ValidateCartForCheckoutAsync(Guid userId);
        
        // Cleanup
        Task CleanupStaleCartsAsync(int daysThreshold = 30);
    }
}
