using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog.Book
{

    public static class BookFormatMapper
    {

        public static BookFormatDto ToDto(this BookFormat bookFormat)
        {
            return new BookFormatDto
            {
                Id = bookFormat.Id,
                FormatType = bookFormat.FormatType,
                Description = bookFormat.Description
            };
        }

        public static List<BookFormatDto> ToDtoList(this IEnumerable<BookFormat> bookFormats)
        {
            return bookFormats.Select(bf => bf.ToDto()).ToList();
        }

        public static BookFormat ToEntity(this BookFormatDto dto)
        {
            return new BookFormat
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                FormatType = dto.FormatType,
                Description = dto.Description
            };
        }

        public static void UpdateFromDto(this BookFormat bookFormat, BookFormatDto dto)
        {
            bookFormat.FormatType = dto.FormatType;
            bookFormat.Description = dto.Description;
        }
    }
}