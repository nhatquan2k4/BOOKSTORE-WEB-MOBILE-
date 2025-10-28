using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Publisher;
using BookStore.Domain.IRepository.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class PublisherService : IPublisherService
    {
        private readonly IPublisherRepository _publisherRepository;

        public PublisherService(IPublisherRepository publisherRepository)
        {
            _publisherRepository = publisherRepository;
        }

        public async Task<IEnumerable<PublisherDto>> GetAllAsync()
        {
            var publishers = await _publisherRepository.GetAllAsync();
            return publishers.ToDtoList();
        }

        // Explicit implementation for IGenericService (returns PublisherDto)
        async Task<PublisherDto?> IGenericService<PublisherDto, CreatePublisherDto, UpdatePublisherDto>.GetByIdAsync(Guid id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            return publisher?.ToDto();
        }

        // Public implementation for IPublisherService (returns PublisherDetailDto)
        public async Task<PublisherDetailDto?> GetByIdAsync(Guid id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            if (publisher == null) return null;

            return publisher.ToDetailDto();
        }

        public async Task<PublisherDetailDto?> GetByNameAsync(string name)
        {
            var publisher = await _publisherRepository.GetByNameAsync(name);
            if (publisher == null) return null;

            return publisher.ToDetailDto();
        }

        public async Task<IEnumerable<PublisherDto>> SearchByNameAsync(string searchTerm)
        {
            var publishers = await _publisherRepository.SearchByNameAsync(searchTerm);
            return publishers.ToDtoList();
        }

        // Explicit implementation for IGenericService (returns PublisherDto)
        async Task<PublisherDto> IGenericService<PublisherDto, CreatePublisherDto, UpdatePublisherDto>.AddAsync(CreatePublisherDto dto)
        {
            // Validate name exists
            if (await _publisherRepository.IsNameExistsAsync(dto.Name))
            {
                throw new InvalidOperationException($"Nhà xuất bản với tên '{dto.Name}' đã tồn tại");
            }

            var publisher = dto.ToEntity();

            await _publisherRepository.AddAsync(publisher);
            await _publisherRepository.SaveChangesAsync();

            return publisher.ToDto();
        }

        // Public implementation for IPublisherService (returns PublisherDetailDto)
        public async Task<PublisherDetailDto> AddAsync(CreatePublisherDto dto)
        {
            // Validate name exists
            if (await _publisherRepository.IsNameExistsAsync(dto.Name))
            {
                throw new InvalidOperationException($"Nhà xuất bản với tên '{dto.Name}' đã tồn tại");
            }

            var publisher = dto.ToEntity();

            await _publisherRepository.AddAsync(publisher);
            await _publisherRepository.SaveChangesAsync();

            return publisher.ToDetailDto();
        }

        // Explicit implementation for IGenericService (returns PublisherDto)
        async Task<PublisherDto> IGenericService<PublisherDto, CreatePublisherDto, UpdatePublisherDto>.UpdateAsync(UpdatePublisherDto dto)
        {
            var publisher = await _publisherRepository.GetByIdAsync(dto.Id);
            if (publisher == null)
            {
                throw new InvalidOperationException("Nhà xuất bản không tồn tại");
            }

            // Validate name exists (exclude current publisher)
            if (await _publisherRepository.IsNameExistsAsync(dto.Name, dto.Id))
            {
                throw new InvalidOperationException($"Nhà xuất bản với tên '{dto.Name}' đã được sử dụng");
            }

            publisher.UpdateFromDto(dto);

            _publisherRepository.Update(publisher);
            await _publisherRepository.SaveChangesAsync();

            return publisher.ToDto();
        }

        // Public implementation for IPublisherService (returns PublisherDetailDto)
        public async Task<PublisherDetailDto> UpdateAsync(UpdatePublisherDto dto)
        {
            var publisher = await _publisherRepository.GetByIdAsync(dto.Id);
            if (publisher == null)
            {
                throw new InvalidOperationException("Nhà xuất bản không tồn tại");
            }

            // Validate name exists (exclude current publisher)
            if (await _publisherRepository.IsNameExistsAsync(dto.Name, dto.Id))
            {
                throw new InvalidOperationException($"Nhà xuất bản với tên '{dto.Name}' đã được sử dụng");
            }

            publisher.UpdateFromDto(dto);

            _publisherRepository.Update(publisher);
            await _publisherRepository.SaveChangesAsync();

            return publisher.ToDetailDto();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            if (publisher == null) return false;

            _publisherRepository.Delete(publisher);
            await _publisherRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            return publisher != null;
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null)
        {
            return await _publisherRepository.IsNameExistsAsync(name, excludeId);
        }

        public async Task SaveChangesAsync()
        {
            await _publisherRepository.SaveChangesAsync();
        }
    }
}