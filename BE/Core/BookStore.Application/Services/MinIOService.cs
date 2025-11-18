using BookStore.Application.IService;
using BookStore.Application.Settings;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace BookStore.Application.Services;

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

        // Return public URL
        if (!string.IsNullOrWhiteSpace(_settings.PublicBaseUrl))
        {
            var baseUrl = _settings.PublicBaseUrl!.TrimEnd('/');
            return $"{baseUrl}/{bucket}/{fileName}";
        }

        var protocol = _settings.UseSSL ? "https" : "http";
        return $"{protocol}://{_settings.Endpoint}/{bucket}/{fileName}";
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

            var statObjectArgs = new StatObjectArgs()
                .WithBucket(bucket)
                .WithObject(fileName);

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
