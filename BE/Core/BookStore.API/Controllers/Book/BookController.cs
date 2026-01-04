using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Shared.Utilities;
using BookStore.Shared.Exceptions;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

        #region Query Methods (Get/Search)

        [AllowAnonymous]
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

        [AllowAnonymous]
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

        [AllowAnonymous]
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


        [AllowAnonymous]
        [HttpGet("by-category/{categoryId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByCategory(Guid categoryId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByCategoryAsync(categoryId, top);
            return Ok(books);
        }


        [AllowAnonymous]
        [HttpGet("by-author/{authorId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByAuthor(Guid authorId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByAuthorAsync(authorId, top);
            return Ok(books);
        }

        [AllowAnonymous]
        [HttpGet("by-publisher/{publisherId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetByPublisher(Guid publisherId, [FromQuery] int top = 10)
        {
            var books = await _bookService.GetByPublisherAsync(publisherId, top);
            return Ok(books);
        }


        [AllowAnonymous]
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<BookDto>>> Search([FromQuery] string searchTerm, [FromQuery] int top = 20)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống" });

            var books = await _bookService.SearchAsync(searchTerm, top);
            return Ok(books);
        }

        #endregion

        #region CRUD Operations

        [Authorize]
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(BookDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BookDetailDto>> Create([FromBody] CreateBookDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }

            try
            {
                var createdBook = await _bookService.AddAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdBook.Id }, createdBook);
            }
            catch (Shared.Exceptions.ValidationException ex)
            {
                return BadRequest(new { message = "Lỗi validation", errors = ex.Errors });
            }
            catch (Shared.Exceptions.NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Shared.Exceptions.UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Có lỗi xảy ra khi tạo sách", details = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
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

        [Authorize]
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _bookService.DeleteAsync(id);
                if (!result)
                    return NotFound(new { message = $"Không tìm thấy sách với ID: {id}" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Có lỗi xảy ra khi xóa sách", details = ex.Message });
            }
        }

        #endregion

        #region Partial Update Operations

        [HttpPatch("{id:guid}/price")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdatePrice(Guid id, [FromBody] UpdateBookPriceDto dto)
        {
            try
            {
                var result = await _bookService.UpdatePriceAsync(id, dto);
                return Ok(new { message = "Cập nhật giá thành công", success = result });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Có lỗi xảy ra khi cập nhật giá", details = ex.Message });
            }
        }

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

        #endregion

        #region Utility Methods

        [HttpGet("check-isbn")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<object>> CheckISBN([FromQuery] string isbn, [FromQuery] Guid? excludeBookId = null)
        {
            if (string.IsNullOrWhiteSpace(isbn))
                return BadRequest(new { message = "ISBN không được để trống" });

            var exists = await _bookService.IsISBNExistsAsync(isbn, excludeBookId);
            return Ok(new { exists, isbn });
        }

        #endregion

        #region Special Lists

        [HttpGet("recommendations")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetRecommendations(
            [FromQuery] string? excludeBookIds = null,
            [FromQuery] string? categoryIds = null,
            [FromQuery] int limit = 8)
        {
            try
            {
                var excludeIds = string.IsNullOrWhiteSpace(excludeBookIds)
                    ? new List<Guid>()
                    : excludeBookIds.Split(',')
                        .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : Guid.Empty)
                        .Where(id => id != Guid.Empty)
                        .ToList();

                var catIds = string.IsNullOrWhiteSpace(categoryIds)
                    ? new List<Guid>()
                    : categoryIds.Split(',')
                        .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : Guid.Empty)
                        .Where(id => id != Guid.Empty)
                        .ToList();

                var recommendations = await _bookService.GetRecommendationsAsync(excludeIds, catIds, limit);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Có lỗi xảy ra khi lấy gợi ý sách", details = ex.Message });
            }
        }

        [HttpGet("best-selling")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBestSelling([FromQuery] int top = 10)
        {
            var books = await _bookService.GetBestSellingBooksAsync(top);
            return Ok(books);
        }

        [HttpGet("newest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetNewest([FromQuery] int top = 10)
        {
            var books = await _bookService.GetNewestBooksAsync(top);
            return Ok(books);
        }

        [HttpGet("most-viewed")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetMostViewed([FromQuery] int top = 10)
        {
            var books = await _bookService.GetMostViewedBooksAsync(top);
            return Ok(books);
        }

        #endregion
    }
}