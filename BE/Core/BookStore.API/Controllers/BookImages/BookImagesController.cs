using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.IService.Catalog;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

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
                return NotFound(new { message = "No cover image found for this book" });

            return Ok(coverImage);
        }

        /// <summary>
        /// Thêm một image mới cho book (cần upload file trước, sau đó gửi URL)
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="dto">CreateBookImageDto với ImageUrl đã upload</param>
        /// <returns>BookImageDto</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BookImageDto>> CreateImage(
            Guid bookId,
            [FromBody] CreateBookImageDto dto)
        {
            if (bookId != dto.BookId)
                return BadRequest(new { message = "BookId mismatch" });

            try
            {
                var result = await _bookImageService.UploadImageAsync(dto);
                return CreatedAtRoute("GetImageById", new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Thêm nhiều images cùng lúc cho book (cần upload files trước, sau đó gửi URLs)
        /// </summary>
        /// <param name="bookId">ID của book</param>
        /// <param name="dto">UploadBookImagesDto với danh sách ImageUrls đã upload</param>
        /// <returns>Danh sách BookImageDto</returns>
        [HttpPost("batch")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<BookImageDto>>> CreateImages(
            Guid bookId,
            [FromBody] UploadBookImagesDto dto)
        {
            if (bookId != dto.BookId)
                return BadRequest(new { message = "BookId mismatch" });

            try
            {
                var result = await _bookImageService.UploadImagesAsync(dto);
                return CreatedAtAction(nameof(GetImagesByBookId), new { bookId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

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
                return BadRequest(new { message = "BookId mismatch" });

            try
            {
                await _bookImageService.SetCoverImageAsync(dto);
                return Ok(new { message = "Cover image set successfully" });
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
                return NotFound(new { message = "No images found for this book" });

            return Ok(new { message = "All images deleted successfully" });
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
                return NotFound(new { message = $"Image with ID {id} not found" });

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
                return BadRequest(new { message = "ID mismatch" });

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
                return NotFound(new { message = $"Image with ID {id} not found" });

            return Ok(new { message = "Image deleted successfully" });
        }
    }
}
