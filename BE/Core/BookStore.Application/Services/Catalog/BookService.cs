using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Author;
using BookStore.Application.Mappers.Catalog.BookImages;
using BookStore.Application.Mappers.Catalog.Category;
using BookStore.Application.Mappers.Catalog.Publisher;
using BookStore.Application.Service;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.ValueObjects;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

namespace BookStore.Application.Services.Catalog
{
    public class BookService : GenericService<Book, BookDto, CreateBookDto, UpdateBookDto>, IBookService
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
            : base(bookRepository)
        {
            _bookRepository = bookRepository;
            _authorRepository = authorRepository;
            _categoryRepository = categoryRepository;
            _publisherRepository = publisherRepository;
            _bookFormatRepository = bookFormatRepository;
        }

        public async Task<PagedResult<BookDto>> GetAllAsync(
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

            return new PagedResult<BookDto>(bookDtos, totalCount, pageNumber, pageSize);
        }

        // Override GetByIdAsync from IBookService (returns BookDetailDto)
        public new async Task<BookDetailDto?> GetByIdAsync(Guid id)
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

        // Override AddAsync from IBookService (returns BookDetailDto)
        public new async Task<BookDetailDto> AddAsync(CreateBookDto dto)
        {
            return await CreateAsync(dto);
        }

        public async Task<BookDetailDto> CreateAsync(CreateBookDto dto)
        {
            // Validate inputs
            Guard.AgainstNullOrWhiteSpace(dto.Title, nameof(dto.Title));
            Guard.AgainstNullOrWhiteSpace(dto.ISBN, nameof(dto.ISBN));
            Guard.Against(dto.AuthorIds == null || !dto.AuthorIds.Any(), "Phải có ít nhất một tác giả");
            Guard.Against(dto.CategoryIds == null || !dto.CategoryIds.Any(), "Phải có ít nhất một thể loại");

            // Validate ISBN exists
            if (await _bookRepository.IsISBNExistsAsync(dto.ISBN))
            {
                throw new UserFriendlyException($"Sách với ISBN '{dto.ISBN}' đã tồn tại");
            }

            // Validate Publisher exists
            var publisher = await _publisherRepository.GetByIdAsync(dto.PublisherId);
            if (publisher == null)
            {
                throw new NotFoundException($"Không tìm thấy nhà xuất bản với ID {dto.PublisherId}");
            }

            // Validate BookFormat if provided
            if (dto.BookFormatId.HasValue)
            {
                var bookFormat = await _bookFormatRepository.GetByIdAsync(dto.BookFormatId.Value);
                if (bookFormat == null)
                {
                    throw new NotFoundException($"Không tìm thấy định dạng sách với ID {dto.BookFormatId.Value}");
                }
            }

            // Validate Authors exist
            var authors = new List<Author>();
            foreach (var authorId in dto.AuthorIds!)
            {
                var author = await _authorRepository.GetByIdAsync(authorId);
                if (author == null)
                {
                    throw new NotFoundException($"Không tìm thấy tác giả với ID {authorId}");
                }
                authors.Add(author);
            }

            // Validate Categories exist
            var categories = new List<Category>();
            foreach (var categoryId in dto.CategoryIds!)
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                {
                    throw new NotFoundException($"Không tìm thấy thể loại với ID {categoryId}");
                }
                categories.Add(category);
            }

            // Create Book entity
            var book = new Book
            {
                Id = Guid.NewGuid(),
                Title = dto.Title.NormalizeSpace(),
                ISBN = new ISBN(dto.ISBN.Trim()),
                Description = dto.Description?.NormalizeSpace(),
                PublicationYear = dto.PublicationYear,
                Language = dto.Language?.Trim() ?? string.Empty,
                Edition = dto.Edition?.Trim(),
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

        // Override UpdateAsync from IBookService (returns BookDetailDto)
        public new async Task<BookDetailDto> UpdateAsync(UpdateBookDto dto)
        {
            var book = await _bookRepository.GetDetailByIdAsync(dto.Id);
            if (book == null)
            {
                throw new NotFoundException($"Không tìm thấy sách với ID {dto.Id}");
            }

            // Validate inputs
            Guard.AgainstNullOrWhiteSpace(dto.Title, nameof(dto.Title));
            Guard.AgainstNullOrWhiteSpace(dto.ISBN, nameof(dto.ISBN));
            Guard.Against(dto.AuthorIds == null || !dto.AuthorIds.Any(), "Phải có ít nhất một tác giả");
            Guard.Against(dto.CategoryIds == null || !dto.CategoryIds.Any(), "Phải có ít nhất một thể loại");

            // Validate ISBN exists (exclude current book)
            if (await _bookRepository.IsISBNExistsAsync(dto.ISBN, dto.Id))
            {
                throw new UserFriendlyException($"Sách với ISBN '{dto.ISBN}' đã tồn tại");
            }

            // Validate Publisher exists
            var publisher = await _publisherRepository.GetByIdAsync(dto.PublisherId);
            if (publisher == null)
            {
                throw new NotFoundException($"Không tìm thấy nhà xuất bản với ID {dto.PublisherId}");
            }

            // Validate BookFormat if provided
            if (dto.BookFormatId.HasValue)
            {
                var bookFormat = await _bookFormatRepository.GetByIdAsync(dto.BookFormatId.Value);
                if (bookFormat == null)
                {
                    throw new NotFoundException($"Không tìm thấy định dạng sách với ID {dto.BookFormatId.Value}");
                }
            }

            // Validate Authors exist
            var authors = new List<Author>();
            foreach (var authorId in dto.AuthorIds!)
            {
                var author = await _authorRepository.GetByIdAsync(authorId);
                if (author == null)
                {
                    throw new NotFoundException($"Không tìm thấy tác giả với ID {authorId}");
                }
                authors.Add(author);
            }

            // Validate Categories exist
            var categories = new List<Category>();
            foreach (var categoryId in dto.CategoryIds!)
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                {
                    throw new NotFoundException($"Không tìm thấy thể loại với ID {categoryId}");
                }
                categories.Add(category);
            }

            // Update basic properties
            book.Title = dto.Title.NormalizeSpace();
            book.ISBN = new ISBN(dto.ISBN.Trim());
            book.Description = dto.Description?.NormalizeSpace();
            book.PublicationYear = dto.PublicationYear;
            book.Language = dto.Language?.Trim() ?? string.Empty;
            book.Edition = dto.Edition?.Trim();
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

        // Override DeleteAsync from GenericService
        public override async Task<bool> DeleteAsync(Guid id)
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

        #region Abstract Methods Implementation from GenericService

        protected override BookDto MapToDto(Book entity)
        {
            return MapToBookDto(entity);
        }

        protected override Book MapToEntity(CreateBookDto dto)
        {
            // This is a simplified version - actual creation happens in CreateAsync
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
            };
        }

