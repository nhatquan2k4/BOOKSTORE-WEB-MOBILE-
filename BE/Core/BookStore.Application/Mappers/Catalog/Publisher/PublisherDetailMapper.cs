using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.Mappers.Catalog.Book;
using PublisherEntity = BookStore.Domain.Entities.Catalog.Publisher;

namespace BookStore.Application.Mappers.Catalog.Publisher
{
    /// <summary>
    /// Mapper cho PublisherDetailDto (bao gồm navigation properties)
    /// </summary>
    public static class PublisherDetailMapper
    {
        /// <summary>
        /// Map Publisher entity sang PublisherDetailDto (bao gồm Books)
        /// </summary>
        public static PublisherDetailDto ToDetailDto(this PublisherEntity publisher)
        {
            return new PublisherDetailDto
            {
                Id = publisher.Id,
                Name = publisher.Name,
                Address = publisher.Address,
                Email = publisher.Email,
                PhoneNumber = publisher.PhoneNumber,
                BookCount = publisher.Books?.Count ?? 0,
                Books = publisher.Books?.Select(b => BookMapper.ToDto(b)).ToList() ?? new List<Dtos.Catalog.Book.BookDto>()
            };
        }
    }
}
