using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService;
using BookStore.Application.IService.Rental;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Rental;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;
using System.IO.Compression;

namespace BookStore.Application.Services.Rental
{
    public class EbookService : IEbookService
    {
        private readonly IMinIOService _minioService;
        private readonly IUserSubscriptionRepository _subscriptionRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<EbookService> _logger;
        private const string EBOOK_BUCKET = "ebook-files";

        public EbookService(
            IMinIOService minioService,
            IUserSubscriptionRepository subscriptionRepository,
            IBookRepository bookRepository,
            ILogger<EbookService> logger)
        {
            _minioService = minioService;
            _subscriptionRepository = subscriptionRepository;
            _bookRepository = bookRepository;
            _logger = logger;
        }

        public async Task<UploadEbookResultDto> UploadEbookAsync(Guid bookId, Stream fileStream, string fileName, string contentType)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Không tìm thấy sách");

            // Validate file type
            var allowedTypes = new[] { "application/pdf", "application/epub+zip", "application/x-mobipocket-ebook" };
            Guard.Against(!allowedTypes.Contains(contentType), "Chỉ hỗ trợ file PDF, EPUB hoặc MOBI");

            try
            {
                // Upload to MinIO with book ID as filename
                var ebookFileName = $"{bookId}{Path.GetExtension(fileName)}";
                var fileUrl = await _minioService.UploadFileAsync(ebookFileName, fileStream, contentType, EBOOK_BUCKET);

                _logger.LogInformation($"Uploaded ebook for book {bookId}: {ebookFileName}");

                return new UploadEbookResultDto
                {
                    Success = true,
                    Message = "Upload ebook thành công",
                    FileUrl = fileUrl,
                    FileName = ebookFileName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading ebook for book {bookId}");
                return new UploadEbookResultDto
                {
                    Success = false,
                    Message = $"Lỗi khi upload ebook: {ex.Message}"
                };
            }
        }

        public async Task<EbookAccessDto> GetEbookAccessLinkAsync(Guid userId, Guid bookId)
        {
            // Check if user has active subscription
            var hasActiveSubscription = await _subscriptionRepository.HasActiveSubscriptionAsync(userId);
            Guard.Against(!hasActiveSubscription, "Bạn chưa có gói thuê hoặc gói thuê đã hết hạn. Vui lòng mua gói để đọc ebook.");

            // Check if book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Không tìm thấy sách");

            // Check if ebook file exists in MinIO
            var ebookFileName = $"{bookId}.pdf"; // Try PDF first
            var exists = await _minioService.FileExistsAsync(ebookFileName, EBOOK_BUCKET);

            if (!exists)
            {
                ebookFileName = $"{bookId}.epub"; // Try EPUB
                exists = await _minioService.FileExistsAsync(ebookFileName, EBOOK_BUCKET);
            }

            Guard.Against(!exists, "Sách này chưa có file ebook. Vui lòng liên hệ admin.");

            // Generate presigned URL with 10 minutes expiry (600 seconds)
            var expiryInSeconds = 600; // 10 phút
            var accessUrl = await _minioService.GetPresignedUrlAsync(ebookFileName, expiryInSeconds, EBOOK_BUCKET);
            var expiresAt = DateTime.UtcNow.AddSeconds(expiryInSeconds);

            _logger.LogInformation($"User {userId} accessed ebook {bookId}. Link expires at {expiresAt}");

            return new EbookAccessDto
            {
                BookId = bookId,
                BookTitle = book!.Title,
                AccessUrl = accessUrl,
                ExpiresAt = expiresAt,
                Message = "Link đọc ebook có hiệu lực trong 10 phút"
            };
        }

        public async Task<bool> EbookExistsAsync(Guid bookId)
        {
            var ebookFileName = $"{bookId}.pdf";
            var exists = await _minioService.FileExistsAsync(ebookFileName, EBOOK_BUCKET);

            if (!exists)
            {
                ebookFileName = $"{bookId}.epub";
                exists = await _minioService.FileExistsAsync(ebookFileName, EBOOK_BUCKET);
            }

            return exists;
        }