        protected override Book MapToEntity(UpdateBookDto dto)
        {
            // This is a simplified version - actual update happens in UpdateAsync
            return new Book
            {
                Id = dto.Id,
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
        }

        #endregion

        #region Private Helper Methods

        private BookDto MapToBookDto(Book book)
        {
            try
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
                    AuthorNames = book.BookAuthors?.Where(ba => ba?.Author != null)
                                                   .Select(ba => ba.Author.Name)
                                                   .ToList() ?? new List<string>(),
                    CategoryNames = book.BookCategories?.Where(bc => bc?.Category != null)
                                                        .Select(bc => bc.Category.Name)
                                                        .ToList() ?? new List<string>(),
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
                    StockQuantity = book.StockItem?.QuantityOnHand ?? 0,
                    // TODO: Calculate from Reviews when schema is fixed
                    AverageRating = null,
                    TotalReviews = 0
                };
            }
            catch (Exception ex)
            {
                // Log the error and return a safe default
                Console.WriteLine($"Error mapping book {book?.Id}: {ex.Message}");
                throw new Exception($"Error mapping book to DTO: {ex.Message}", ex);
            }
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
                Images = book.Images?.Select(img => img.ToDto()).ToList() ?? new List<BookImageDto>(),
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

        #region Smart Recommendations

        public async Task<List<BookDto>> GetRecommendationsAsync(List<Guid> excludeBookIds, List<Guid> categoryIds, int limit = 8)
        {
            try
            {
                var allBooks = await _bookRepository.GetAllAsync();
                var availableBooks = allBooks.Where(b => b.IsAvailable).ToList();

                // Remove excluded books (already in cart)
                if (excludeBookIds.Any())
                {
                    availableBooks = availableBooks.Where(b => !excludeBookIds.Contains(b.Id)).ToList();
                }

                var recommendations = new List<Book>();

                // Strategy 1: Content-based filtering - Books in same categories (70% weight)
                if (categoryIds.Any())
                {
                    var sameCategoryBooks = availableBooks
                        .Where(b => b.BookCategories.Any(bc => categoryIds.Contains(bc.CategoryId)))
                        .OrderByDescending(b => b.BookCategories.Count(bc => categoryIds.Contains(bc.CategoryId))) // More matching categories = higher priority
                        .ThenByDescending(b => b.Prices
                            .Where(p => p.IsCurrent && p.EffectiveFrom <= DateTime.UtcNow && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                            .OrderByDescending(p => p.EffectiveFrom)
                            .FirstOrDefault()?.Amount ?? 0) // Higher price = potentially premium quality
                        .Take((int)(limit * 0.7))
                        .ToList();

                    recommendations.AddRange(sameCategoryBooks);
                }

                // Strategy 2: Popular books fallback (30% weight) - Best sellers not in same category
                var remainingSlots = limit - recommendations.Count;
                if (remainingSlots > 0)
                {
                    var popularBooks = availableBooks
                        .Where(b => !recommendations.Contains(b))
                        .OrderByDescending(b => b.StockItem?.QuantityOnHand ?? 0) 
                        .ThenByDescending(b => b.PublicationYear)
                        .Take(remainingSlots)
                        .ToList();

                    recommendations.AddRange(popularBooks);
                }

                // Strategy 3: If still not enough, fill with random available books
                remainingSlots = limit - recommendations.Count;
                if (remainingSlots > 0)
                {
                    var random = new Random();
                    var fillerBooks = availableBooks
                        .Where(b => !recommendations.Contains(b))
                        .OrderBy(b => random.Next())
                        .Take(remainingSlots)
                        .ToList();

                    recommendations.AddRange(fillerBooks);
                }

                // Map to DTOs
                return recommendations.Select(MapToBookDto).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recommendations: {ex.Message}");
                // Return empty list on error rather than throwing
                return new List<BookDto>();
            }
        }

        #endregion
    }
}