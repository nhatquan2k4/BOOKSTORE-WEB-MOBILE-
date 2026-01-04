using BookStore.Application.DTOs.ChatBot;
using BookStore.Application.IService.ChatBot;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BookStore.Application.Services.ChatBot
{
    public class ChatBotService : IChatBotService
    {
        private readonly IBookDataCacheService _cacheService;
        private readonly IGeminiService _geminiService;
        private readonly ILogger<ChatBotService> _logger;

        public ChatBotService(
            IBookDataCacheService cacheService,
            IGeminiService geminiService,
            ILogger<ChatBotService> logger)
        {
            _cacheService = cacheService;
            _geminiService = geminiService;
            _logger = logger;
        }

        public async Task<string> AskAsync(Guid userId, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return "Bạn cần hỏi gì về sách?";

            // Kiểm tra cache đã được load chưa
            if (!_cacheService.IsCacheLoaded())
            {
                _logger.LogWarning("[ChatBot] Cache is not loaded yet. Waiting for cache initialization...");
                return "Hệ thống đang khởi động, vui lòng thử lại sau vài giây.";
            }

            // BƯỚC 1: Xử lý từ khóa
            string searchKeyword = CleanMessageToKeyword(message);

            // BƯỚC 2: Tìm kiếm trong cache thay vì DB
            var books = _cacheService.SearchBooks(searchKeyword);

            // Log fetched books summary
            try
            {
                _logger.LogInformation("[ChatBot] Search for '{Keyword}' returned {Count} results from cache", searchKeyword, books.Count);
                for (int i = 0; i < Math.Min(5, books.Count); i++)
                {
                    var b = books[i];
                    string priceDisplay = b.Price.HasValue
                        ? $"{b.Price.Value:#,##0} {b.Currency}"
                        : "Liên hệ";
                    string authors = b.Authors.Any() ? string.Join(", ", b.Authors) : "N/A";
                    var shortDesc = string.IsNullOrEmpty(b.Description) ? "" : 
                        (b.Description.Length > 120 ? b.Description.Substring(0, 120) + "..." : b.Description);
                    _logger.LogInformation("[ChatBot] Book {Index}: {Title} | {Price} | {Authors} | DescPreview={Desc}", 
                        i + 1, b.Title, priceDisplay, authors, shortDesc);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[ChatBot] Failed to log fetched books summary");
            }

            // BƯỚC 3: Chiến thuật Fallback
            bool isFallback = false;
            if (!books.Any())
            {
                isFallback = true;
                // Lấy 10 cuốn mới nhất từ cache (sắp xếp theo title hoặc có thể thêm CreatedDate vào DTO)
                var allBooks = _cacheService.GetAllBooks();
                books = allBooks.OrderByDescending(b => b.Title).Take(10).ToList();
                
                try
                {
                    _logger.LogInformation("[ChatBot] Fallback: using latest {Count} books", books.Count);
                    for (int i = 0; i < Math.Min(5, books.Count); i++)
                    {
                        var b = books[i];
                        string priceDisplay = b.Price.HasValue
                            ? $"{b.Price.Value:#,##0} {b.Currency}"
                            : "Liên hệ";
                        string authors = b.Authors.Any() ? string.Join(", ", b.Authors) : "N/A";
                        var shortDesc = string.IsNullOrEmpty(b.Description) ? "" : 
                            (b.Description.Length > 120 ? b.Description.Substring(0, 120) + "..." : b.Description);
                        _logger.LogInformation("[ChatBot][Fallback] Book {Index}: {Title} | {Price} | {Authors} | DescPreview={Desc}", 
                            i + 1, b.Title, priceDisplay, authors, shortDesc);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[ChatBot] Failed to log fallback books summary");
                }
            }

            // BƯỚC 4: Tạo Prompt và gửi cho Gemini
            // Lấy tối đa 10 cuốn (tăng từ 5) vì giờ có cache nhanh hơn
            var finalBookList = books.Take(10).ToList();
            var categories = _cacheService.GetAllCategories();
            var prompt = BuildPrompt(finalBookList, categories, message, isFallback);

            return await _geminiService.AskAsync(prompt);
        }

        private string CleanMessageToKeyword(string message)
        {
            // Chuyển về chữ thường
            var keyword = message.ToLower();

            // Danh sách các từ thừa (Stop words) cần loại bỏ
            string[] stopWords = {
                "tôi", "muốn", "tìm", "mua", "sách", "cuốn", "quyển", "về", "bạn", "có", "không", "cho", "hỏi", "là", "gì", "ở", "đâu", "bán"
            };

            foreach (var word in stopWords)
            {
                // Thay thế các từ thừa bằng rỗng (dùng Regex để thay thế chính xác từ đơn)
                keyword = Regex.Replace(keyword, $@"\b{word}\b", "", RegexOptions.IgnoreCase);
            }

            // Xóa khoảng trắng thừa
            return keyword.Trim();
        }

        private static string BuildPrompt(List<CachedBookDto> books, List<CachedCategoryDto> categories, string userQuestion, bool isFallback)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Bạn là trợ lý ảo AI của nhà sách BookStore.");
            sb.AppendLine("Nhiệm vụ: Trả lời câu hỏi khách hàng một cách tự nhiên, thân thiện.");

            sb.AppendLine("\nQUY TẮC:");
            sb.AppendLine("1. Dựa vào [DỮ LIỆU SÁCH] và [THỂ LOẠI] bên dưới để trả lời.");
            sb.AppendLine("2. Nếu có sách phù hợp, hãy giới thiệu tên, giá, tác giả và mô tả ngắn.");
            sb.AppendLine("3. Nếu khách hỏi về thể loại, hãy gợi ý các sách thuộc thể loại đó.");

            if (isFallback)
            {
                sb.AppendLine("4. QUAN TRỌNG: Hiện tại hệ thống KHÔNG tìm thấy đúng sách khách yêu cầu trong danh sách.");
                sb.AppendLine("5. Hãy xin lỗi khéo léo và gợi ý khách tham khảo các sách bên dưới.");
                sb.AppendLine("6. Tuyệt đối KHÔNG bịa ra thông tin sách không có trong list.");
            }

            // Thêm thông tin thể loại
            sb.AppendLine("\n[THỂ LOẠI CÓ SẴN]:");
            if (categories.Any())
            {
                foreach (var cat in categories.Take(20)) // Lấy top 20 thể loại
                {
                    sb.AppendLine($"- {cat.Name} ({cat.BookCount} sách)");
                }
            }

            sb.AppendLine("\n[DỮ LIỆU SÁCH]:");
            if (books.Count == 0)
            {
                sb.AppendLine("(Không có dữ liệu)");
            }
            else
            {
                int i = 1;
                foreach (var b in books)
                {
                    string priceDisplay = b.Price.HasValue
                        ? $"{b.Price.Value:#,##0} {b.Currency}"
                        : "Liên hệ";

                    string authors = b.Authors.Any() ? string.Join(", ", b.Authors) : "N/A";
                    string categoriesText = b.Categories.Any() ? string.Join(", ", b.Categories) : "N/A";

                    sb.AppendLine($"{i}. {b.Title}");
                    sb.AppendLine($"   - Giá: {priceDisplay}");
                    sb.AppendLine($"   - Tác giả: {authors}");
                    sb.AppendLine($"   - Thể loại: {categoriesText}");
                    
                    if (!string.IsNullOrEmpty(b.Publisher))
                        sb.AppendLine($"   - Nhà xuất bản: {b.Publisher}");
                    
                    if (b.PublicationYear.HasValue)
                        sb.AppendLine($"   - Năm xuất bản: {b.PublicationYear}");
                    
                    if (b.StockQuantity > 0)
                        sb.AppendLine($"   - Còn hàng: {b.StockQuantity} cuốn");
                    else
                        sb.AppendLine($"   - Tình trạng: Hết hàng");

                    if (!string.IsNullOrEmpty(b.Description))
                    {
                        string shortDesc = b.Description.Length > 150
                            ? b.Description.Substring(0, 150) + "..."
                            : b.Description;
                        sb.AppendLine($"   - Mô tả: {shortDesc}");
                    }
                    sb.AppendLine();
                    i++;
                }
            }

            sb.AppendLine($"\nCÂU HỎI CỦA KHÁCH: \"{userQuestion}\"");
            sb.AppendLine("TRẢ LỜI:");

            return sb.ToString();
        }
    }
}