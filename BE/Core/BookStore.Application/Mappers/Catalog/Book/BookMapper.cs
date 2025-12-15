using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.Mappers.Catalog.Author;
using BookStore.Application.Mappers.Catalog.Category;
using BookStore.Application.Mappers.Catalog.Publisher;
using BookStore.Application.Mappers.Catalog.BookImages;
using BookStore.Domain.ValueObjects;
using BookEntity = BookStore.Domain.Entities.Catalog.Book;

namespace BookStore.Application.Mappers.Catalog.Book
{
    /// <summary>
    /// Mapper thủ công cho Book entity
    /// Sử dụng các mapper khác để map nested entities
    /// </summary>
    public static class BookMapper
    {
        /// <summary>
        /// Map Book entity sang BookDto (Simple DTO với tên thay vì nested objects)
        /// Bao gồm: Prices, StockQuantity, Reviews
        /// </summary>
        public static BookDto ToDto(this BookEntity book)
        {
            return new BookDto
            {
                Id = book.Id,
                Title = book.Title ?? string.Empty,
                ISBN = book.ISBN?.Value ?? string.Empty,
                PublicationYear = book.PublicationYear,
                Language = book.Language ?? string.Empty,
                PageCount = book.PageCount,
                IsAvailable = book.IsAvailable,
                PublisherId = book.PublisherId,
                PublisherName = book.Publisher?.Name ?? string.Empty,
                BookFormatId = book.BookFormatId,
                BookFormatName = book.BookFormat?.FormatType ?? string.Empty,

                AuthorNames = book.BookAuthors?
                    .Where(ba => ba?.Author != null)
                    .Select(ba => ba!.Author.Name)
                    .ToList() ?? new List<string>(),

                CategoryNames = book.BookCategories?
                    .Where(bc => bc?.Category != null)
                    .Select(bc => bc!.Category.Name)
                    .ToList() ?? new List<string>(),

                // Current Price (active, non-expired)
                CurrentPrice = book.Prices?
                    .Where(p => p.IsCurrent
                                && p.EffectiveFrom <= DateTime.UtcNow
                                && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                    .OrderByDescending(p => p.EffectiveFrom)
                    .FirstOrDefault()?.Amount,

                // Discount Price (active price with discount)
                DiscountPrice = book.Prices?
                    .Where(p => p.IsCurrent
                                && p.EffectiveFrom <= DateTime.UtcNow
                                && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow)
                                && p.DiscountId.HasValue)
                    .OrderByDescending(p => p.EffectiveFrom)
                    .FirstOrDefault()?.Amount,

                // Stock Quantity
                StockQuantity = book.StockItem?.QuantityOnHand ?? 0,

                // Reviews (TODO: Calculate from Reviews when schema is fixed)
                AverageRating = null,
                TotalReviews = 0
            };
        }
        public static BookDetailDto ToDetailDto(this BookEntity book)
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
                Authors = book.BookAuthors?.Select(ba => AuthorMapper.ToDto(ba.Author)).ToList()
                    ?? new List<Dtos.Catalog.Author.AuthorDto>(),

                // Categories - sử dụng CategoryMapper
                Categories = book.BookCategories?.Select(bc => bc.Category.ToDto()).ToList()
                    ?? new List<Dtos.Catalog.Category.CategoryDto>(),

                // Images - sử dụng BookImageMapper
                Images = book.Images?.ToDtoList() ?? new List<Dtos.Catalog.BookImages.BookImageDto>(),

                // Files - sử dụng BookFileMapper
                Files = book.Files?.ToDtoList() ?? new List<BookFileDto>(),

                // Metadata - sử dụng BookMetadataMapper
                Metadata = book.Metadata?.ToDtoList() ?? new List<BookMetadataDto>()
            };
        }

        /// <summary>
        /// Map CreateBookDto sang Book entity (for Create operation)
        /// </summary>
        public static BookEntity ToEntity(this CreateBookDto dto)
        {
            return new BookEntity
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
        public static void UpdateFromDto(this BookEntity book, UpdateBookDto dto)
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
        public static List<BookDto> ToDtoList(this IEnumerable<BookEntity> books)
        {
            return books.Select(b => b.ToDto()).ToList();
        }
    }
}