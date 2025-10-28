using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface IPublisherService : IGenericService<PublisherDto, CreatePublisherDto, UpdatePublisherDto>
    {
        // Override methods từ IGenericService để trả về PublisherDetailDto
        new Task<PublisherDetailDto?> GetByIdAsync(Guid id);
        new Task<PublisherDetailDto> AddAsync(CreatePublisherDto dto);
        new Task<PublisherDetailDto> UpdateAsync(UpdatePublisherDto dto);

        // Specific queries
        Task<IEnumerable<PublisherDto>> SearchByNameAsync(string searchTerm);
        Task<PublisherDetailDto?> GetByNameAsync(string name);

        // Validations
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}