using BookStore.Application.DTOs.Catalog.Publisher;
using BookStore.Application.Interfaces.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;

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
            return publishers.Select(p => new PublisherDto
            {
                Id = p.Id,
                Name = p.Name,
                Address = p.Address,
                Email = p.Email,
                PhoneNumber = p.PhoneNumber
            });
        }

        public async Task<PublisherDto?> GetByIdAsync(Guid id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            if (publisher == null) return null;

            return new PublisherDto
            {
                Id = publisher.Id,
                Name = publisher.Name,
                Address = publisher.Address,
                Email = publisher.Email,
                PhoneNumber = publisher.PhoneNumber
            };
        }

        public async Task<PublisherDto?> GetByNameAsync(string name)
        {
            var publisher = await _publisherRepository.GetByNameAsync(name);
            if (publisher == null) return null;

            return new PublisherDto
            {
                Id = publisher.Id,
                Name = publisher.Name,
                Address = publisher.Address,
                Email = publisher.Email,
                PhoneNumber = publisher.PhoneNumber
            };
        }

        public async Task<IEnumerable<PublisherDto>> SearchByNameAsync(string searchTerm)
        {
            var publishers = await _publisherRepository.SearchByNameAsync(searchTerm);
            return publishers.Select(p => new PublisherDto
            {
                Id = p.Id,
                Name = p.Name,
                Address = p.Address,
                Email = p.Email,
                PhoneNumber = p.PhoneNumber
            });
        }

        public async Task<PublisherDto> CreateAsync(PublisherDto dto)
        {
            // Validate name exists
            if (await _publisherRepository.IsNameExistsAsync(dto.Name))
            {
                throw new InvalidOperationException($"Nhà xuất bản với tên '{dto.Name}' đã tồn tại");
            }

            var publisher = new Publisher
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Address = dto.Address,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber
            };

            await _publisherRepository.AddAsync(publisher);
            await _publisherRepository.SaveChangesAsync();

            dto.Id = publisher.Id;
            return dto;
        }

        public async Task<PublisherDto> UpdateAsync(PublisherDto dto)
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

            publisher.Name = dto.Name;
            publisher.Address = dto.Address;
            publisher.Email = dto.Email;
            publisher.PhoneNumber = dto.PhoneNumber;

            _publisherRepository.Update(publisher);
            await _publisherRepository.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            if (publisher == null) return false;

            _publisherRepository.Delete(publisher);
            await _publisherRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null)
        {
            return await _publisherRepository.IsNameExistsAsync(name, excludeId);
        }
    }
}