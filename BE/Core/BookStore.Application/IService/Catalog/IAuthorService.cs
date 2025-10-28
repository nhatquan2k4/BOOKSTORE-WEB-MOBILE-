using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface IAuthorService : IGenericService<AuthorDto, AuthorDetailDto, CreateAuthorDto, UpdateAuthorDto>
    {
        // Specific queries (GetAllAsync, GetByIdAsync, AddAsync, UpdateAsync, DeleteAsync đã có trong Generic)
        Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm);
        Task<AuthorDetailDto?> GetByNameAsync(string name);

        // Validations
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}