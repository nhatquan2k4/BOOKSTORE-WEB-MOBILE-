using BookStore.Application.DTOs.ChatBot;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookStore.Application.IService.ChatBot
{
    public interface IBookDataCacheService
    {

        Task LoadCacheAsync();

        List<CachedBookDto> GetAllBooks();

        List<CachedCategoryDto> GetAllCategories();
        List<CachedBookDto> SearchBooks(string keyword);
        bool IsCacheLoaded();

        Task RefreshCacheAsync();
    }
}
