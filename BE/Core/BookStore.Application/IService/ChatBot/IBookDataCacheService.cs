using BookStore.Application.DTOs.ChatBot;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookStore.Application.IService.ChatBot
{
    /// <summary>
    /// Service để cache tất cả dữ liệu sách và thể loại trong memory
    /// Giúp ChatBot truy xuất nhanh mà không cần query DB nhiều lần
    /// </summary>
    public interface IBookDataCacheService
    {
        /// <summary>
        /// Load tất cả sách và thể loại vào cache
        /// </summary>
        Task LoadCacheAsync();

        /// <summary>
        /// Lấy tất cả sách từ cache
        /// </summary>
        List<CachedBookDto> GetAllBooks();

        /// <summary>
        /// Lấy tất cả thể loại từ cache
        /// </summary>
        List<CachedCategoryDto> GetAllCategories();

        /// <summary>
        /// Tìm kiếm sách theo từ khóa trong cache
        /// </summary>
        List<CachedBookDto> SearchBooks(string keyword);

        /// <summary>
        /// Kiểm tra xem cache đã được load chưa
        /// </summary>
        bool IsCacheLoaded();

        /// <summary>
        /// Refresh cache (gọi lại LoadCacheAsync)
        /// </summary>
        Task RefreshCacheAsync();
    }
}
