using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface IAuthorService : IGenericService<AuthorDto, CreateAuthorDto, UpdateAuthorDto>
    {
        // Override methods từ IGenericService để trả về AuthorDetailDto
        new Task<AuthorDetailDto?> GetByIdAsync(Guid id);
        new Task<AuthorDetailDto> AddAsync(CreateAuthorDto dto);
        new Task<AuthorDetailDto> UpdateAsync(UpdateAuthorDto dto);

        // Specific queries
        Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm);
        Task<AuthorDetailDto?> GetByNameAsync(string name);

        // Validations
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}