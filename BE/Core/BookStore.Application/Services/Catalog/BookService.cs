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
using BookStore.Domain.IRepository.Inventory;
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
        private readonly IBookImageRepository _bookImageRepository;
        private readonly IBookMetadataRepository _bookMetadataRepository;
        private readonly IPriceRepository _priceRepository;
        private readonly IStockItemRepository _stockItemRepository;

        public BookService(
            IBookRepository bookRepository,
            IAuthorRepository authorRepository,
            ICategoryRepository categoryRepository,
            IPublisherRepository publisherRepository,
            IBookFormatRepository bookFormatRepository,
            IBookImageRepository bookImageRepository,
            IBookMetadataRepository bookMetadataRepository,
            IPriceRepository priceRepository,
            IStockItemRepository stockItemRepository)
            : base(bookRepository)
        {
            _bookRepository = bookRepository;
            _authorRepository = authorRepository;
            _categoryRepository = categoryRepository;
            _publisherRepository = publisherRepository;
            _bookFormatRepository = bookFormatRepository;
            _bookImageRepository = bookImageRepository;
            _bookMetadataRepository = bookMetadataRepository;
            _priceRepository = priceRepository;
            _stockItemRepository = stockItemRepository;
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
            
            // Cấu hình % giá thuê dựa trên giá bìa (CẬP NHẬT THEO YÊU CẦU MỚI)
            // 3 ngày: 10%, 7 ngày: 15%, 14 ngày: 25%, 30 ngày: 40%, 180 ngày: 60%
            var configs = new[]
            {
                new { Days = 3,   Percent = 0.10m, Label = "3 ngày", Popular = false }, 
                new { Days = 7,   Percent = 0.15m, Label = "7 ngày", Popular = false },
                new { Days = 14,  Percent = 0.25m, Label = "14 ngày", Popular = false },
                new { Days = 30,  Percent = 0.40m, Label = "30 ngày", Popular = false },
                new { Days = 180, Percent = 0.60m, Label = "180 ngày", Popular = true }
            };

            // Tính giá cơ sở gói 3 ngày để so sánh mức tiết kiệm
            decimal base3Price = Math.Ceiling((purchasePrice * 0.10m) / 1000) * 1000;
            if (base3Price < 2000) base3Price = 2000; // Giá tối thiểu tham chiếu
            decimal basePerDay = base3Price / 3;

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
            // Load book với đầy đủ navigation properties
            var book = await _bookRepository.GetDetailByIdAsync(id);
            if (book == null) return false;

            // Kiểm tra xem sách có đang được cho thuê không
            if (book.Rentals != null && book.Rentals.Any(r => r.Status == "Active" && !r.IsReturned))
            {
                throw new UserFriendlyException("Không thể xóa sách đang được cho thuê");
            }

            // Xóa các dữ liệu liên quan trước
            try
            {
                // Xóa ảnh
                await _bookImageRepository.DeleteByBookIdAsync(id);
                
                // Xóa metadata
                await _bookMetadataRepository.DeleteByBookIdAsync(id);
                
                // Xóa StockItems (inventory)
                if (book.StockItems != null && book.StockItems.Any())
                {
                    foreach (var stockItem in book.StockItems)
                    {
                        _stockItemRepository.Delete(stockItem);
                    }
                }
                
                // Xóa Prices
                if (book.Prices != null && book.Prices.Any())
                {
                    foreach (var price in book.Prices)
                    {
                        _priceRepository.Delete(price);
                    }
                }
                
                // Xóa Reviews (nếu có)
                if (book.Reviews != null && book.Reviews.Any())
                {
                    // Reviews sẽ được cascade delete hoặc cần xóa thủ công
                    // Tùy thuộc vào cấu hình database
                }
                
                // Xóa sách
                _bookRepository.Delete(book);
                await _bookRepository.SaveChangesAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException($"Lỗi khi xóa sách: {ex.Message}");
            }
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
                var books = await _repository.GetAllAsync();
                
                return books
                    .Where(b => b.IsAvailable)
                    .OrderByDescending(b => b.StockItems?.Sum(s => s.QuantityOnHand) ?? 0)
                    .Take(top)
                    .Select(b => b.ToDto())
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting best selling books: {ex.Message}");
                return new List<BookDto>();
            }
        }

        public async Task<List<BookDto>> GetNewestBooksAsync(int top = 10)
        {
            try
            {
                var books = await _repository.GetAllAsync();
                
                return books
                    .Where(b => b.IsAvailable)
                    .OrderByDescending(b => b.PublicationYear)
                    .ThenBy(b => b.Title)
                    .Take(top)
                    .Select(b => b.ToDto())
                    .ToList();
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
                // TODO: Implement proper view tracking
                // For now, return popular books based on stock
                var books = await _repository.GetAllAsync();
                
                return books
                    .Where(b => b.IsAvailable)
                    .OrderByDescending(b => b.StockItems?.Sum(s => s.QuantityOnHand) ?? 0)
                    .Take(top)
                    .Select(b => b.ToDto())
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting most viewed books: {ex.Message}");
                return new List<BookDto>();
            }
        }


        protected override BookDto MapToDto(Book entity) => entity.ToDto();

        protected override Book MapToEntity(CreateBookDto dto)
        {
            throw new NotImplementedException("Use AddAsync instead");
        }

        protected override Book MapToEntity(UpdateBookDto dto)
        {
            throw new NotImplementedException("Use UpdateAsync instead");
        }

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

        public async Task<bool> UpdatePriceAsync(Guid bookId, UpdateBookPriceDto dto)
        {
            // Kiểm tra book có tồn tại không
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
                throw new NotFoundException($"Không tìm thấy sách với ID {bookId}");

            // Tắt tất cả giá cũ đang active (query với AsTracking để EF Core track entities)
            var allPrices = await _priceRepository.GetAllAsync();
            var currentPrices = allPrices.Where(p => p.BookId == bookId && p.IsCurrent).ToList();
            
            // Chỉ cần set giá trị, không cần gọi Update() vì entities đã được track
            foreach (var price in currentPrices)
            {
                price.IsCurrent = false;
                price.EffectiveTo = DateTime.UtcNow;
                // KHÔNG gọi _priceRepository.Update(price) - EF sẽ tự động detect changes
            }

            // Tạo giá mới
            var newPrice = new BookStore.Domain.Entities.Pricing___Inventory.Price
            {
                Id = Guid.NewGuid(),
                BookId = bookId,
                Amount = dto.Price,
                Currency = "VND",
                IsCurrent = true,
                EffectiveFrom = DateTime.UtcNow,
                EffectiveTo = dto.EffectiveTo
            };

            await _priceRepository.AddAsync(newPrice);
            await _priceRepository.SaveChangesAsync();

            return true;
        }

    }
}