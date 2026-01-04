namespace BookStore.Application.IService;

public interface IMinIOService
{

    Task<string> UploadFileAsync(string fileName, Stream stream, string contentType, string? bucketName = null);


    Task DeleteFileAsync(string fileName, string? bucketName = null);

    Task<string> GetPresignedUrlAsync(string fileName, int expiryInSeconds = 3600, string? bucketName = null);

    Task<bool> FileExistsAsync(string fileName, string? bucketName = null);

    Task<Stream> DownloadFileAsync(string fileName, string? bucketName = null);
}
