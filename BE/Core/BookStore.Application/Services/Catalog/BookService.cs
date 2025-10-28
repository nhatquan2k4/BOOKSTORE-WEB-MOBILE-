using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Author;
using BookStore.Application.Mappers.Catalog.Category;
using BookStore.Application.Mappers.Catalog.Publisher;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;
using BookStore.Domain.ValueObjects;

namespace BookStore.Application.Services.Catalog
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IAuthorRepository _authorRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IPublisherRepository _publisherRepository;
        private readonly IBookFormatRepository _bookFormatRepository;

        public BookService(
            IBookRepository bookRepository,
            IAuthorRepository authorRepository,
            ICategoryRepository categoryRepository,
            IPublisherRepository publisherRepository,
            IBookFormatRepository bookFormatRepository)
        {
            _bookRepository = bookRepository;
            _authorRepository = authorRepository;
            _categoryRepository = categoryRepository;
            _publisherRepository = publisherRepository;
            _bookFormatRepository = bookFormatRepository;
        }

        public async Task<(List<BookDto> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null)
        {
            // Get all books
            var allBooks = await _bookRepository.GetAllAsync();

            // Apply filters
            var query = allBooks.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(b => b.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                                        b.ISBN.Value.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
            }

            if (authorId.HasValue)
            {
                query = query.Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId.Value));
            }

            if (publisherId.HasValue)
            {
                query = query.Where(b => b.PublisherId == publisherId.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(b => b.IsAvailable == isAvailable.Value);
            }

            var totalCount = query.Count();

            // Apply pagination
            var books = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var bookDtos = books.Select(MapToBookDto).ToList();

            return (bookDtos, totalCount);
        }

        public async Task<BookDetailDto?> GetByIdAsync(Guid id)
        {
            var book = await _bookRepository.GetDetailByIdAsync(id);
            if (book == null) return null;

            return MapToBookDetailDto(book);
        }

        public async Task<BookDetailDto?> GetByISBNAsync(string isbn)
        {
            var book = await _bookRepository.GetByISBNAsync(isbn);
            if (book == null) return null;

            return MapToBookDetailDto(book);
        }

        public async Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeBookId = null)
        {
            return await _bookRepository.IsISBNExistsAsync(isbn, excludeBookId);
        }

        public async Task<BookDetailDto> CreateAsync(CreateBookDto dto)
        {
            // Validate ISBN exists
            if (await _bookRepository.IsISBNExistsAsync(dto.ISBN))
            {
                throw new InvalidOperationException($"Sách với ISBN '{dto.ISBN}' đã tồn tại");
            }

            // Validate Publisher exists
            var publisher = await _publisherRepository.GetByIdAsync(dto.PublisherId);
            if (publisher == null)
            {
                throw new InvalidOperationException("Nhà xuất bản không tồn tại");
            }

            // Validate BookFormat if provided
            if (dto.BookFormatId.HasValue)
            {
                var bookFormat = await _bookFormatRepository.GetByIdAsync(dto.BookFormatId.Value);
                if (bookFormat == null)
                {
                    throw new InvalidOperationException("Định dạng sách không tồn tại");
                }
            }

            // Validate Authors exist
            var authors = new List<Author>();
            foreach (var authorId in dto.AuthorIds)
            {
                var author = await _authorRepository.GetByIdAsync(authorId);
                if (author == null)
                {
                    throw new InvalidOperationException($"Tác giả với ID {authorId} không tồn tại");
                }
                authors.Add(author);
            }

            // Validate Categories exist
            var categories = new List<Category>();
            foreach (var categoryId in dto.CategoryIds)
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                {
                    throw new InvalidOperationException($"Thể loại với ID {categoryId} không tồn tại");
                }
                categories.Add(category);
            }

            // Create Book entity
            var book = new Book
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
            };

            // Add BookAuthors (many-to-many)
            foreach (var author in authors)
            {
                book.BookAuthors.Add(new BookAuthor
                {
                    BookId = book.Id,
                    AuthorId = author.Id,
                    Book = book,
                    Author = author
                });
            }

            // Add BookCategories (many-to-many)
            foreach (var category in categories)
            {
                book.BookCategories.Add(new BookCategory
                {
                    BookId = book.Id,
                    CategoryId = category.Id,
                    Book = book,
                    Category = category
                });
            }

            await _bookRepository.AddAsync(book);
            await _bookRepository.SaveChangesAsync();

            // Return detail
            var createdBook = await _bookRepository.GetDetailByIdAsync(book.Id);
            return MapToBookDetailDto(createdBook!);
        }

        public async Task<BookDetailDto> UpdateAsync(UpdateBookDto dto)
        {
            var book = await _bookRepository.GetDetailByIdAsync(dto.Id);
            if (book == null)
            {
                throw new InvalidOperationException("Sách không tồn tại");
            }

            // Validate ISBN exists (exclude current book)
            if (await _bookRepository.IsISBNExistsAsync(dto.ISBN, dto.Id))
            {
                throw new InvalidOperationException($"Sách với ISBN '{dto.ISBN}' đã tồn tại");
            }

            // Validate Publisher exists
            var publisher = await _publisherRepository.GetByIdAsync(dto.PublisherId);
            if (publisher == null)
            {
                throw new InvalidOperationException("Nhà xuất bản không tồn tại");
            }

            // Validate BookFormat if provided
            if (dto.BookFormatId.HasValue)
            {
                var bookFormat = await _bookFormatRepository.GetByIdAsync(dto.BookFormatId.Value);
                if (bookFormat == null)
                {
                    throw new InvalidOperationException("Định dạng sách không tồn tại");
                }
            }

            // Validate Authors exist
            var authors = new List<Author>();
            foreach (var authorId in dto.AuthorIds)
            {
                var author = await _authorRepository.GetByIdAsync(authorId);
                if (author == null)
                {
                    throw new InvalidOperationException($"Tác giả với ID {authorId} không tồn tại");
                }
                authors.Add(author);
            }

            // Validate Categories exist
            var categories = new List<Category>();
            foreach (var categoryId in dto.CategoryIds)
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                {
                    throw new InvalidOperationException($"Thể loại với ID {categoryId} không tồn tại");
                }
                categories.Add(category);
            }

            // Update basic properties
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

            // Update BookAuthors (many-to-many)
            book.BookAuthors.Clear();
            foreach (var author in authors)
            {
                book.BookAuthors.Add(new BookAuthor
                {
                    BookId = book.Id,
                    AuthorId = author.Id,
                    Book = book,
                    Author = author
                });
            }

            // Update BookCategories (many-to-many)
            book.BookCategories.Clear();
            foreach (var category in categories)
            {
                book.BookCategories.Add(new BookCategory
                {
                    BookId = book.Id,
                    CategoryId = category.Id,
                    Book = book,
                    Category = category
                });
            }

            _bookRepository.Update(book);
            await _bookRepository.SaveChangesAsync();

            // Return updated detail
            var updatedBook = await _bookRepository.GetDetailByIdAsync(book.Id);
            return MapToBookDetailDto(updatedBook!);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null) return false;

            _bookRepository.Delete(book);
            await _bookRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateAvailabilityAsync(Guid id, bool isAvailable)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null) return false;

            book.IsAvailable = isAvailable;
            _bookRepository.Update(book);
            await _bookRepository.SaveChangesAsync();

            return true;
        }

        public async Task<List<BookDto>> GetByCategoryAsync(Guid categoryId, int top = 10)
        {
            var books = await _bookRepository.GetByCategoryAsync(categoryId);
            return books.Take(top).Select(MapToBookDto).ToList();
        }

        public async Task<List<BookDto>> GetByAuthorAsync(Guid authorId, int top = 10)
        {
            var books = await _bookRepository.GetByAuthorAsync(authorId);
            return books.Take(top).Select(MapToBookDto).ToList();
        }

        public async Task<List<BookDto>> GetByPublisherAsync(Guid publisherId, int top = 10)
        {
            var books = await _bookRepository.GetByPublisherAsync(publisherId);
            return books.Take(top).Select(MapToBookDto).ToList();
        }

        public async Task<List<BookDto>> SearchAsync(string searchTerm, int top = 20)
        {
            var books = await _bookRepository.SearchAsync(searchTerm);
            return books.Take(top).Select(MapToBookDto).ToList();
        }

        #region Private Helper Methods

        private BookDto MapToBookDto(Book book)
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
                BookFormatName = book.BookFormat?.FormatType,
                AuthorNames = book.BookAuthors?.Select(ba => ba.Author.Name).ToList() ?? new List<string>(),
                CategoryNames = book.BookCategories?.Select(bc => bc.Category.Name).ToList() ?? new List<string>(),
                CurrentPrice = book.Prices?.Where(p => p.IsCurrent &&
                                                       p.EffectiveFrom <= DateTime.UtcNow &&
                                                       (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                                         .OrderByDescending(p => p.EffectiveFrom)
                                         .FirstOrDefault()?.Amount,
                DiscountPrice = book.Prices?.Where(p => p.IsCurrent &&
                                                        p.EffectiveFrom <= DateTime.UtcNow &&
                                                        (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow) &&
                                                        p.DiscountId.HasValue)
                                           .OrderByDescending(p => p.EffectiveFrom)
                                           .FirstOrDefault()?.Amount,
                StockQuantity = book.StockItem?.Quantity,
                AverageRating = book.Reviews?.Any() == true ? book.Reviews.Average(r => r.Rating) : null,
                TotalReviews = book.Reviews?.Count ?? 0
            };
        }

        private BookDetailDto MapToBookDetailDto(Book book)
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
                Publisher = book.Publisher != null ? PublisherMapper.ToDto(book.Publisher) : null!,
                BookFormat = book.BookFormat != null ? new BookFormatDto
                {
                    Id = book.BookFormat.Id,
                    FormatType = book.BookFormat.FormatType,
                    Description = book.BookFormat.Description
                } : null,
                Authors = book.BookAuthors?.Select(ba => AuthorMapper.ToDto(ba.Author)).ToList() ?? new List<AuthorDto>(),
                Categories = book.BookCategories?.Select(bc => CategoryMapper.ToDto(bc.Category)).ToList() ?? new List<CategoryDto>(),
                Images = book.Images?.Select(img => new BookImageDto
                {
                    Id = img.Id,
                    BookId = img.BookId,
                    ImageUrl = img.ImageUrl,
                    IsCover = img.IsCover,
                    DisplayOrder = img.DisplayOrder
                }).ToList() ?? new List<BookImageDto>(),
                Files = book.Files?.Select(f => new BookFileDto
                {
                    Id = f.Id,
                    BookId = f.BookId,
                    FileUrl = f.FileUrl,
                    FileType = f.FileType,
                    FileSize = f.FileSize,
                    IsPreview = f.IsPreview
                }).ToList() ?? new List<BookFileDto>(),
                Metadata = book.Metadata?.Select(m => new BookMetadataDto
                {
                    Id = m.Id,
                    BookId = m.BookId,
                    Key = m.Key,
                    Value = m.Value
                }).ToList() ?? new List<BookMetadataDto>()
            };
        }

        #endregion
    }
}