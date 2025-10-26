using BookStore.Application.DTOs.Catalog.Publisher;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IPublisherService
    {
        Task<IEnumerable<PublisherDto>> GetAllAsync();
        Task<PublisherDto?> GetByIdAsync(Guid id);
        Task<PublisherDto?> GetByNameAsync(string name);
        Task<IEnumerable<PublisherDto>> SearchByNameAsync(string searchTerm);
        Task<PublisherDto> CreateAsync(PublisherDto dto);
        Task<PublisherDto> UpdateAsync(PublisherDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}