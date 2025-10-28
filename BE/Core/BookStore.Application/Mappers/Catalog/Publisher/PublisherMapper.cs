using BookStore.Application.Dtos.Catalog.Publisher;
using PublisherEntity = BookStore.Domain.Entities.Catalog.Publisher;

namespace BookStore.Application.Mappers.Catalog.Publisher
{
    /// <summary>
    /// Mapper thủ công cho Publisher entity
    /// </summary>
    public static class PublisherMapper
    {
        /// <summary>
        /// Map Publisher entity sang PublisherDto
        /// </summary>
        public static PublisherDto ToDto(this PublisherEntity publisher)
        {
            return new PublisherDto
            {
                Id = publisher.Id,
                Name = publisher.Name,
                Address = publisher.Address,
                Email = publisher.Email,
                PhoneNumber = publisher.PhoneNumber,
                BookCount = publisher.Books?.Count ?? 0
            };
        }

        /// <summary>
        /// Map collection Publisher entities sang collection PublisherDto
        /// </summary>
        public static List<PublisherDto> ToDtoList(this IEnumerable<PublisherEntity> publishers)
        {
            return publishers.Select(p => PublisherMapper.ToDto(p)).ToList();
        }

        /// <summary>
        /// Map CreatePublisherDto sang Publisher entity (for Create)
        /// </summary>
        public static PublisherEntity ToEntity(this CreatePublisherDto dto)
        {
            return new PublisherEntity
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Address = dto.Address,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber
            };
        }

        /// <summary>
        /// Update Publisher entity từ UpdatePublisherDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this PublisherEntity publisher, UpdatePublisherDto dto)
        {
            publisher.Name = dto.Name;
            publisher.Address = dto.Address;
            publisher.Email = dto.Email;
            publisher.PhoneNumber = dto.PhoneNumber;
        }
    }
}