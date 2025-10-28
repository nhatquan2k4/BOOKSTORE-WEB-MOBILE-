using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Category;
using BookStore.Domain.Interfaces.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.ToDtoList();
        }

        public async Task<CategoryDetailDto?> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return null;

            // Get breadcrumbs by traversing parent hierarchy
            var breadcrumbs = new List<CategoryBreadcrumbDto>();
            var current = category;
            while (current != null)
            {
                breadcrumbs.Insert(0, current.ToBreadcrumbDto(breadcrumbs.Count));
                current = current.Parent;
            }

            var detailDto = category.ToDetailDto();
            detailDto.Breadcrumbs = breadcrumbs;
            return detailDto;
        }

        public async Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(Guid parentId)
        {
            var categories = await _categoryRepository.GetSubCategoriesAsync(parentId);
            return categories.ToDtoList();
        }

        public async Task<List<CategoryTreeDto>> GetCategoryTreeAsync()
        {
            // Get all categories and build tree
            var allCategories = await _categoryRepository.GetAllAsync();
            var rootCategories = allCategories.Where(c => c.ParentId == null).ToList();

            // Build tree from root categories
            var trees = rootCategories.Select(c => c.ToTreeDto(0)).ToList();

            return trees;
        }

        public async Task<List<CategoryBreadcrumbDto>> GetBreadcrumbAsync(Guid categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null) return new List<CategoryBreadcrumbDto>();

            var breadcrumbs = new List<CategoryBreadcrumbDto>();
            var current = category;
            while (current != null)
            {
                breadcrumbs.Insert(0, current.ToBreadcrumbDto(breadcrumbs.Count));
                current = current.Parent;
            }

            return breadcrumbs;
        }

        public async Task<CategoryDetailDto> AddAsync(CreateCategoryDto dto)
        {
            // Validate parent exists if provided
            if (dto.ParentId.HasValue)
            {
                var parent = await _categoryRepository.GetByIdAsync(dto.ParentId.Value);
                if (parent == null)
                {
                    throw new InvalidOperationException("Danh mục cha không tồn tại");
                }
            }

            var category = dto.ToEntity();

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.SaveChangesAsync();

            return (await GetByIdAsync(category.Id))!;
        }

        public async Task<CategoryDetailDto> UpdateAsync(UpdateCategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.Id);
            if (category == null)
            {
                throw new InvalidOperationException("Danh mục không tồn tại");
            }

            // Validate parent exists if provided
            if (dto.ParentId.HasValue)
            {
                if (dto.ParentId.Value == dto.Id)
                {
                    throw new InvalidOperationException("Danh mục không thể là danh mục cha của chính nó");
                }

                var parent = await _categoryRepository.GetByIdAsync(dto.ParentId.Value);
                if (parent == null)
                {
                    throw new InvalidOperationException("Danh mục cha không tồn tại");
                }

                // Check if new parent is a descendant (would create circular reference)
                var current = parent;
                while (current != null)
                {
                    if (current.ParentId == dto.Id)
                    {
                        throw new InvalidOperationException("Không thể chọn danh mục con làm danh mục cha");
                    }
                    current = current.Parent;
                }
            }

            category.UpdateFromDto(dto);

            _categoryRepository.Update(category);
            await _categoryRepository.SaveChangesAsync();

            return (await GetByIdAsync(category.Id))!;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            // Check if category has subcategories
            if (await _categoryRepository.HasSubCategoriesAsync(id))
            {
                throw new InvalidOperationException("Không thể xóa danh mục có danh mục con");
            }

            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return false;

            _categoryRepository.Delete(category);
            await _categoryRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            return category != null;
        }

        public async Task<bool> HasSubCategoriesAsync(Guid categoryId)
        {
            return await _categoryRepository.HasSubCategoriesAsync(categoryId);
        }

        public async Task<bool> HasBooksAsync(Guid categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            return category?.BookCategories?.Any() ?? false;
        }
    }
}