using BookStore.Application.IService;
using BookStore.Application.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace BookStore.Infrastructure.Services;

public class MinIOService : IMinIOService
{
    private readonly IMinioClient _minioClient;
    private readonly MinIOSettings _settings;

    public MinIOService(IOptions<MinIOSettings> settings)
    {
        _settings = settings.Value;

        _minioClient = new MinioClient()
            .WithEndpoint(_settings.Endpoint)
            .WithCredentials(_settings.AccessKey, _settings.SecretKey)
            .WithSSL(_settings.UseSSL)
            .Build();
    }

    // 1. Hàm Upload chính (nhận IFormFile từ Controller)
    public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string? objectName = null)
    {
        using var stream = file.OpenReadStream();
        // Tạo tên file duy nhất nếu không được cung cấp
        var fileName = objectName ?? $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        
        // Gọi lại hàm xử lý Stream bên dưới
        return await UploadFileAsync(fileName, stream, file.ContentType, bucketName);
    }

    // 2. Hàm Upload xử lý Stream (Core logic MinIO)
    public async Task<string> UploadFileAsync(string fileName, Stream stream, string contentType, string? bucketName = null)
    {
        var bucket = bucketName ?? _settings.BucketName;

        // Ensure bucket exists
        var bucketExists = await _minioClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(bucket));

        if (!bucketExists)
        {
            await _minioClient.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(bucket));
        }

        // Upload file
        var putObjectArgs = new PutObjectArgs()
            .WithBucket(bucket)
            .WithObject(fileName)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType);

        await _minioClient.PutObjectAsync(putObjectArgs);

        // Return relative path only (for ngrok compatibility)
        // Frontend will prepend MINIO_BASE_URL
        // MinIO structure: /{bucket}/{fileName} (NO /storage/ prefix!)
        return $"/{bucket}/{fileName}";
    }

    public async Task DeleteFileAsync(string fileName, string? bucketName = null)
    {
        var bucket = bucketName ?? _settings.BucketName;

        var removeObjectArgs = new RemoveObjectArgs()
            .WithBucket(bucket)
            .WithObject(fileName);

        await _minioClient.RemoveObjectAsync(removeObjectArgs);
    }

    public async Task<string> GetPresignedUrlAsync(string fileName, int expiryInSeconds = 3600, string? bucketName = null)
    {
        var bucket = bucketName ?? _settings.BucketName;

        var presignedGetObjectArgs = new PresignedGetObjectArgs()
            .WithBucket(bucket)
            .WithObject(fileName)
            .WithExpiry(expiryInSeconds);

        return await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
    }

    public async Task<bool> FileExistsAsync(string fileName, string? bucketName = null)
    {
        try
        {
            var bucket = bucketName ?? _settings.BucketName;
            var statObjectArgs = new StatObjectArgs().WithBucket(bucket).WithObject(fileName);
            await _minioClient.StatObjectAsync(statObjectArgs);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileName, string? bucketName = null)
    {
        var bucket = bucketName ?? _settings.BucketName;
        var memoryStream = new MemoryStream();

        var getObjectArgs = new GetObjectArgs()
            .WithBucket(bucket)
            .WithObject(fileName)
            .WithCallbackStream(stream =>
            {
                stream.CopyTo(memoryStream);
            });

        await _minioClient.GetObjectAsync(getObjectArgs);
        memoryStream.Position = 0;

        return memoryStream;
    }
}