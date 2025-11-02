using BookStore.Domain.Entities.Ordering;

namespace BookStore.Domain.IRepository.Cart
{
    public interface ICartRepository : IGenericRepository<Entities.Ordering.Cart>
    {
        // Lấy cart active của user (kèm CartItems và Book info)
        Task<Entities.Ordering.Cart?> GetActiveCartByUserIdAsync(Guid userId);
        
        // Lấy cart theo Id (kèm đầy đủ items)
        Task<Entities.Ordering.Cart?> GetCartWithItemsAsync(Guid cartId);
        
        // Tạo hoặc lấy cart active cho user
        Task<Entities.Ordering.Cart> GetOrCreateCartAsync(Guid userId);
        
        // Thêm item vào cart (hoặc tăng quantity nếu đã tồn tại)
        Task AddOrUpdateItemAsync(Guid userId, Guid bookId, int quantity);
        
        // Xóa item khỏi cart
        Task RemoveItemAsync(Guid userId, Guid bookId);
        
        // Cập nhật quantity của item
        Task UpdateItemQuantityAsync(Guid userId, Guid bookId, int quantity);
        
        // Xóa toàn bộ items trong cart (clear cart)
        Task ClearCartAsync(Guid userId);
        
        // Đánh dấu cart không active (sau khi checkout)
        Task DeactivateCartAsync(Guid cartId);
        
        // Đếm số items trong cart
        Task<int> GetCartItemCountAsync(Guid userId);
        
        // Tính tổng giá trị cart
        Task<decimal> GetCartTotalAsync(Guid userId);
    }
}