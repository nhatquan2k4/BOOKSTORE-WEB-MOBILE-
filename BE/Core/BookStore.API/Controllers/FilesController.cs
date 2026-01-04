using BookStore.Application.IService;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ApiControllerBase
{
    private readonly IMinIOService _minioService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IMinIOService minioService, ILogger<FilesController> logger)
    {
        _minioService = minioService;
        _logger = logger;
    }

    [HttpPost("upload")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string? bucket = null)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Không có File nào được cung cấp" });
            }

            // Validate file size (max 10MB)
            const long maxFileSize = 10 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = "Kích thước file vượt quá giới hạn 10MB" });
            }

            // Validate file type (images only)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Chỉ cho phép các file hình ảnh" });
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";

            using var stream = file.OpenReadStream();
            var fileUrl = await _minioService.UploadFileAsync(
                fileName,
                stream,
                file.ContentType,
                bucket);

            _logger.LogInformation("File tải lên thành công: {FileName}", fileName);

            return Ok(new
            {
                message = "File tải lên thành công",
                fileName = fileName,
                url = fileUrl,
                size = file.Length,
                contentType = file.ContentType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tải lên file");
            return StatusCode(500, new { message = "Lỗi khi tải lên file", error = ex.Message });
        }
    }

    [HttpPost("upload/book-images")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadBookImages(IFormFile file)
    {
        return await UploadFile(file, "book-images");
    }

    [HttpPost("upload/ebook-files")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadEbookFiles(IFormFile file)
    {
        return await UploadFile(file, "ebook-files");
    }

    [HttpPost("upload/user-avatars")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        return await UploadFile(file, "user-avatars");
    }

    [HttpDelete("{fileName}")]
    [Authorize]
    public async Task<IActionResult> DeleteFile(string fileName, [FromQuery] string? bucket = null)
    {
        try
        {
            var exists = await _minioService.FileExistsAsync(fileName, bucket);
            if (!exists)
            {
                return NotFound(new { message = "File không tồn tại" });
            }

            await _minioService.DeleteFileAsync(fileName, bucket);

            _logger.LogInformation("File đã được xóa thành công: {FileName}", fileName);

            return Ok(new { message = "File đã được xóa thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa file");
            return StatusCode(500, new { message = "Lỗi khi xóa file", error = ex.Message });
        }
    }

    [HttpGet("presigned-url/{fileName}")]
    public async Task<IActionResult> GetPresignedUrl(string fileName, [FromQuery] string? bucket = null, [FromQuery] int expiryInSeconds = 3600)
    {
        try
        {
            var exists = await _minioService.FileExistsAsync(fileName, bucket);
            if (!exists)
            {
                return NotFound(new { message = "File không tồn tại" });
            }

            var url = await _minioService.GetPresignedUrlAsync(fileName, expiryInSeconds, bucket);

            return Ok(new
            {
                url = url,
                expiresIn = expiryInSeconds
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy presigned URL");
            return StatusCode(500, new { message = "Lỗi khi lấy presigned URL", error = ex.Message });
        }
    }

    [HttpGet("download/{fileName}")]
    public async Task<IActionResult> DownloadFile(string fileName, [FromQuery] string? bucket = null)
    {
        try
        {
            var exists = await _minioService.FileExistsAsync(fileName, bucket);
            if (!exists)
            {
                return NotFound(new { message = "Không tìm thấy File" });
            }

            var stream = await _minioService.DownloadFileAsync(fileName, bucket);

            return File(stream, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tải xuống file");
            return StatusCode(500, new { message = "Lỗi khi tải xuống file", error = ex.Message });
        }
    }
}
