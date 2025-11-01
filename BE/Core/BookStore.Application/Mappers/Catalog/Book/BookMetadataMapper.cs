using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho BookMetadata entity
    /// </summary>
    public static class BookMetadataMapper
    {
        /// <summary>
        /// Map BookMetadata entity sang BookMetadataDto
        /// </summary>
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

        /// <summary>
        /// Map collection BookMetadata entities sang collection BookMetadataDto
        /// </summary>
        public static List<BookMetadataDto> ToDtoList(this IEnumerable<BookMetadata> bookMetadatas)
        {
            return bookMetadatas.Select(bm => bm.ToDto()).ToList();
        }

        /// <summary>
        /// Map BookMetadataDto sang BookMetadata entity (for Create)
        /// </summary>
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

        /// <summary>
        /// Update BookMetadata entity từ BookMetadataDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this BookMetadata bookMetadata, BookMetadataDto dto)
        {
            bookMetadata.Key = dto.Key;
            bookMetadata.Value = dto.Value;
            bookMetadata.BookId = dto.BookId;
        }
    }
}