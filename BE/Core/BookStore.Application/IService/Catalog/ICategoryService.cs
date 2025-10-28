using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface ICategoryService : IGenericService<CategoryDto, CreateCategoryDto, UpdateCategoryDto>
    {
        // Override methods từ IGenericService để trả về CategoryDetailDto
        new Task<CategoryDetailDto?> GetByIdAsync(Guid id);
        new Task<CategoryDetailDto> AddAsync(CreateCategoryDto dto);
        new Task<CategoryDetailDto> UpdateAsync(UpdateCategoryDto dto);

        // Specific queries
        Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(Guid parentId);
        Task<List<CategoryTreeDto>> GetCategoryTreeAsync();
        Task<List<CategoryBreadcrumbDto>> GetBreadcrumbAsync(Guid categoryId);

        // Validations
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
        Task<bool> HasBooksAsync(Guid categoryId);
    }
}