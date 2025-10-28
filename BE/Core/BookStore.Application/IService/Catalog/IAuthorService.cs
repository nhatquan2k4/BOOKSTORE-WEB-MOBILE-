using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.IService;
using BookStore.Application.Service;

namespace BookStore.Application.IService.Catalog
{
    public interface IAuthorService : IGenericService<AuthorDto, CreateAuthorDto, UpdateAuthorDto>
    {
        Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm);
        Task<AuthorDetailDto?> GetByNameAsync(string name);

        // Validations
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}