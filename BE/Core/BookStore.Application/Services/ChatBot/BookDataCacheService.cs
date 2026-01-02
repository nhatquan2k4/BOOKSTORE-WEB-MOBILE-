using BookStore.Application.DTOs.ChatBot;
using BookStore.Application.IService.ChatBot;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BookStore.Application.Services.ChatBot
{
    public class BookDataCacheService : IBookDataCacheService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookDataCacheService> _logger;

        private List<CachedBookDto> _cachedBooks = new();
        private List<CachedCategoryDto> _cachedCategories = new();
        private bool _isCacheLoaded = false;
        private readonly object _lockObject = new object();

        public BookDataCacheService(
            IServiceProvider serviceProvider,
            ILogger<BookDataCacheService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task LoadCacheAsync()
        {
            try
            {
                _logger.LogInformation("[BookDataCache] Starting to load all books and categories into cache...");
                var startTime = DateTime.UtcNow;

                // Create a scope to resolve scoped services (repositories)
                using var scope = _serviceProvider.CreateScope();
                var bookRepo = scope.ServiceProvider.GetRequiredService<IBookRepository>();
                var categoryRepo = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();

                // Load tất cả sách - Repository sẽ tự include navigation properties cần thiết
                var books = await bookRepo.GetAllAsync();
                
                // Với mỗi sách, lấy chi tiết để đảm bảo có đầy đủ navigation properties
                var detailedBooks = new List<Book>();
                foreach (var book in books)
                {
                    var detailedBook = await bookRepo.GetDetailByIdAsync(book.Id);
                    if (detailedBook != null)
                    {
                        detailedBooks.Add(detailedBook);
                    }
                }

                // Load tất cả thể loại
                var categories = await categoryRepo.GetAllAsync();

                // Convert to cached DTOs
                var cachedBooks = detailedBooks.Select(book =>
                {
                    var currentPrice = book.Prices?.FirstOrDefault(p => p.IsCurrent);
                    var authors = book.BookAuthors?.Select(ba => ba.Author?.Name ?? "N/A").ToList() ?? new List<string>();
                    var categoryNames = book.BookCategories?.Select(bc => bc.Category?.Name ?? "N/A").ToList() ?? new List<string>();
                    var primaryImage = book.Images?.FirstOrDefault(img => img.IsCover) ?? book.Images?.FirstOrDefault();

                    var dto = new CachedBookDto
                    {
                        Id = book.Id,
                        Title = book.Title ?? string.Empty,
                        Description = book.Description,
                        Price = currentPrice?.Amount,
                        Currency = currentPrice?.Currency,
                        Authors = authors,
                        Categories = categoryNames,
                        Publisher = book.Publisher?.Name,
                        PublicationYear = book.PublicationYear,
                        Isbn = book.ISBN?.Value,
                        PageCount = book.PageCount,
                        Language = book.Language,
                        StockQuantity = book.StockItems?.Sum(s => s.QuantityOnHand) ?? 0,
                        ImageUrl = primaryImage?.ImageUrl
                    };

                    // Tạo search text để optimize việc tìm kiếm
                    dto.SearchText = $"{dto.Title} {string.Join(" ", dto.Authors)} {dto.Description} {string.Join(" ", dto.Categories)} {dto.Publisher}"
                        .ToLowerInvariant();

                    return dto;
                }).ToList();

                var cachedCategories = categories.Select(cat => new CachedCategoryDto
                {
                    Id = cat.Id,
                    Name = cat.Name ?? string.Empty,
                    Description = cat.Description,
                    BookCount = cat.BookCategories?.Count ?? 0
                }).ToList();

                // Thread-safe update
                lock (_lockObject)
                {
                    _cachedBooks = cachedBooks;
                    _cachedCategories = cachedCategories;
                    _isCacheLoaded = true;
                }

                var duration = DateTime.UtcNow - startTime;
                _logger.LogInformation(
                    "[BookDataCache] Successfully loaded {BookCount} books and {CategoryCount} categories in {Duration}ms",
                    _cachedBooks.Count,
                    _cachedCategories.Count,
                    duration.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[BookDataCache] Failed to load cache");
                throw;
            }
        }

        public List<CachedBookDto> GetAllBooks()
        {
            lock (_lockObject)
            {
                return _cachedBooks.ToList(); // Return copy to prevent external modification
            }
        }

        public List<CachedCategoryDto> GetAllCategories()
        {
            lock (_lockObject)
            {
                return _cachedCategories.ToList();
            }
        }

        public List<CachedBookDto> SearchBooks(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return GetAllBooks();

            var cleanKeyword = CleanKeyword(keyword);
            var searchTerms = cleanKeyword.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            lock (_lockObject)
            {
                return _cachedBooks.Where(book =>
                {
                    // Check if search text contains all search terms
                    return searchTerms.All(term => book.SearchText.Contains(term));
                }).ToList();
            }
        }

        public bool IsCacheLoaded()
        {
            lock (_lockObject)
            {
                return _isCacheLoaded;
            }
        }

        public async Task RefreshCacheAsync()
        {
            _logger.LogInformation("[BookDataCache] Refreshing cache...");
            await LoadCacheAsync();
        }

        private string CleanKeyword(string keyword)
        {
            // Remove Vietnamese stop words
            string[] stopWords = {
                "tôi", "muốn", "tìm", "mua", "sách", "cuốn", "quyển", "về",
                "bạn", "có", "không", "cho", "hỏi", "là", "gì", "ở", "đâu", "bán",
                "và", "hay", "hoặc", "của", "với", "trong", "ngoài"
            };

            var cleaned = keyword.ToLowerInvariant();
            foreach (var word in stopWords)
            {
                cleaned = Regex.Replace(cleaned, $@"\b{word}\b", "", RegexOptions.IgnoreCase);
            }

            return cleaned.Trim();
        }
    }
}
