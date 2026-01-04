using BookStore.API.Base;
using BookStore.Application.IService.Rental;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Timeouts;
using System.Security.Claims;

namespace BookStore.API.Controllers.Rental
{

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
