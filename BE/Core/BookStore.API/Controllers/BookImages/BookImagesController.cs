using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.IService.Catalog;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookStore.Domain.Entities.Identity;

namespace BookStore.API.Controllers.BookImages
{
    [Route("api/books/{bookId:guid}/images")]
    public class BookImagesController : ApiControllerBase
    {
        private readonly IBookImageService _bookImageService;

        public BookImagesController(IBookImageService bookImageService)
        {
            _bookImageService = bookImageService;
        }

        /// <summary>
        /// Lấy tất cả images của một book
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <returns>Danh sách BookImageDto</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<BookImageDto>>> GetImagesByBookId(Guid bookId)
        {
            var images = await _bookImageService.GetImagesByBookIdAsync(bookId);
            return Ok(images);
        }

        /// <summary>
        /// Lấy cover image của book
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <returns>BookImageDto hoặc null</returns>
        [HttpGet("cover")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookImageDto>> GetCoverImage(Guid bookId)
        {
            var coverImage = await _bookImageService.GetCoverImageAsync(bookId);
            if (coverImage == null)
                return NotFound(new { message = "Không tìm thấy ảnh bìa cho sách này" });

            return Ok(coverImage);
        }

        /// <summary>
        /// Upload file và tạo BookImage trong 1 request (RECOMMENDED)
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="file">File ảnh cần upload</param>
        /// <param name="isCover">Có phải ảnh bìa không (default: false)</param>
        /// <param name="displayOrder">Thứ tự hiển thị (default: 0)</param>
        /// <returns>BookImageDto</returns>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BookImageDto>> UploadAndCreateImage(
            Guid bookId,
            IFormFile file,
            [FromForm] bool isCover = false,
            [FromForm] int displayOrder = 0)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Không có file nào được cung cấp" });
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
                    return BadRequest(new { message = "Chỉ cho phép các file hình ảnh (.jpg, .jpeg, .png, .gif, .webp)" });
                }

                // Upload to MinIO and save to DB via Service
                BookImageDto result;
                using (var stream = file.OpenReadStream())
                {
                    result = await _bookImageService.UploadFileAsync(
                        bookId,
                        stream,
                        file.FileName,
                        file.ContentType,
                        isCover,
                        displayOrder);
                }

