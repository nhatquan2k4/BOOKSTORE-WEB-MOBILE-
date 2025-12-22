using BookStore.Application.Dtos.Catalog.Wishlist;

namespace BookStore.Application.IService.Catalog
{
    public interface IWishlistService
    {
        // Lấy danh sách wishlist của user hiện tại
        Task<List<WishlistDto>> GetUserWishlistAsync(Guid userId);

        // Thêm sách vào wishlist
        Task<WishlistDto> AddToWishlistAsync(Guid userId, Guid bookId);

        // Xóa sách khỏi wishlist
        Task<bool> RemoveFromWishlistAsync(Guid userId, Guid bookId);

        // Kiểm tra xem sách có trong wishlist không
        Task<bool> IsBookInWishlistAsync(Guid userId, Guid bookId);

        // Đếm số sách trong wishlist
        Task<int> GetWishlistCountAsync(Guid userId);

        // Xóa toàn bộ wishlist
        Task ClearWishlistAsync(Guid userId);

        // Lấy danh sách BookIds trong wishlist
        Task<WishlistSummaryDto> GetWishlistSummaryAsync(Guid userId);
    }
}
