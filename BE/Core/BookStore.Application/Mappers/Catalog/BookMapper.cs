using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.ValueObjects;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho Book entity
    /// Sử dụng các mapper khác để map nested entities
    /// </summary>
    public static class BookMapper
    {
        /// <summary>
        /// Map Book entity sang BookDto (Simple DTO với tên thay vì nested objects)
        /// </summary>
        public static BookDto ToDto(this Book book)
        {
            return new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN.Value,
                PublicationYear = book.PublicationYear,
                Language = book.Language,
                PageCount = book.PageCount,
                IsAvailable = book.IsAvailable,
                PublisherId = book.PublisherId,
                PublisherName = book.Publisher?.Name ?? string.Empty,
                BookFormatId = book.BookFormatId,
                BookFormatName = book.BookFormat?.FormatType ?? string.Empty,
                AuthorNames = book.BookAuthors?.Select(ba => ba.Author.Name).ToList() ?? new List<string>(),
                CategoryNames = book.BookCategories?.Select(bc => bc.Category.Name).ToList() ?? new List<string>()
            };
        }
        public static BookDetailDto ToDetailDto(this Book book)
        {
            return new BookDetailDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN.Value,
                Description = book.Description,
                PublicationYear = book.PublicationYear,
                Language = book.Language,
                Edition = book.Edition,
                PageCount = book.PageCount,
                IsAvailable = book.IsAvailable,

                // Publisher - sử dụng PublisherMapper
                Publisher = book.Publisher?.ToDto()!,

                // BookFormat - sử dụng BookFormatMapper
                BookFormat = book.BookFormat?.ToDto(),

                // Authors - sử dụng AuthorMapper
                Authors = book.BookAuthors?.Select(ba => ba.Author.ToDto()).ToList()
                    ?? new List<DTOs.Catalog.Author.AuthorDto>(),

                // Categories - sử dụng CategoryMapper
                Categories = book.BookCategories?.Select(bc => bc.Category.ToDto()).ToList()
                    ?? new List<DTOs.Catalog.Category.CategoryDto>(),

                // Images - sử dụng BookImageMapper
                Images = book.Images?.ToDtoList() ?? new List<BookImageDto>(),

                // Files - sử dụng BookFileMapper
                Files = book.Files?.ToDtoList() ?? new List<BookFileDto>(),

                // Metadata - sử dụng BookMetadataMapper
                Metadata = book.Metadata?.ToDtoList() ?? new List<BookMetadataDto>()
            };
        }

        /// <summary>
        /// Map CreateBookDto sang Book entity (for Create operation)
        /// </summary>
        public static Book ToEntity(this CreateBookDto dto)
        {
            return new Book
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                ISBN = new ISBN(dto.ISBN),
                Description = dto.Description,
                PublicationYear = dto.PublicationYear,
                Language = dto.Language,
                Edition = dto.Edition,
                PageCount = dto.PageCount,
                IsAvailable = dto.IsAvailable,
                PublisherId = dto.PublisherId,
                BookFormatId = dto.BookFormatId
                // BookAuthors và BookCategories sẽ được thêm riêng trong Service
            };
        }

        /// <summary>
        /// Update Book entity từ UpdateBookDto (for Update operation)
        /// </summary>
        public static void UpdateFromDto(this Book book, UpdateBookDto dto)
        {
            book.Title = dto.Title;
            book.ISBN = new ISBN(dto.ISBN);
            book.Description = dto.Description;
            book.PublicationYear = dto.PublicationYear;
            book.Language = dto.Language;
            book.Edition = dto.Edition;
            book.PageCount = dto.PageCount;
            book.IsAvailable = dto.IsAvailable;
            book.PublisherId = dto.PublisherId;
            book.BookFormatId = dto.BookFormatId;
        }

        /// <summary>
        /// Map collection Book entities sang collection BookDto
        /// </summary>
        public static List<BookDto> ToDtoList(this IEnumerable<Book> books)
        {
            return books.Select(b => b.ToDto()).ToList();
        }
    }
}