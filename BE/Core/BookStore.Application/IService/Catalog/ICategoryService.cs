using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface ICategoryService : IGenericService<CategoryDto, CategoryDetailDto, CreateCategoryDto, UpdateCategoryDto>
    {
        // Specific queries (GetAllAsync, GetByIdAsync, AddAsync, UpdateAsync, DeleteAsync đã có trong Generic)
        Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(Guid parentId);
        Task<List<CategoryTreeDto>> GetCategoryTreeAsync();
        Task<List<CategoryBreadcrumbDto>> GetBreadcrumbAsync(Guid categoryId);

        // Validations
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
        Task<bool> HasBooksAsync(Guid categoryId);
    }
}