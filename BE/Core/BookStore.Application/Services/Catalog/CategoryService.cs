using BookStore.Application.DTOs.Catalog.Category;
using BookStore.Application.Interfaces.Catalog;
using BookStore.Domain.Entities.Catalog;
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
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ParentId = c.ParentId ?? Guid.Empty
            });
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentId = category.ParentId ?? Guid.Empty
            };
        }

        public async Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(Guid parentId)
        {
            var categories = await _categoryRepository.GetSubCategoriesAsync(parentId);
            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ParentId = c.ParentId ?? Guid.Empty
            });
        }

        public async Task<CategoryDto> CreateAsync(CategoryDto dto)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId
            };

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.SaveChangesAsync();

            dto.Id = category.Id;
            return dto;
        }

        public async Task<CategoryDto> UpdateAsync(CategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.Id);
            if (category == null)
            {
                throw new InvalidOperationException("Danh mục không tồn tại");
            }

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId;

            _categoryRepository.Update(category);
            await _categoryRepository.SaveChangesAsync();

            return dto;
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

        public async Task<bool> HasSubCategoriesAsync(Guid categoryId)
        {
            return await _categoryRepository.HasSubCategoriesAsync(categoryId);
        }
    }
}