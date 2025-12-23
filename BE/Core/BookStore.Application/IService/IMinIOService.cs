using Microsoft.AspNetCore.Http; // Cần thiết cho IFormFile

namespace BookStore.Application.IService;

public interface IMinIOService
{
    // Upload dùng IFormFile (Dùng cho Controller/Service)
    Task<string> UploadFileAsync(IFormFile file, string bucketName, string? objectName = null);

    // Upload dùng Stream (Dùng cho xử lý nội bộ nếu cần)
    Task<string> UploadFileAsync(string fileName, Stream stream, string contentType, string? bucketName = null);

    Task DeleteFileAsync(string fileName, string? bucketName = null);

    Task<string> GetPresignedUrlAsync(string fileName, int expiryInSeconds = 3600, string? bucketName = null);

    Task<bool> FileExistsAsync(string fileName, string? bucketName = null);

    Task<Stream> DownloadFileAsync(string fileName, string? bucketName = null);
}