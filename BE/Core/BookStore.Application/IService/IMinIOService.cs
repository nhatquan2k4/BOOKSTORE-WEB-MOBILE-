namespace BookStore.Application.IService;

public interface IMinIOService
{
    /// <summary>
    /// Upload file to MinIO
    /// </summary>
    /// <param name="fileName">Name of the file</param>
    /// <param name="stream">File stream</param>
    /// <param name="contentType">Content type (e.g., image/jpeg)</param>
    /// <param name="bucketName">Optional bucket name, uses default if null</param>
    /// <returns>URL of uploaded file</returns>
    Task<string> UploadFileAsync(string fileName, Stream stream, string contentType, string? bucketName = null);

    /// <summary>
    /// Delete file from MinIO
    /// </summary>
    /// <param name="fileName">Name of the file to delete</param>
    /// <param name="bucketName">Optional bucket name, uses default if null</param>
    Task DeleteFileAsync(string fileName, string? bucketName = null);

    /// <summary>
    /// Get presigned URL for file (temporary access URL)
    /// </summary>
    /// <param name="fileName">Name of the file</param>
    /// <param name="expiryInSeconds">Expiry time in seconds</param>
    /// <param name="bucketName">Optional bucket name, uses default if null</param>
    /// <returns>Presigned URL</returns>
    Task<string> GetPresignedUrlAsync(string fileName, int expiryInSeconds = 3600, string? bucketName = null);

    /// <summary>
    /// Check if file exists in MinIO
    /// </summary>
    /// <param name="fileName">Name of the file</param>
    /// <param name="bucketName">Optional bucket name, uses default if null</param>
    /// <returns>True if exists, false otherwise</returns>
    Task<bool> FileExistsAsync(string fileName, string? bucketName = null);

    /// <summary>
    /// Download file from MinIO
    /// </summary>
    /// <param name="fileName">Name of the file</param>
    /// <param name="bucketName">Optional bucket name, uses default if null</param>
    /// <returns>File stream</returns>
    Task<Stream> DownloadFileAsync(string fileName, string? bucketName = null);
}
