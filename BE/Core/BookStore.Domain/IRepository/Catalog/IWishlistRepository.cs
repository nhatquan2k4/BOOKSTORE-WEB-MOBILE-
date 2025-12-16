using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.IRepository.Catalog
{
    public interface IWishlistRepository : IGenericRepository<Wishlist>
    {
        // Lấy tất cả wishlist items của một user (kèm Book info)
        Task<List<Wishlist>> GetWishlistByUserIdAsync(Guid userId);

        // Kiểm tra xem sách đã có trong wishlist của user chưa
        Task<bool> IsBookInWishlistAsync(Guid userId, Guid bookId);

        // Lấy một wishlist item cụ thể
        Task<Wishlist?> GetWishlistItemAsync(Guid userId, Guid bookId);

        // Thêm sách vào wishlist
        Task<Wishlist> AddToWishlistAsync(Guid userId, Guid bookId);

        // Xóa sách khỏi wishlist
        Task<bool> RemoveFromWishlistAsync(Guid userId, Guid bookId);

        // Đếm số sách trong wishlist của user
        Task<int> GetWishlistCountAsync(Guid userId);

        // Xóa toàn bộ wishlist của user
        Task ClearWishlistAsync(Guid userId);

        // Lấy danh sách BookIds trong wishlist
        Task<List<Guid>> GetWishlistBookIdsAsync(Guid userId);
    }
}
