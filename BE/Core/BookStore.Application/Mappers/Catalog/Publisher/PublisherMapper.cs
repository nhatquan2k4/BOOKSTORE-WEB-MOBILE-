using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Shared.Utilities;
using PublisherEntity = BookStore.Domain.Entities.Catalog.Publisher;

namespace BookStore.Application.Mappers.Catalog.Publisher
{

    public static class PublisherMapper
    {

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

        public static List<PublisherDto> ToDtoList(this IEnumerable<PublisherEntity> publishers)
        {
            return publishers.Select(p => PublisherMapper.ToDto(p)).ToList();
        }

        public static PublisherEntity ToEntity(this CreatePublisherDto dto)
        {
            return new PublisherEntity
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.NormalizeSpace(),
                Address = dto.Address?.NormalizeSpace(),
                Email = dto.Email?.Trim(),
                PhoneNumber = dto.PhoneNumber?.Trim()
            };
        }

        public static void UpdateFromDto(this PublisherEntity publisher, UpdatePublisherDto dto)
        {
            publisher.Name = dto.Name.NormalizeSpace();
            publisher.Address = dto.Address?.NormalizeSpace();
            publisher.Email = dto.Email?.Trim();
            publisher.PhoneNumber = dto.PhoneNumber?.Trim();
        }
    }
}