using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Application.DTOs.Catalog.Author;
using BookStore.Application.DTOs.Catalog.Category;
using BookStore.Application.DTOs.Catalog.Publisher;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.ValueObjects;

namespace BookStore.Application.Mappers.Catalog
{
    public static class BookMapper
    {
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

                // Publisher
                Publisher = book.Publisher != null ? new PublisherDto
                {
                    Id = book.Publisher.Id,
                    Name = book.Publisher.Name,
                    Address = book.Publisher.Address,
                    Email = book.Publisher.Email,
                    PhoneNumber = book.Publisher.PhoneNumber
                } : null!,

                // BookFormat
                BookFormat = book.BookFormat != null ? new BookFormatDto
                {
                    Id = book.BookFormat.Id,
                    FormatType = book.BookFormat.FormatType,
                    Description = book.BookFormat.Description
                } : null,

                // Authors
                Authors = book.BookAuthors?.Select(ba => new AuthorDto
                {
                    Id = ba.Author.Id,
                    Name = ba.Author.Name,
                    Biography = ba.Author.Biography,
                    AvartarUrl = ba.Author.AvartarUrl
                }).ToList() ?? new List<AuthorDto>(),

                // Categories
                Categories = book.BookCategories?.Select(bc => new CategoryDto
                {
                    Id = bc.Category.Id,
                    Name = bc.Category.Name,
                    Description = bc.Category.Description,
                    ParentId = bc.Category.ParentId ?? Guid.Empty
                }).ToList() ?? new List<CategoryDto>(),

                // Images
                Images = book.Images?.Select(i => new BookImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    IsCover = i.IsCover,
                    DisplayOrder = i.DisplayOrder,
                    BookId = i.BookId
                }).ToList() ?? new List<BookImageDto>(),

                // Files
                Files = book.Files?.Select(f => new BookFileDto
                {
                    Id = f.Id,
                    FileUrl = f.FileUrl,
                    FileType = f.FileType,
                    FileSize = f.FileSize,
                    IsPreview = f.IsPreview,
                    BookId = f.BookId
                }).ToList() ?? new List<BookFileDto>(),

                // Metadata
                Metadata = book.Metadata?.Select(m => new BookMetadataDto
                {
                    Id = m.Id,
                    Key = m.Key,
                    Value = m.Value,
                    BookId = m.BookId
                }).ToList() ?? new List<BookMetadataDto>()
            };
        }
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
        public static List<BookDto> ToDtoList(this IEnumerable<Book> books)
        {
            return books.Select(b => b.ToDto()).ToList();
        }
    }
}