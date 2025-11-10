using BookStore.Domain.Entities.Ordering;

namespace BookStore.Domain.IRepository.Ordering
{
    public interface IOrderItemRepository : IGenericRepository<OrderItem>
    {
        // Lấy tất cả items của một order
        Task<IEnumerable<OrderItem>> GetItemsByOrderIdAsync(Guid orderId);
        
        // Lấy item chi tiết (kèm Book info)
        Task<OrderItem?> GetItemWithBookAsync(Guid itemId);
        
        // Lấy tất cả items của một book (để thống kê sách bán chạy)
        Task<IEnumerable<OrderItem>> GetItemsByBookIdAsync(Guid bookId, int skip = 0, int take = 20);
        
        // Đếm số lượng book đã bán
        Task<int> GetTotalQuantitySoldAsync(Guid bookId);
        
        // Lấy top sách bán chạy (theo số lượng)
        Task<IEnumerable<(Guid BookId, int TotalQuantity)>> GetTopSellingBooksAsync(int count = 10, DateTime? fromDate = null, DateTime? toDate = null);
        
        // Lấy doanh thu theo book
        Task<decimal> GetRevenueByBookAsync(Guid bookId, DateTime? fromDate = null, DateTime? toDate = null);
        
        // Kiểm tra user đã mua sách này chưa
        Task<bool> HasUserPurchasedBookAsync(Guid userId, Guid bookId);
    }
}
