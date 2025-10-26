using BookStore.Application.DTOs.Catalog.Publisher;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho Publisher entity
    /// </summary>
    public static class PublisherMapper
    {
        /// <summary>
        /// Map Publisher entity sang PublisherDto
        /// </summary>
        public static PublisherDto ToDto(this Publisher publisher)
        {
            return new PublisherDto
            {
                Id = publisher.Id,
                Name = publisher.Name,
                Address = publisher.Address,
                Email = publisher.Email,
                PhoneNumber = publisher.PhoneNumber
            };
        }

        /// <summary>
        /// Map collection Publisher entities sang collection PublisherDto
        /// </summary>
        public static List<PublisherDto> ToDtoList(this IEnumerable<Publisher> publishers)
        {
            return publishers.Select(p => p.ToDto()).ToList();
        }

        /// <summary>
        /// Map PublisherDto sang Publisher entity (for Create)
        /// </summary>
        public static Publisher ToEntity(this PublisherDto dto)
        {
            return new Publisher
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                Name = dto.Name,
                Address = dto.Address,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber
            };
        }

        /// <summary>
        /// Update Publisher entity từ PublisherDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this Publisher publisher, PublisherDto dto)
        {
            publisher.Name = dto.Name;
            publisher.Address = dto.Address;
            publisher.Email = dto.Email;
            publisher.PhoneNumber = dto.PhoneNumber;
        }
    }
}