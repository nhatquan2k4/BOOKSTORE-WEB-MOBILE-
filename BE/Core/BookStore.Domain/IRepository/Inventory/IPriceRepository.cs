using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Domain.IRepository.Inventory
{
    public interface IPriceRepository : IGenericRepository<Price>
    {
        // Lấy giá hiện tại của sách
        Task<Price?> GetCurrentPriceByBookIdAsync(Guid bookId);
        
        // Lấy lịch sử giá của sách
        Task<IEnumerable<Price>> GetPriceHistoryByBookIdAsync(Guid bookId);
        
        // Lấy tất cả giá hiện hành
        Task<IEnumerable<Price>> GetAllCurrentPricesAsync();
        
        // Cập nhật giá hiện tại thành không còn hiệu lực
        Task DeactivateCurrentPriceAsync(Guid bookId);
        
        // Lấy sách có giá trong khoảng
        Task<IEnumerable<Price>> GetBooksByPriceRangeAsync(decimal minPrice, decimal maxPrice);
        
        // Cập nhật giá hàng loạt
        Task BulkUpdatePricesAsync(List<Price> prices);
    }
}
