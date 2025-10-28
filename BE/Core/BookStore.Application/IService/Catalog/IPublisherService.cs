using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface IPublisherService : IGenericService<PublisherDto, PublisherDetailDto, CreatePublisherDto, UpdatePublisherDto>
    {
        // Specific queries (GetAllAsync, GetByIdAsync, AddAsync, UpdateAsync, DeleteAsync đã có trong Generic)
        Task<IEnumerable<PublisherDto>> SearchByNameAsync(string searchTerm);
        Task<PublisherDetailDto?> GetByNameAsync(string name);

        // Validations
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}