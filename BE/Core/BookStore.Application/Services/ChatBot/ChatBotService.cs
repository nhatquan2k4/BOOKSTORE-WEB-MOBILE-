using BookStore.Application.IService.ChatBot;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace BookStore.Application.Services.ChatBot
{
    public class ChatBotService : IChatBotService
    {
        private readonly IBookRepository _bookRepo;
        private readonly IGeminiService _geminiService;
        private readonly ILogger<ChatBotService> _logger;

        public ChatBotService(
            IBookRepository bookRepo,
            IGeminiService geminiService,
            ILogger<ChatBotService> logger)
        {
            _bookRepo = bookRepo;
            _geminiService = geminiService;
            _logger = logger;
        }

        public async Task<string> AskAsync(Guid userId, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return "Bạn cần hỏi gì về sách?";

            // BƯỚC 1: Xử lý từ khóa (QUAN TRỌNG)
            // Vì không được sửa Repo, ta phải sửa input đầu vào cho sạch.
            // Cách đơn giản nhất: Xóa các từ nối thông dụng tiếng Việt.
            string searchKeyword = CleanMessageToKeyword(message);

            // BƯỚC 2: Gọi Repo với từ khóa đã làm sạch
            var books = (await _bookRepo.SearchAsync(searchKeyword)).ToList();

            // Log fetched books summary (title, price, authors, short desc) — avoid logging full description
            try
            {
                _logger.LogInformation("[ChatBot] Search for '{Keyword}' returned {Count} results", searchKeyword, books.Count);
                for (int i = 0; i < Math.Min(5, books.Count); i++)
                {
                    var b = books[i];
                    var currentPriceObj = b.Prices?.FirstOrDefault(p => p.IsCurrent);
                    string priceDisplay = currentPriceObj != null
                        ? $"{currentPriceObj.Amount:#,##0} {currentPriceObj.Currency}"
                        : "Liên hệ";
                    string authors = b.BookAuthors != null && b.BookAuthors.Any()
                        ? string.Join(", ", b.BookAuthors.Select(x => x.Author.Name))
                        : "N/A";
                    var shortDesc = string.IsNullOrEmpty(b.Description) ? "" : (b.Description.Length > 120 ? b.Description.Substring(0, 120) + "..." : b.Description);
                    _logger.LogInformation("[ChatBot] Book {Index}: {Title} | {Price} | {Authors} | DescPreview={Desc}", i + 1, b.Title, priceDisplay, authors, shortDesc);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[ChatBot] Failed to log fetched books summary");
            }

            // BƯỚC 3: Chiến thuật Fallback (Dự phòng)
            // Nếu search không ra gì, lấy 5 cuốn mới nhất để Bot có cái mà giới thiệu
            bool isFallback = false;
            if (!books.Any())
            {
                isFallback = true;
                // Hàm này ĐÃ CÓ trong Repo của bạn, không cần sửa Repo
                var latestBooks = await _bookRepo.GetLatestBooksAsync(5);
                books = latestBooks.ToList();
                try
                {
                    _logger.LogInformation("[ChatBot] Fallback: using latest {Count} books", books.Count);
                    for (int i = 0; i < Math.Min(5, books.Count); i++)
                    {
                        var b = books[i];
                        var currentPriceObj = b.Prices?.FirstOrDefault(p => p.IsCurrent);
                        string priceDisplay = currentPriceObj != null
                            ? $"{currentPriceObj.Amount:#,##0} {currentPriceObj.Currency}"
                            : "Liên hệ";
                        string authors = b.BookAuthors != null && b.BookAuthors.Any()
                            ? string.Join(", ", b.BookAuthors.Select(x => x.Author.Name))
                            : "N/A";
                        var shortDesc = string.IsNullOrEmpty(b.Description) ? "" : (b.Description.Length > 120 ? b.Description.Substring(0, 120) + "..." : b.Description);
                        _logger.LogInformation("[ChatBot][Fallback] Book {Index}: {Title} | {Price} | {Authors} | DescPreview={Desc}", i + 1, b.Title, priceDisplay, authors, shortDesc);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[ChatBot] Failed to log fallback books summary");
                }
            }

            // BƯỚC 4: Tạo Prompt và gửi cho Gemini
            // Ta chỉ lấy tối đa 5 cuốn để tiết kiệm token
            var finalBookList = books.Take(5).ToList();
            var prompt = BuildPrompt(finalBookList, message, isFallback);

            return await _geminiService.AskAsync(prompt);
        }

        /// <summary>
        /// Hàm này giúp biến câu hỏi dài thành từ khóa ngắn gọn
        /// Ví dụ: "Tôi muốn tìm cuốn Đắc nhân tâm" -> "đắc nhân tâm"
        /// </summary>
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

        private static string BuildPrompt(List<Book> books, string userQuestion, bool isFallback)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Bạn là trợ lý ảo AI của nhà sách BookStore.");
            sb.AppendLine("Nhiệm vụ: Trả lời câu hỏi khách hàng một cách tự nhiên, thân thiện.");

            sb.AppendLine("\nQUY TẮC:");
            sb.AppendLine("1. Dựa vào [DỮ LIỆU SÁCH] bên dưới để trả lời.");
            sb.AppendLine("2. Nếu có sách phù hợp, hãy giới thiệu tên, giá và mô tả ngắn.");

            if (isFallback)
            {
                sb.AppendLine("3. QUAN TRỌNG: Hiện tại hệ thống KHÔNG tìm thấy đúng sách khách yêu cầu trong danh sách.");
                sb.AppendLine("4. Hãy xin lỗi khéo léo và gợi ý khách tham khảo các sách 'Mới Nhất' bên dưới.");
                sb.AppendLine("5. Tuyệt đối KHÔNG bịa ra thông tin sách không có trong list.");
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
                    // --- SỬA LỖI TẠI ĐÂY ---
                    // 1. Tìm giá hiện hành (IsCurrent = true)
                    // 2. Dùng thuộc tính .Amount thay vì .Value
                    var currentPriceObj = b.Prices?.FirstOrDefault(p => p.IsCurrent);

                    string priceDisplay = currentPriceObj != null
                        ? $"{currentPriceObj.Amount:#,##0} {currentPriceObj.Currency}" // Ví dụ: 50,000 VND
                        : "Liên hệ";
                    // -----------------------

                    // Lấy tác giả
                    string authors = b.BookAuthors != null && b.BookAuthors.Any()
                        ? string.Join(", ", b.BookAuthors.Select(x => x.Author.Name))
                        : "N/A";

                    sb.AppendLine($"{i}. {b.Title} | Giá: {priceDisplay} | Tác giả: {authors}");
                    if (!string.IsNullOrEmpty(b.Description))
                    {
                        string shortDesc = b.Description.Length > 100
                            ? b.Description.Substring(0, 100) + "..."
                            : b.Description;
                        sb.AppendLine($"   Mô tả: {shortDesc}");
                    }
                    i++;
                }
            }

            sb.AppendLine($"\nCÂU HỎI CỦA KHÁCH: \"{userQuestion}\"");
            sb.AppendLine("TRẢ LỜI:");

            return sb.ToString();
        }
    }
}