                return CreatedAtRoute("GetImageById", new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi upload ảnh", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload nhiều files và tạo BookImages trong 1 request
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="files">Danh sách file ảnh</param>
        /// <param name="coverImageIndex">Index của ảnh bìa (nếu có)</param>
        /// <returns>Danh sách BookImageDto</returns>
        [HttpPost("upload/batch")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<BookImageDto>>> UploadAndCreateImages(
            Guid bookId,
            [FromForm] List<IFormFile> files,
            [FromForm] int? coverImageIndex = null)
        {
            try
            {
                // Validate files
                if (files == null || !files.Any())
                {
                    return BadRequest(new { message = "Phải cung cấp ít nhất một file" });
                }

                if (files.Count > 10)
                {
                    return BadRequest(new { message = "Chỉ có thể upload tối đa 10 ảnh cùng lúc" });
                }

                // Validate all files
                const long maxFileSize = 10 * 1024 * 1024;
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

                foreach (var file in files)
                {
                    if (file.Length > maxFileSize)
                    {
                        return BadRequest(new { message = $"File {file.FileName} vượt quá giới hạn 10MB" });
                    }

                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(extension))
                    {
                        return BadRequest(new { message = $"File {file.FileName} không phải định dạng ảnh hợp lệ" });
                    }
                }

                // Prepare file data for service
                var fileData = new List<(Stream stream, string fileName, string contentType)>();
                foreach (var file in files)
                {
                    var stream = file.OpenReadStream();
                    fileData.Add((stream, file.FileName, file.ContentType));
                }

                // Upload to MinIO and save to DB via Service
                var result = await _bookImageService.UploadFilesAsync(bookId, fileData, coverImageIndex);

                // Dispose streams
                foreach (var (stream, _, _) in fileData)
                {
                    stream.Dispose();
                }

                return CreatedAtAction(nameof(GetImagesByBookId), new { bookId }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi upload ảnh", error = ex.Message });
            }
        }

        /// <summary>
        /// Thêm một image mới cho book (cần upload file trước, sau đó gửi URL)
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="dto">CreateBookImageDto với ImageUrl đã upload</param>
        /// <returns>BookImageDto</returns>
        // [HttpPost]
        // [ProducesResponseType(StatusCodes.Status201Created)]
        // [ProducesResponseType(StatusCodes.Status400BadRequest)]
        // public async Task<ActionResult<BookImageDto>> CreateImage(
        //     Guid bookId,
        //     [FromBody] CreateBookImageDto dto)
        // {
        //     if (bookId != dto.BookId)
        //         return BadRequest(new { message = "BookId không hợp lệ" });

        //     try
        //     {
        //         var result = await _bookImageService.UploadImageAsync(dto);
        //         return CreatedAtRoute("GetImageById", new { id = result.Id }, result);
        //     }
        //     catch (InvalidOperationException ex)
        //     {
        //         return BadRequest(new { message = ex.Message });
        //     }
        // }

        /// <summary>
        /// Thêm nhiều images cùng lúc cho book (cần upload files trước, sau đó gửi URLs)
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="dto">UploadBookImagesDto với danh sách ImageUrls đã upload</param>
        /// <returns>Danh sách BookImageDto</returns>
        // [HttpPost("batch")]
        // [ProducesResponseType(StatusCodes.Status201Created)]
        // [ProducesResponseType(StatusCodes.Status400BadRequest)]
        // public async Task<ActionResult<IEnumerable<BookImageDto>>> CreateImages(
        //     Guid bookId,
        //     [FromBody] UploadBookImagesDto dto)
        // {
        //     if (bookId != dto.BookId)
        //         return BadRequest(new { message = "BookId không hợp lệ" });

        //     try
        //     {
        //         var result = await _bookImageService.UploadImagesAsync(dto);
        //         return CreatedAtAction(nameof(GetImagesByBookId), new { bookId }, result);
        //     }
        //     catch (InvalidOperationException ex)
        //     {
        //         return BadRequest(new { message = ex.Message });
        //     }
        // }

        /// <summary>
        /// Set một image làm cover của book
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="dto">SetCoverImageDto</param>
        /// <returns>Success status</returns>
        [HttpPut("cover")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> SetCoverImage(Guid bookId, [FromBody] SetCoverImageDto dto)
        {
            if (bookId != dto.BookId)
                return BadRequest(new { message = "BookId không hợp lệ" });

            try
            {
                await _bookImageService.SetCoverImageAsync(dto);
                return Ok(new { message = "Đã đặt ảnh bìa thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa tất cả images của book
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <returns>Success status</returns>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteAllImages(Guid bookId)
        {
            var result = await _bookImageService.DeleteImagesByBookIdAsync(bookId);
            if (!result)
                return NotFound(new { message = "Không tìm thấy ảnh nào cho sách này" });

            return Ok(new { message = "Đã xóa tất cả ảnh thành công" });
        }
    }

    /// <summary>
    /// Controller riêng cho các operations trên individual image
    /// </summary>
    [Route("api/images")]
    public class BookImageController : ApiControllerBase
    {
        private readonly IBookImageService _bookImageService;

        public BookImageController(IBookImageService bookImageService)
        {
            _bookImageService = bookImageService;
        }

        /// <summary>
        /// Lấy tất cả images của tất cả sách
        /// </summary>
        /// <returns>Danh sách BookImageDto</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookImageDto>>> GetAllImages()
        {
            var images = await _bookImageService.GetAllImagesAsync();
            return Ok(images);
        }

        /// <summary>
        /// Lấy chi tiết một image theo ID
        /// </summary>
        /// <param name="id">ID của image</param>
        /// <returns>BookImageDto</returns>
        [HttpGet("{id:guid}", Name = "GetImageById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookImageDto>> GetImageById(Guid id)
        {
            var image = await _bookImageService.GetImageByIdAsync(id);
            if (image == null)
                return NotFound(new { message = $"Không tìm thấy ảnh với ID {id}" });

            return Ok(image);
        }

        /// <summary>
        /// Cập nhật thông tin image (IsCover, DisplayOrder)
        /// </summary>
        /// <param name="id">ID của image</param>
        /// <param name="dto">UpdateBookImageDto</param>
        /// <returns>BookImageDto đã cập nhật</returns>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookImageDto>> UpdateImage(Guid id, [FromBody] UpdateBookImageDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID không hợp lệ" });

            try
            {
                var result = await _bookImageService.UpdateImageAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa một image
        /// </summary>
        /// <param name="id">ID của image</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteImage(Guid id)
        {
            var result = await _bookImageService.DeleteImageAsync(id);
            if (!result)
                return NotFound(new { message = $"Không tìm thấy ảnh với ID {id}" });

            return Ok(new { message = "Đã xóa ảnh thành công" });
        }
    }
}
