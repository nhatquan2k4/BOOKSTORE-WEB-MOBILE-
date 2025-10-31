﻿using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Book
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BookController(IBookService bookService)
        {
            _bookService = bookService;
        }

        /// <summary>
        /// Lấy danh sách sách với phân trang và lọc
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định: 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định: 10)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm (tìm theo tên, ISBN)</param>
        /// <param name="categoryId">Lọc theo danh mục</param>
        /// <param name="authorId">Lọc theo tác giả</param>
        /// <param name="publisherId">Lọc theo nhà xuất bản</param>
        /// <param name="isAvailable">Lọc theo trạng thái còn hàng</param>
        /// <returns>Danh sách BookDto và tổng số bản ghi</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] Guid? categoryId = null,
            [FromQuery] Guid? authorId = null,
            [FromQuery] Guid? publisherId = null,
            [FromQuery] bool? isAvailable = null)
        {
            var (items, totalCount) = await _bookService.GetAllAsync(
                pageNumber, pageSize, searchTerm, categoryId, authorId, publisherId, isAvailable);

            return Ok(new
            {
                items,
                totalCount,
                pageNumber,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        /// <summary>
        /// Lấy chi tiết sách theo ID
        /// </summary>
        /// <param name="id">ID của sách</param>
        /// <returns>BookDetailDto</returns>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookDetailDto>> GetById(Guid id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null)
                return NotFound(new { message = $"Không tìm thấy sách với ID: {id}" });

            return Ok(book);
        }

        /// <summary>
        /// Lấy sách theo ISBN
        /// </summary>
        /// <param name="isbn">Mã ISBN của sách</param>
        /// <returns>BookDetailDto</returns>
        [HttpGet("by-isbn/{isbn}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookDetailDto>> GetByISBN(string isbn)
        {
            var book = await _bookService.GetByISBNAsync(isbn);
            if (book == null)
                return NotFound(new { message = $"Không tìm thấy sách với ISBN: {isbn}" });

            return Ok(book);
        }

        /// <summary>
        /// Lấy danh sách sách theo danh mục
        /// </summary>
        /// <param name="categoryId">ID của danh mục</param>
        /// <param name="top">Số lượng sách tối đa (mặc định: 10)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("by-category/{categoryId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByCategory(Guid categoryId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByCategoryAsync(categoryId, top);
            return Ok(books);
        }

        /// <summary>
        /// Lấy danh sách sách theo tác giả
        /// </summary>
        /// <param name="authorId">ID của tác giả</param>
        /// <param name="top">Số lượng sách tối đa (mặc định: 10)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("by-author/{authorId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByAuthor(Guid authorId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByAuthorAsync(authorId, top);
            return Ok(books);
        }

        /// <summary>
        /// Lấy danh sách sách theo nhà xuất bản
        /// </summary>
        /// <param name="publisherId">ID của nhà xuất bản</param>
        /// <param name="top">Số lượng sách tối đa (mặc định: 10)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("by-publisher/{publisherId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByPublisher(Guid publisherId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByPublisherAsync(publisherId, top);
            return Ok(books);
        }

        /// <summary>
        /// Tìm kiếm sách theo từ khóa
        /// </summary>
        /// <param name="searchTerm">Từ khóa tìm kiếm</param>
        /// <param name="top">Số lượng kết quả tối đa (mặc định: 20)</param>
        /// <returns>Danh sách BookDto</returns>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> Search([FromQuery] string searchTerm, [FromQuery] int top = 20)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống" });

            var books = await _bookService.SearchAsync(searchTerm, top);
            return Ok(books);
        }

        /// <summary>
        /// Tạo mới sách
        /// </summary>
        /// <param name="dto">Thông tin sách</param>
        /// <returns>BookDetailDto đã được tạo</returns>
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
                    new { message = "Có lỗi xảy ra khi tạo sách", details = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật sách
        /// </summary>
        /// <param name="id">ID của sách</param>
        /// <param name="dto">Thông tin cập nhật</param>
        /// <returns>BookDetailDto đã được cập nhật</returns>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookDetailDto>> Update(Guid id, [FromBody] UpdateBookDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID trong URL không khớp với ID trong body" });

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
                    new { message = "Có lỗi xảy ra khi cập nhật sách", details = ex.Message });
            }
        }

        /// <summary>
        /// Xóa sách
        /// </summary>
        /// <param name="id">ID của sách</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Không tìm thấy sách với ID: {id}" });

            return NoContent();
        }

        /// <summary>
        /// Cập nhật trạng thái còn hàng của sách
        /// </summary>
        /// <param name="id">ID của sách</param>
        /// <param name="isAvailable">Trạng thái còn hàng</param>
        /// <returns>Kết quả cập nhật</returns>
        [HttpPatch("{id:guid}/availability")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateAvailability(Guid id, [FromBody] bool isAvailable)
        {
            var result = await _bookService.UpdateAvailabilityAsync(id, isAvailable);
            if (!result)
                return NotFound(new { message = $"Không tìm thấy sách với ID: {id}" });

            return Ok(new { message = "Cập nhật trạng thái thành công", isAvailable });
        }

        /// <summary>
        /// Kiểm tra ISBN đã tồn tại chưa
        /// </summary>
        /// <param name="isbn">Mã ISBN cần kiểm tra</param>
        /// <param name="excludeBookId">ID sách cần loại trừ (dùng khi update)</param>
        /// <returns>True nếu ISBN đã tồn tại</returns>
        [HttpGet("check-isbn")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> CheckISBN([FromQuery] string isbn, [FromQuery] Guid? excludeBookId = null)
        {
            if (string.IsNullOrWhiteSpace(isbn))
                return BadRequest(new { message = "ISBN không được để trống" });

            var exists = await _bookService.IsISBNExistsAsync(isbn, excludeBookId);
            return Ok(new { exists, isbn });
        }
    }
}
