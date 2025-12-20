using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Author;
using BookStore.Application.Mappers.Catalog.Book;
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
    public class BookService
        : GenericService<Book, BookDto, CreateBookDto, UpdateBookDto>, IBookService
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

        public override async Task<IEnumerable<BookDto>> GetAllAsync()
        {
            var allBooks = await _bookRepository.GetAllAsync();
            return allBooks.Select(b => b.ToDto()).ToList();
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
            var allBooks = await _bookRepository.GetAllAsync();
            var query = allBooks.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(b =>
                    (b.Title ?? string.Empty).Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    (b.ISBN != null && b.ISBN.Value.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b =>
                    b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
            }

            if (authorId.HasValue)
            {
                query = query.Where(b =>
                    b.BookAuthors.Any(ba => ba.AuthorId == authorId.Value));
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

            var books = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var bookDtos = books.Select(b => b.ToDto()).ToList();

            return new PagedResult<BookDto>(bookDtos, totalCount, pageNumber, pageSize);
        }

        // --- UPDATE: Get detail and calculate rental plans ---
        public new async Task<BookDetailDto?> GetByIdAsync(Guid id)
        {
            var book = await _bookRepository.GetDetailByIdAsync(id);
            if (book == null) return null;

            var dto = book.ToDetailDto();

            // Calculate rental plans if price exists
            // Logic: Get current valid price
            var currentPrice = book.Prices
                                .Where(p => p.IsCurrent && p.EffectiveFrom <= DateTime.UtcNow)
                                .OrderByDescending(p => p.EffectiveFrom)
                                .FirstOrDefault()?.Amount ?? 0;

            if (currentPrice > 0)
            {
                if (dto.CurrentPrice == null || dto.CurrentPrice == 0) dto.CurrentPrice = currentPrice;
                dto.RentalPlans = CalculateRentalPlans(currentPrice);
            }

            return dto;
        }

        // Helper: Calculate Rental Plans (New Logic: Percent based + Min Floor + Consistency Check)
        private List<RentalPlanDto> CalculateRentalPlans(decimal purchasePrice)
        {
            var plans = new List<RentalPlanDto>();
            
            // Cấu hình % giá thuê dựa trên giá bìa
            // 3 ngày: 2.5% (Thấp hơn gói 7 ngày là 5%)
            var configs = new[]
            {
                new { Days = 3,   Percent = 0.025m, Label = "3 ngày", Popular = false }, 
                new { Days = 7,   Percent = 0.05m,  Label = "7 ngày", Popular = false },
                new { Days = 15,  Percent = 0.08m,  Label = "15 ngày", Popular = false },
                new { Days = 30,  Percent = 0.12m,  Label = "30 ngày", Popular = false },
                new { Days = 60,  Percent = 0.20m,  Label = "60 ngày", Popular = false },
                new { Days = 90,  Percent = 0.25m,  Label = "90 ngày", Popular = false },
                new { Days = 180, Percent = 0.35m,  Label = "180 ngày", Popular = true },
                new { Days = 365, Percent = 0.50m,  Label = "1 năm (365 ngày)", Popular = false }
            };

            // Tính giá cơ sở gói 7 ngày để so sánh mức tiết kiệm
            decimal base7Price = Math.Ceiling((purchasePrice * 0.05m) / 1000) * 1000;
            if (base7Price < 2000) base7Price = 2000; // Giá tối thiểu tham chiếu
            decimal basePerDay = base7Price / 7;

            int index = 1;
            foreach (var cfg in configs)
            {
                // 1. Tính giá theo %
                decimal rawPrice = purchasePrice * cfg.Percent;

                // 2. Làm tròn lên hàng nghìn (VD: 1250 -> 2000)
                decimal price = Math.Ceiling(rawPrice / 1000) * 1000;

                // 3. Áp dụng giá sàn (Min Price) để tránh giá thuê quá thấp (VD: 0đ hoặc 500đ)
                // Gói 3 ngày tối thiểu 2k, các gói khác tối thiểu 3k
                decimal minPrice = cfg.Days <= 3 ? 2000 : 3000;
                if (price < minPrice) price = minPrice;

                // 4. Logic đảm bảo tính hợp lý: 
                // Giá gói thấp ngày KHÔNG ĐƯỢC cao hơn hoặc bằng giá gói cao ngày liền kề
                // (Logic này tự động đúng do % tăng dần, nhưng check thêm cho chắc chắn với trường hợp làm tròn)
                if (plans.Any())
                {
                    var prevPlan = plans.Last();
                    // Nếu giá gói hiện tại (nhiều ngày hơn) <= giá gói trước (ít ngày hơn)
                    // Thì tăng giá gói hiện tại lên 1 chút (thêm 1000đ so với gói trước)
                    if (price <= prevPlan.Price)
                    {
                        price = prevPlan.Price + 1000;
                    }
                }

                // 5. Tính % tiết kiệm (So với việc thuê gói 7 ngày lặp lại)
                int savings = 0;
                if (cfg.Days > 7 && basePerDay > 0)
                {
                    decimal theoreticalPrice = basePerDay * cfg.Days;
                    if (theoreticalPrice > price)
                    {
                        savings = (int)Math.Round((1 - price / theoreticalPrice) * 100);
                        if (savings < 0) savings = 0;
                    }
                }

                plans.Add(new RentalPlanDto
                {
                    Id = index++,
                    Days = cfg.Days,
                    DurationLabel = cfg.Label,
                    Price = price,
                    SavingsPercentage = savings,
                    IsPopular = cfg.Popular
                });
            }

            return plans;
        }

        public async Task<BookDetailDto?> GetByISBNAsync(string isbn)
        {
            var book = await _bookRepository.GetByISBNAsync(isbn);
            return book?.ToDetailDto();
        }

        public async Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeBookId = null)
        {
            return await _bookRepository.IsISBNExistsAsync(isbn, excludeBookId);
        }

        public async Task<List<BookDto>> GetByCategoryAsync(Guid categoryId, int top = 10)
        {
            var books = await _bookRepository.GetByCategoryAsync(categoryId);
            return books.Take(top).Select(b => b.ToDto()).ToList();
        }

        public async Task<List<BookDto>> GetByAuthorAsync(Guid authorId, int top = 10)
        {
            var books = await _bookRepository.GetByAuthorAsync(authorId);
            return books.Take(top).Select(b => b.ToDto()).ToList();
        }

        public async Task<List<BookDto>> GetByPublisherAsync(Guid publisherId, int top = 10)
        {
            var books = await _bookRepository.GetByPublisherAsync(publisherId);
            return books.Take(top).Select(b => b.ToDto()).ToList();
        }

        public async Task<List<BookDto>> SearchAsync(string searchTerm, int top = 20)
        {
            var books = await _bookRepository.SearchAsync(searchTerm);
            return books.Take(top).Select(b => b.ToDto()).ToList();
        }

        public new async Task<BookDetailDto> AddAsync(CreateBookDto dto)
        {
            Guard.AgainstNullOrWhiteSpace(dto.Title, nameof(dto.Title));
            Guard.AgainstNullOrWhiteSpace(dto.ISBN, nameof(dto.ISBN));
            Guard.Against(dto.AuthorIds == null || !dto.AuthorIds.Any(), "Phải có ít nhất một tác giả");
            Guard.Against(dto.CategoryIds == null || !dto.CategoryIds.Any(), "Phải có ít nhất một thể loại");

            if (await _bookRepository.IsISBNExistsAsync(dto.ISBN))
                throw new UserFriendlyException($"Sách với ISBN '{dto.ISBN}' đã tồn tại");

            var validationTasks = new List<Task>
            {
                ValidatePublisherExists(dto.PublisherId)
            };

            if (dto.BookFormatId.HasValue)
                validationTasks.Add(ValidateBookFormatExists(dto.BookFormatId.Value));

            await Task.WhenAll(validationTasks);

            var authors = new List<Author>();
            foreach (var authorId in dto.AuthorIds!)
            {
                var author = await _authorRepository.GetByIdAsync(authorId);
                if (author == null)
                    throw new NotFoundException($"Không tìm thấy tác giả với ID {authorId}");
                authors.Add(author);
            }

            var categories = new List<Category>();
            foreach (var categoryId in dto.CategoryIds!)
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                    throw new NotFoundException($"Không tìm thấy thể loại với ID {categoryId}");
                categories.Add(category);
            }

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

            var createdBook = await _bookRepository.GetDetailByIdAsync(book.Id);
            return createdBook!.ToDetailDto();
        }

        public new async Task<BookDetailDto> UpdateAsync(UpdateBookDto dto)
        {
            var book = await _bookRepository.GetDetailByIdAsync(dto.Id);
            if (book == null)
                throw new NotFoundException($"Không tìm thấy sách với ID {dto.Id}");

            Guard.AgainstNullOrWhiteSpace(dto.Title, nameof(dto.Title));
            Guard.AgainstNullOrWhiteSpace(dto.ISBN, nameof(dto.ISBN));
            Guard.Against(dto.AuthorIds == null || !dto.AuthorIds.Any(), "Phải có ít nhất một tác giả");
            Guard.Against(dto.CategoryIds == null || !dto.CategoryIds.Any(), "Phải có ít nhất một thể loại");

            if (await _bookRepository.IsISBNExistsAsync(dto.ISBN, dto.Id))
                throw new UserFriendlyException($"Sách với ISBN '{dto.ISBN}' đã tồn tại");

            await ValidatePublisherExists(dto.PublisherId);

            if (dto.BookFormatId.HasValue)
                await ValidateBookFormatExists(dto.BookFormatId.Value);

            var authors = new List<Author>();
            foreach (var authorId in dto.AuthorIds!)
            {
                var author = await _authorRepository.GetByIdAsync(authorId);
                if (author == null)
                    throw new NotFoundException($"Không tìm thấy tác giả với ID {authorId}");
                authors.Add(author);
            }

            var categories = new List<Category>();
            foreach (var categoryId in dto.CategoryIds!)
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                    throw new NotFoundException($"Không tìm thấy thể loại với ID {categoryId}");
                categories.Add(category);
            }

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

            var updatedBook = await _bookRepository.GetDetailByIdAsync(book.Id);
            return updatedBook!.ToDetailDto();
        }

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

        public override async Task SaveChangesAsync()
        {
            await _bookRepository.SaveChangesAsync();
        }

        public override async Task<bool> ExistsAsync(Guid id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            return book != null;
        }

        public async Task<List<BookDto>> GetRecommendationsAsync(
            List<Guid> excludeBookIds,
            List<Guid> categoryIds,
            int limit = 8)
        {
            try
            {
                var allBooks = await _bookRepository.GetAllAsync();
                var availableBooks = allBooks.Where(b => b.IsAvailable).ToList();

                if (excludeBookIds.Any())
                    availableBooks = availableBooks.Where(b => !excludeBookIds.Contains(b.Id)).ToList();

                var recommendations = new List<Book>();

                if (categoryIds.Any())
                {
                    var sameCategoryBooks = availableBooks
                        .Where(b => b.BookCategories.Any(bc => categoryIds.Contains(bc.CategoryId)))
                        .OrderByDescending(b => b.BookCategories.Count(bc => categoryIds.Contains(bc.CategoryId)))
                        .ThenByDescending(b =>
                            b.Prices
                                .Where(p => p.IsCurrent
                                            && p.EffectiveFrom <= DateTime.UtcNow
                                            && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                                .OrderByDescending(p => p.EffectiveFrom)
                                .FirstOrDefault()?.Amount ?? 0)
                        .Take((int)(limit * 0.7))
                        .ToList();

                    recommendations.AddRange(sameCategoryBooks);
                }

                var remainingSlots = limit - recommendations.Count;
                if (remainingSlots > 0)
                {
                    var popularBooks = availableBooks
                        .Where(b => !recommendations.Contains(b))
                        .OrderByDescending(b => b.StockItems?.Sum(s => s.QuantityOnHand) ?? 0)
                        .ThenByDescending(b => b.PublicationYear)
                        .Take(remainingSlots)
                        .ToList();

                    recommendations.AddRange(popularBooks);
                }

                remainingSlots = limit - recommendations.Count;
                if (remainingSlots > 0)
                {
                    var random = new Random();
                    var fillerBooks = availableBooks
                        .Where(b => !recommendations.Contains(b))
                        .OrderBy(_ => random.Next())
                        .Take(remainingSlots)
                        .ToList();

                    recommendations.AddRange(fillerBooks);
                }

                return recommendations.Select(b => b.ToDto()).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recommendations: {ex.Message}");
                return new List<BookDto>();
            }
        }

        public async Task<List<BookDto>> GetBestSellingBooksAsync(int top = 10)
        {
            try
            {
                var allBooks = await _bookRepository.GetAllAsync();
                
                var bestSelling = allBooks
                    .Where(b => b.IsAvailable)
                    .OrderByDescending(b => b.TotalReviews)
                    .ThenByDescending(b => b.AverageRating)
                    .ThenBy(b => b.Id)
                    .Take(top)
                    .ToList();

                return bestSelling.Select(b => b.ToDto()).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting best-selling books: {ex.Message}");
                return new List<BookDto>();
            }
        }

        public async Task<List<BookDto>> GetNewestBooksAsync(int top = 10)
        {
            try
            {
                var allBooks = await _bookRepository.GetAllAsync();
                
                var newest = allBooks
                    .Where(b => b.IsAvailable)
                    .OrderByDescending(b => b.PublicationYear)
                    .ThenByDescending(b => b.Id)
                    .Take(top)
                    .ToList();

                return newest.Select(b => b.ToDto()).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting newest books: {ex.Message}");
                return new List<BookDto>();
            }
        }

        public async Task<List<BookDto>> GetMostViewedBooksAsync(int top = 10)
        {
            try
            {
                var allBooks = await _bookRepository.GetAllAsync();
                
                var mostViewed = allBooks
                    .Where(b => b.IsAvailable)
                    .OrderByDescending(b => b.TotalReviews)
                    .ThenByDescending(b => b.AverageRating)
                    .ThenBy(b => b.Id)
                    .Take(top)
                    .ToList();

                return mostViewed.Select(b => b.ToDto()).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting most-viewed books: {ex.Message}");
                return new List<BookDto>();
            }
        }

        #region Base GenericService overrides

        protected override BookDto MapToDto(Book entity) => entity.ToDto();

        protected override Book MapToEntity(CreateBookDto dto)
        {
            throw new NotImplementedException("Use AddAsync instead");
        }

        protected override Book MapToEntity(UpdateBookDto dto)
        {
            throw new NotImplementedException("Use UpdateAsync instead");
        }

        #endregion

        private async Task ValidatePublisherExists(Guid publisherId)
        {
            var publisher = await _publisherRepository.GetByIdAsync(publisherId);
            if (publisher == null)
                throw new NotFoundException($"Không tìm thấy nhà xuất bản với ID {publisherId}");
        }

        private async Task ValidateBookFormatExists(Guid bookFormatId)
        {
            var bookFormat = await _bookFormatRepository.GetByIdAsync(bookFormatId);
            if (bookFormat == null)
                throw new NotFoundException($"Không tìm thấy định dạng sách với ID {bookFormatId}");
        }
    }
}