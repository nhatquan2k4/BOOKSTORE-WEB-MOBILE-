using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{

    public static class BookMetadataMapper
    {

        public static BookMetadataDto ToDto(this BookMetadata bookMetadata)
        {
            return new BookMetadataDto
            {
                Id = bookMetadata.Id,
                Key = bookMetadata.Key,
                Value = bookMetadata.Value,
                BookId = bookMetadata.BookId
            };
        }

        public static List<BookMetadataDto> ToDtoList(this IEnumerable<BookMetadata> bookMetadatas)
        {
            return bookMetadatas.Select(bm => bm.ToDto()).ToList();
        }

        public static BookMetadata ToEntity(this BookMetadataDto dto)
        {
            return new BookMetadata
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                Key = dto.Key,
                Value = dto.Value,
                BookId = dto.BookId
            };
        }

        public static void UpdateFromDto(this BookMetadata bookMetadata, BookMetadataDto dto)
        {
            bookMetadata.Key = dto.Key;
            bookMetadata.Value = dto.Value;
            bookMetadata.BookId = dto.BookId;
        }
    }
}