using BookStore.Application.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IMinIOService _minioService;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IMinIOService minioService, ILogger<FilesController> logger)
    {
        _minioService = minioService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a file to MinIO
    /// </summary>
    [HttpPost("upload")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string? bucket = null)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file provided" });
            }

            // Validate file size (max 10MB)
            const long maxFileSize = 10 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = "File size exceeds 10MB limit" });
            }

            // Validate file type (images only)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Only image files are allowed" });
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";

            using var stream = file.OpenReadStream();
            var fileUrl = await _minioService.UploadFileAsync(
                fileName,
                stream,
                file.ContentType,
                bucket);

            _logger.LogInformation("File uploaded successfully: {FileName}", fileName);

            return Ok(new
            {
                message = "File uploaded successfully",
                fileName = fileName,
                url = fileUrl,
                size = file.Length,
                contentType = file.ContentType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            return StatusCode(500, new { message = "Error uploading file", error = ex.Message });
        }
    }

    /// <summary>
    /// Upload book cover image
    /// </summary>
    [HttpPost("upload/book-cover")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadBookCover(IFormFile file)
    {
        return await UploadFile(file, "ebook-files");
    }

    /// <summary>
    /// Upload user avatar
    /// </summary>
    [HttpPost("upload/avatar")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        return await UploadFile(file, "user-avatars");
    }

    /// <summary>
    /// Delete a file from MinIO
    /// </summary>
    [HttpDelete("{fileName}")]
    [Authorize]
    public async Task<IActionResult> DeleteFile(string fileName, [FromQuery] string? bucket = null)
    {
        try
        {
            var exists = await _minioService.FileExistsAsync(fileName, bucket);
            if (!exists)
            {
                return NotFound(new { message = "File not found" });
            }

            await _minioService.DeleteFileAsync(fileName, bucket);

            _logger.LogInformation("File deleted successfully: {FileName}", fileName);

            return Ok(new { message = "File deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file");
            return StatusCode(500, new { message = "Error deleting file", error = ex.Message });
        }
    }

    /// <summary>
    /// Get presigned URL for a file (temporary access)
    /// </summary>
    [HttpGet("presigned-url/{fileName}")]
    public async Task<IActionResult> GetPresignedUrl(string fileName, [FromQuery] string? bucket = null, [FromQuery] int expiryInSeconds = 3600)
    {
        try
        {
            var exists = await _minioService.FileExistsAsync(fileName, bucket);
            if (!exists)
            {
                return NotFound(new { message = "File not found" });
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
            _logger.LogError(ex, "Error getting presigned URL");
            return StatusCode(500, new { message = "Error getting presigned URL", error = ex.Message });
        }
    }

    /// <summary>
    /// Download a file from MinIO
    /// </summary>
    [HttpGet("download/{fileName}")]
    public async Task<IActionResult> DownloadFile(string fileName, [FromQuery] string? bucket = null)
    {
        try
        {
            var exists = await _minioService.FileExistsAsync(fileName, bucket);
            if (!exists)
            {
                return NotFound(new { message = "File not found" });
            }

            var stream = await _minioService.DownloadFileAsync(fileName, bucket);

            return File(stream, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file");
            return StatusCode(500, new { message = "Error downloading file", error = ex.Message });
        }
    }
}
