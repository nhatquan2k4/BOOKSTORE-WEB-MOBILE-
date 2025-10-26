using BookStore.Application.DTOs.Catalog.Author;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IAuthorService
    {
        Task<IEnumerable<AuthorDto>> GetAllAsync();
        Task<AuthorDto?> GetByIdAsync(Guid id);
        Task<AuthorDto?> GetByNameAsync(string name);
        Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm);
        Task<AuthorDto> CreateAsync(AuthorDto dto);
        Task<AuthorDto> UpdateAsync(AuthorDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}