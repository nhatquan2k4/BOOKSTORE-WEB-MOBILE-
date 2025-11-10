using BookStore.Domain.Entities.Cart;

namespace BookStore.Domain.IRepository.Cart
{
    public interface ICartItemRepository : IGenericRepository<CartItem>
    {
        // Lấy tất cả items trong cart
        Task<IEnumerable<CartItem>> GetItemsByCartIdAsync(Guid cartId);

        // Lấy item cụ thể (kèm Book info)
        Task<CartItem?> GetItemWithBookAsync(Guid itemId);

        // Lấy item theo CartId và BookId
        Task<CartItem?> GetItemByCartAndBookAsync(Guid cartId, Guid bookId);

        // Kiểm tra book đã có trong cart chưa
        Task<bool> IsBookInCartAsync(Guid cartId, Guid bookId);

        // Đếm số lượng items trong cart
        Task<int> CountItemsInCartAsync(Guid cartId);

        // Tính tổng giá trị của cart
        Task<decimal> GetCartTotalAsync(Guid cartId);

        // Xóa tất cả items trong cart
        Task DeleteAllItemsInCartAsync(Guid cartId);

        // Xóa items cũ (quá X ngày không cập nhật)
        Task DeleteStaleItemsAsync(int daysThreshold = 30);

        // Lấy items của user (qua Cart)
        Task<IEnumerable<CartItem>> GetItemsByUserIdAsync(Guid userId);
    }
}