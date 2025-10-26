using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho BookFormat entity
    /// </summary>
    public static class BookFormatMapper
    {
        /// <summary>
        /// Map BookFormat entity sang BookFormatDto
        /// </summary>
        public static BookFormatDto ToDto(this BookFormat bookFormat)
        {
            return new BookFormatDto
            {
                Id = bookFormat.Id,
                FormatType = bookFormat.FormatType,
                Description = bookFormat.Description
            };
        }

        /// <summary>
        /// Map collection BookFormat entities sang collection BookFormatDto
        /// </summary>
        public static List<BookFormatDto> ToDtoList(this IEnumerable<BookFormat> bookFormats)
        {
            return bookFormats.Select(bf => bf.ToDto()).ToList();
        }

        /// <summary>
        /// Map BookFormatDto sang BookFormat entity (for Create)
        /// </summary>
        public static BookFormat ToEntity(this BookFormatDto dto)
        {
            return new BookFormat
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                FormatType = dto.FormatType,
                Description = dto.Description
            };
        }

        /// <summary>
        /// Update BookFormat entity từ BookFormatDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this BookFormat bookFormat, BookFormatDto dto)
        {
            bookFormat.FormatType = dto.FormatType;
            bookFormat.Description = dto.Description;
        }
    }
}