        public async Task DeleteEbookAsync(Guid bookId)
        {
            var ebookFileName = $"{bookId}.pdf";
            var exists = await _minioService.FileExistsAsync(ebookFileName, EBOOK_BUCKET);

            if (exists)
            {
                await _minioService.DeleteFileAsync(ebookFileName, EBOOK_BUCKET);
                _logger.LogInformation($"Deleted ebook file {ebookFileName}");
                return;
            }

            ebookFileName = $"{bookId}.epub";
            exists = await _minioService.FileExistsAsync(ebookFileName, EBOOK_BUCKET);

            if (exists)
            {
                await _minioService.DeleteFileAsync(ebookFileName, EBOOK_BUCKET);
                _logger.LogInformation($"Deleted ebook file {ebookFileName}");
            }
        }

        /// <summary>
        /// Upload ebook được nén trong file ZIP (ZIP chứa PDF/EPUB bên trong)
        /// Lý do: Giảm dung lượng upload 30-50%, tăng tốc độ upload
        /// </summary>
        public async Task<UploadEbookZipResultDto> UploadEbookZipAsync(Guid bookId, Stream zipStream, string zipFileName)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Không tìm thấy sách");

            try
            {
                string originalFileName = "";
                long originalSize = 0;
                long compressedSize = zipStream.Length;

                // Extract ZIP và lấy file PDF/EPUB bên trong
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Read, leaveOpen: true))
                {
                    // Tìm file PDF hoặc EPUB trong ZIP
                    var ebookEntry = archive.Entries
                        .FirstOrDefault(e =>
                            e.Name.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ||
                            e.Name.EndsWith(".epub", StringComparison.OrdinalIgnoreCase));

                    Guard.Against(ebookEntry == null, "Không tìm thấy file PDF hoặc EPUB trong ZIP");

                    originalFileName = ebookEntry!.Name;
                    originalSize = ebookEntry.Length;

                    // Xác định extension và content type
                    var extension = Path.GetExtension(ebookEntry.Name).ToLower();
                    var contentType = extension == ".pdf" ? "application/pdf" : "application/epub+zip";

                    // Tên file lưu trong MinIO: {bookId}.pdf hoặc {bookId}.epub
                    var storedFileName = $"{bookId}{extension}";

                    // Extract và upload lên MinIO
                    using (var entryStream = ebookEntry.Open())
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            await entryStream.CopyToAsync(memoryStream);
                            memoryStream.Position = 0;

                            await _minioService.UploadFileAsync(
                                storedFileName,
                                memoryStream,
                                contentType,
                                EBOOK_BUCKET
                            );

                            _logger.LogInformation($"Uploaded ebook {storedFileName} (extracted from ZIP) for book {bookId}");
                        }
                    }
                }

                var compressionRatio = originalSize > 0
                    ? Math.Round((decimal)(originalSize - compressedSize) / originalSize * 100, 2)
                    : 0;

                _logger.LogInformation($"Upload ZIP completed for book {bookId}. Original: {originalSize / 1024}KB, Compressed: {compressedSize / 1024}KB, Saved: {compressionRatio}%");

                return new UploadEbookZipResultDto
                {
                    Success = true,
                    Message = $"Upload thành công! Tiết kiệm {compressionRatio}% dung lượng khi upload",
                    OriginalFileName = originalFileName,
                    OriginalSize = originalSize,
                    CompressedSize = compressedSize,
                    CompressionRatio = compressionRatio
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading ebook ZIP for book {bookId}");
                return new UploadEbookZipResultDto
                {
                    Success = false,
                    Message = $"Lỗi khi upload ebook ZIP: {ex.Message}",
                    OriginalFileName = "",
                    OriginalSize = 0,
                    CompressedSize = 0,
                    CompressionRatio = 0
                };
            }
        }

        /// <summary>
        /// Upload CBZ (Comic Book ZIP) - chứa chapters/folders với ảnh từng trang
        /// Structure: chap-1/1.jpg, chap-1/2.jpg, chap-2/1.jpg...
        /// </summary>
        public async Task<UploadCbzResultDto> UploadCbzAsync(Guid bookId, Stream cbzStream, string cbzFileName)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Không tìm thấy sách");

            try
            {
                var chapters = new List<ChapterInfo>();
                var totalPages = 0;

                // 1. Upload file CBZ gốc lên MinIO trước
                var originalCbzFile = $"{bookId}.cbz";
                cbzStream.Position = 0; // Reset stream về đầu
                await _minioService.UploadFileAsync(
                    originalCbzFile,
                    cbzStream,
                    "application/x-cbz",
                    EBOOK_BUCKET
                );
                _logger.LogInformation($"Uploaded original CBZ file: {originalCbzFile}");

                // 2. Reset stream và extract để upload từng ảnh
                cbzStream.Position = 0;
                using (var archive = new ZipArchive(cbzStream, ZipArchiveMode.Read, leaveOpen: true))
                {
                    // Group entries by folder (chapter)
                    var chapterGroups = archive.Entries
                        .Where(e => !string.IsNullOrEmpty(e.Name) &&
                                   (e.Name.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                                    e.Name.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                                    e.Name.EndsWith(".png", StringComparison.OrdinalIgnoreCase)))
                        .GroupBy(e => Path.GetDirectoryName(e.FullName)?.Replace("\\", "/") ?? "root")
                        .OrderBy(g => g.Key);

                    foreach (var chapterGroup in chapterGroups)
                    {
                        var chapterName = chapterGroup.Key;
                        var pages = chapterGroup.OrderBy(e => e.Name).ToList();
                        var pageCount = 0;

                        // Prepare upload tasks (parallel upload)
                        var uploadTasks = new List<Task>();
                        var pageDataList = new List<(int pageNum, string fileName, byte[] data, string contentType)>();

                        // Extract all pages to memory first
                        foreach (var page in pages)
                        {
                            pageCount++;
                            totalPages++;

                            var extension = Path.GetExtension(page.Name);
                            var pageFileName = $"{bookId}/{chapterName}/page-{pageCount:D3}{extension}";
                            var contentType = extension.ToLower() == ".png" ? "image/png" : "image/jpeg";

                            using (var pageStream = page.Open())
                            {
                                using (var memoryStream = new MemoryStream())
                                {
                                    await pageStream.CopyToAsync(memoryStream);
                                    pageDataList.Add((pageCount, pageFileName, memoryStream.ToArray(), contentType));
                                }
                            }
                        }

                        // Upload all pages in parallel (max 30 concurrent uploads for speed)
                        var semaphore = new SemaphoreSlim(30); // Increased from 10 to 30 for faster uploads
                        foreach (var pageData in pageDataList)
                        {
                            await semaphore.WaitAsync();
                            uploadTasks.Add(Task.Run(async () =>
                            {
                                try
                                {
                                    using (var dataStream = new MemoryStream(pageData.data))
                                    {
                                        await _minioService.UploadFileAsync(
                                            pageData.fileName,
                                            dataStream,
                                            pageData.contentType,
                                            EBOOK_BUCKET
                                        );
                                    }
                                }
                                finally
                                {
                                    semaphore.Release();
                                }
                            }));
                        }

                        // Wait for all uploads to complete
                        await Task.WhenAll(uploadTasks);

                        chapters.Add(new ChapterInfo
                        {
                            ChapterName = chapterName,
                            PageCount = pageCount
                        });

                        _logger.LogInformation($"Uploaded {pageCount} pages for chapter {chapterName} of book {bookId} (parallel)");
                    }
                }

                _logger.LogInformation($"CBZ upload completed for book {bookId}. Total: {chapters.Count} chapters, {totalPages} pages");

                return new UploadCbzResultDto
                {
                    Success = true,
                    Message = $"Upload thành công {chapters.Count} chapters với tổng {totalPages} trang",
                    TotalChapters = chapters.Count,
                    TotalPages = totalPages,
                    Chapters = chapters
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading CBZ for book {bookId}");
                return new UploadCbzResultDto
                {
                    Success = false,
                    Message = $"Lỗi khi upload CBZ: {ex.Message}",
                    TotalChapters = 0,
                    TotalPages = 0
                };
            }
        }

        /// <summary>
        /// Lấy danh sách chapters của truyện (cho CBZ)
        /// </summary>
        public async Task<EbookChaptersDto> GetChaptersAsync(Guid userId, Guid bookId)
        {
            // Check subscription
            var hasActiveSubscription = await _subscriptionRepository.HasActiveSubscriptionAsync(userId);
            Guard.Against(!hasActiveSubscription, "Bạn chưa có gói thuê hoặc gói thuê đã hết hạn.");

            // Get book info
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Không tìm thấy sách");

            // Note: MinIO không có API list folders trực tiếp
            // Workaround: Scan các chapter có thể có (chap-1 đến chap-999)
            var chapters = new List<ChapterDto>();

            for (int i = 1; i <= 999; i++)
            {
                var chapterName = $"chap-{i}";
                var firstPagePath = $"{bookId}/{chapterName}/page-001.jpg";

                var exists = await _minioService.FileExistsAsync(firstPagePath, EBOOK_BUCKET);

                if (!exists)
                {
                    // Try .png
                    firstPagePath = $"{bookId}/{chapterName}/page-001.png";
                    exists = await _minioService.FileExistsAsync(firstPagePath, EBOOK_BUCKET);
                }

                if (!exists)
                    break; // Không còn chapter nào nữa

                // Count pages in this chapter
                int pageCount = 0;
                for (int p = 1; p <= 999; p++)
                {
                    var pagePath = $"{bookId}/{chapterName}/page-{p:D3}.jpg";
                    var pageExists = await _minioService.FileExistsAsync(pagePath, EBOOK_BUCKET);

                    if (!pageExists)
                    {
                        pagePath = $"{bookId}/{chapterName}/page-{p:D3}.png";
                        pageExists = await _minioService.FileExistsAsync(pagePath, EBOOK_BUCKET);
                    }

                    if (!pageExists)
                        break;

                    pageCount++;
                }

                chapters.Add(new ChapterDto
                {
                    ChapterName = chapterName,
                    ChapterNumber = i,
                    PageCount = pageCount
                });
            }

            Guard.Against(chapters.Count == 0, "Sách này chưa có nội dung (CBZ). Vui lòng liên hệ admin.");

            return new EbookChaptersDto
            {
                BookId = bookId,
                BookTitle = book!.Title,
                TotalChapters = chapters.Count,
                Chapters = chapters
            };
        }

        /// <summary>
        /// Lấy danh sách ảnh của 1 chapter (với Pre-signed URLs)
        /// </summary>
        public async Task<ChapterPagesDto> GetChapterPagesAsync(Guid userId, Guid bookId, string chapterName)
        {
            // Check subscription
            var hasActiveSubscription = await _subscriptionRepository.HasActiveSubscriptionAsync(userId);
            Guard.Against(!hasActiveSubscription, "Bạn chưa có gói thuê hoặc gói thuê đã hết hạn.");

            // Get book info
            var book = await _bookRepository.GetByIdAsync(bookId);
            Guard.Against(book == null, "Không tìm thấy sách");

            var pages = new List<PageDto>();
            var expiryInSeconds = 600; // 10 phút
            var expiresAt = DateTime.UtcNow.AddSeconds(expiryInSeconds);

            // Scan pages (page-001 đến page-999)
            for (int p = 1; p <= 999; p++)
            {
                var pagePath = $"{bookId}/{chapterName}/page-{p:D3}.jpg";
                var exists = await _minioService.FileExistsAsync(pagePath, EBOOK_BUCKET);

                if (!exists)
                {
                    // Try .png
                    pagePath = $"{bookId}/{chapterName}/page-{p:D3}.png";
                    exists = await _minioService.FileExistsAsync(pagePath, EBOOK_BUCKET);
                }

                if (!exists)
                    break; // Hết trang

                // Generate Pre-signed URL
                var imageUrl = await _minioService.GetPresignedUrlAsync(pagePath, expiryInSeconds, EBOOK_BUCKET);

                pages.Add(new PageDto
                {
                    PageNumber = p,
                    ImageUrl = imageUrl
                });
            }

            Guard.Against(pages.Count == 0, $"Không tìm thấy chapter {chapterName}");

            _logger.LogInformation($"User {userId} accessed {pages.Count} pages of chapter {chapterName}, book {bookId}");

            return new ChapterPagesDto
            {
                BookId = bookId,
                ChapterName = chapterName,
                TotalPages = pages.Count,
                Pages = pages,
                ExpiresAt = expiresAt,
                Message = $"Link đọc {pages.Count} trang có hiệu lực trong 10 phút"
            };
        }
    }
}
