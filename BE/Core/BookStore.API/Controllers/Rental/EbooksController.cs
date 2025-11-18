using BookStore.API.Base;
using BookStore.Application.IService.Rental;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Timeouts;
using System.Security.Claims;

namespace BookStore.API.Controllers.Rental
{
    /// <summary>
    /// Controller quản lý ebook files (upload và access)
    /// </summary>
    [Route("api/rental/books")]
    [ApiController]
    [Tags("Rental - Ebooks")]
    public class EbooksController : ApiControllerBase
    {
        private readonly IEbookService _ebookService;
        private readonly ILogger<EbooksController> _logger;

        public EbooksController(
            IEbookService ebookService,
            ILogger<EbooksController> logger)
        {
            _ebookService = ebookService;
            _logger = logger;
        }

        /// <summary>
        /// Admin upload ebook file lên MinIO
        /// POST: api/rental/books/{bookId}/upload
        /// </summary>
        [HttpPost("{bookId:guid}/upload")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadEbook([FromRoute] Guid bookId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "File không hợp lệ" });

                using var stream = file.OpenReadStream();
                var result = await _ebookService.UploadEbookAsync(
                    bookId,
                    stream,
                    file.FileName,
                    file.ContentType
                );

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading ebook for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// User lấy link đọc ebook (Pre-signed URL có hạn 10 phút)
        /// Yêu cầu: User phải có subscription còn hạn
        /// GET: api/rental/books/{bookId}/access-link
        /// </summary>
        [HttpGet("{bookId:guid}/access-link")]
        [Authorize]
        public async Task<IActionResult> GetEbookAccessLink([FromRoute] Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _ebookService.GetEbookAccessLinkAsync(userId, bookId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting ebook access link for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kiểm tra ebook có tồn tại không
        /// GET: api/rental/books/{bookId}/exists
        /// </summary>
        [HttpGet("{bookId:guid}/exists")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EbookExists([FromRoute] Guid bookId)
        {
            try
            {
                var exists = await _ebookService.EbookExistsAsync(bookId);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking ebook existence for book {bookId}");
                return StatusCode(500, new { message = "Lỗi khi kiểm tra ebook", details = ex.Message });
            }
        }

        /// <summary>
        /// Admin xóa ebook file
        /// DELETE: api/rental/books/{bookId}/ebook
        /// </summary>
        [HttpDelete("{bookId:guid}/ebook")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEbook([FromRoute] Guid bookId)
        {
            try
            {
                await _ebookService.DeleteEbookAsync(bookId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting ebook for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin upload ebook được nén trong ZIP (để tăng tốc độ upload)
        /// ZIP chứa 1 file PDF hoặc EPUB bên trong
        /// Hệ thống sẽ tự động extract và lưu file gốc
        /// POST: api/rental/books/{bookId}/upload-zip
        /// </summary>
        [HttpPost("{bookId:guid}/upload-zip")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadEbookZip([FromRoute] Guid bookId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "File không hợp lệ" });

                if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "File phải có định dạng .zip" });

                using var stream = file.OpenReadStream();
                var result = await _ebookService.UploadEbookZipAsync(bookId, stream, file.FileName);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading ebook ZIP for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin upload CBZ (Comic Book ZIP) - Truyện tranh
        /// CBZ chứa các folder chapters với ảnh từng trang: chap-1/1.jpg, chap-2/1.jpg...
        /// POST: api/rental/books/{bookId}/upload-cbz
        /// </summary>
        [HttpPost("{bookId:guid}/upload-cbz")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        [RequestTimeout(600000)] // 10 phút timeout cho CBZ lớn
        [RequestSizeLimit(524288000)] // 500MB max file size
        public async Task<IActionResult> UploadCbz([FromRoute] Guid bookId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "File không hợp lệ" });

                // Check max file size (500MB)
                const long maxFileSize = 524288000; // 500MB
                if (file.Length > maxFileSize)
                    return BadRequest(new { message = $"File vượt quá giới hạn {maxFileSize / 1024 / 1024}MB" });

                if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase) &&
                    !file.FileName.EndsWith(".cbz", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "File phải có định dạng .zip hoặc .cbz" });

                using var stream = file.OpenReadStream();
                var result = await _ebookService.UploadCbzAsync(bookId, stream, file.FileName);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading CBZ for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// User lấy danh sách chapters (cho truyện tranh CBZ)
        /// GET: api/rental/books/{bookId}/chapters
        /// </summary>
        [HttpGet("{bookId:guid}/chapters")]
        [Authorize]
        public async Task<IActionResult> GetChapters([FromRoute] Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _ebookService.GetChaptersAsync(userId, bookId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting chapters for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// User lấy danh sách ảnh của 1 chapter (Pre-signed URLs, hết hạn 10 phút)
        /// GET: api/rental/books/{bookId}/chapters/{chapterName}/pages
        /// </summary>
        [HttpGet("{bookId:guid}/chapters/{chapterName}/pages")]
        [Authorize]
        public async Task<IActionResult> GetChapterPages([FromRoute] Guid bookId, [FromRoute] string chapterName)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _ebookService.GetChapterPagesAsync(userId, bookId, chapterName);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting pages for chapter {chapterName}, book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }
    }
}
