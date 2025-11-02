using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Shared.Utilities;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Book
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ApiControllerBase
    {
        private readonly IBookService _bookService;

        public BookController(
            IBookService bookService)
        {
            _bookService = bookService;
        }

        /// <summary>
        /// L?y danh sách sách v?i phân trang và l?c
        /// </summary>
        /// <param name="pageNumber">S? trang (m?c d?nh: 1)</param>
        /// <param name="pageSize">Kích thu?c trang (m?c d?nh: 10)</param>
        /// <param name="searchTerm">T? khóa tìm ki?m (tìm theo tên, ISBN)</param>
        /// <param name="categoryId">L?c theo danh m?c</param>
        /// <param name="authorId">L?c theo tác gi?</param>
        /// <param name="publisherId">L?c theo nhà xu?t b?n</param>
        /// <param name="isAvailable">L?c theo tr?ng thái còn hàng</param>
        /// <returns>PagedResult v?i danh sách BookDto</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PagedResult<BookDto>>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] Guid? authorId = null,
            [FromQuery] Guid? publisherId = null,
            [FromQuery] bool? isAvailable = null)
        {
            var result = await _bookService.GetAllAsync(
                pageNumber, pageSize, searchTerm, categoryId, authorId, publisherId, isAvailable);

            return Ok(result);
        }

        /// <summary>
        /// L?y chi ti?t sách theo ID
        /// </summary>
        /// <param name="id">ID c?a sách</param>
        /// <returns>BookDetailDto</returns>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookDetailDto>> GetById(Guid id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null)
                return NotFound(new { message = $"Không tìm th?y sách v?i ID: {id}" });

            return Ok(book);
        }

        /// <summary>
        /// L?y sách theo ISBN
        /// </summary>
        /// <param name="isbn">Mã ISBN c?a sách</param>
        /// <returns>BookDetailDto</returns>
        [HttpGet("by-isbn/{isbn}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookDetailDto>> GetByISBN(string isbn)
        {
            var book = await _bookService.GetByISBNAsync(isbn);
            if (book == null)
                return NotFound(new { message = $"Không tìm th?y sách v?i ISBN: {isbn}" });

            return Ok(book);
        }

        /// <summary>
        /// L?y danh sách sách theo danh m?c
        /// </summary>
        /// <param name="categoryId">ID c?a danh m?c</param>
        /// <param name="top">S? lu?ng sách t?i da (m?c d?nh: 10)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("by-category/{categoryId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByCategory(Guid categoryId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByCategoryAsync(categoryId, top);
            return Ok(books);
        }

        /// <summary>
        /// L?y danh sách sách theo tác gi?
        /// </summary>
        /// <param name="authorId">ID c?a tác gi?</param>
        /// <param name="top">S? lu?ng sách t?i da (m?c d?nh: 10)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("by-author/{authorId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByAuthor(Guid authorId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByAuthorAsync(authorId, top);
            return Ok(books);
        }

        /// <summary>
        /// L?y danh sách sách theo nhà xu?t b?n
        /// </summary>
        /// <param name="publisherId">ID c?a nhà xu?t b?n</param>
        /// <param name="top">S? lu?ng sách t?i da (m?c d?nh: 10)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("by-publisher/{publisherId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByPublisher(Guid publisherId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByPublisherAsync(publisherId, top);
            return Ok(books);
        }

        /// <summary>
        /// Tìm ki?m sách theo t? khóa
        /// </summary>
        /// <param name="searchTerm">T? khóa tìm ki?m</param>
        /// <param name="top">S? lu?ng k?t qu? t?i da (m?c d?nh: 20)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> Search([FromQuery] string searchTerm, [FromQuery] int top = 20)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "T? khóa tìm ki?m không du?c d? tr?ng" });

            var books = await _bookService.SearchAsync(searchTerm, top);
            return Ok(books);
        }

        /// <summary>
        /// T?o m?i sách
        /// </summary>
        /// <param name="dto">Thông tin sách</param>
        /// <returns>BookDetailDto dã du?c t?o</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BookDetailDto>> Create([FromBody] CreateBookDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdBook = await _bookService.AddAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdBook.Id }, createdBook);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Có l?i x?y ra khi t?o sách", details = ex.Message });
            }
        }

        /// <summary>
        /// C?p nh?t sách
        /// </summary>
        /// <param name="id">ID c?a sách</param>
        /// <param name="dto">Thông tin c?p nh?t</param>
        /// <returns>BookDetailDto dã du?c c?p nh?t</returns>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookDetailDto>> Update(Guid id, [FromBody] UpdateBookDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID trong URL không kh?p v?i ID trong body" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedBook = await _bookService.UpdateAsync(dto);
                return Ok(updatedBook);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Có l?i x?y ra khi c?p nh?t sách", details = ex.Message });
            }
        }

        /// <summary>
        /// Xóa sách
        /// </summary>
        /// <param name="id">ID c?a sách</param>
        /// <returns>K?t qu? xóa</returns>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Không tìm th?y sách v?i ID: {id}" });

            return NoContent();
        }

        /// <summary>
        /// C?p nh?t tr?ng thái còn hàng c?a sách
        /// </summary>
        /// <param name="id">ID c?a sách</param>
        /// <param name="isAvailable">Tr?ng thái còn hàng</param>
        /// <returns>K?t qu? c?p nh?t</returns>
        [HttpPatch("{id:guid}/availability")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateAvailability(Guid id, [FromBody] bool isAvailable)
        {
            var result = await _bookService.UpdateAvailabilityAsync(id, isAvailable);
            if (!result)
                return NotFound(new { message = $"Không tìm th?y sách v?i ID: {id}" });

            return Ok(new { message = "C?p nh?t tr?ng thái thành công", isAvailable });
        }

        /// <summary>
        /// Ki?m tra ISBN dã t?n t?i chua
        /// </summary>
        /// <param name="isbn">Mã ISBN c?n ki?m tra</param>
        /// <param name="excludeBookId">ID sách c?n lo?i tr? (dùng khi update)</param>
        /// <returns>True n?u ISBN dã t?n t?i</returns>
        [HttpGet("check-isbn")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> CheckISBN([FromQuery] string isbn, [FromQuery] Guid? excludeBookId = null)
        {
            if (string.IsNullOrWhiteSpace(isbn))
                return BadRequest(new { message = "ISBN không du?c d? tr?ng" });

            var exists = await _bookService.IsISBNExistsAsync(isbn, excludeBookId);
            return Ok(new { exists, isbn });
        }
    }
}
