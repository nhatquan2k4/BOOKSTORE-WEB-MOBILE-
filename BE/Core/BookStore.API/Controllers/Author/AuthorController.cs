using BookStore.API.Base;
using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.IService.Catalog;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Author
{
    public class AuthorController : ApiControllerBase
    {
        private readonly IAuthorService _authorService;

        public AuthorController(IAuthorService authorService)
        {
            _authorService = authorService;
        }

        /// <summary>
        /// Lấy danh sách tất cả tác giả với phân trang
        /// </summary>
        /// <returns>Danh sách AuthorDto có phân trang</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null)
        {
            var allAuthors = string.IsNullOrWhiteSpace(searchTerm) 
                ? await _authorService.GetAllAsync()
                : await _authorService.SearchByNameAsync(searchTerm);
            
            var totalCount = allAuthors.Count();
            var items = allAuthors
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            
            return Ok(new
            {
                items,
                totalCount,
                pageNumber,
                pageSize
            });
        }

        /// <summary>
        /// Lấy chi tiết tác giả theo ID
        /// </summary>
        /// <param name="id">ID của tác giả</param>
        /// <returns>AuthorDetailDto</returns>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AuthorDetailDto>> GetById(Guid id)
        {
            var author = await _authorService.GetByIdAsync(id);
            if (author == null)
                return NotFound(new { message = $"Không tìm thấy tác giả với ID: {id}" });

            return Ok(author);
        }

        /// <summary>
        /// Lấy tác giả theo tên
        /// </summary>
        /// <param name="name">Tên tác giả</param>
        /// <returns>AuthorDetailDto</returns>
        [HttpGet("by-name/{name}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AuthorDetailDto>> GetByName(string name)
        {
            var author = await _authorService.GetByNameAsync(name);
            if (author == null)
                return NotFound(new { message = $"Không tìm thấy tác giả: {name}" });

            return Ok(author);
        }

        /// <summary>
        /// Tìm kiếm tác giả theo tên
        /// </summary>
        /// <param name="searchTerm">Từ khóa tìm kiếm</param>
        /// <returns>Danh sách AuthorDto</returns>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<AuthorDto>>> Search([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống" });

            var authors = await _authorService.SearchByNameAsync(searchTerm);
            return Ok(authors);
        }

        /// <summary>
        /// Tạo mới tác giả
        /// </summary>
        /// <param name="dto">Thông tin tác giả</param>
        /// <returns>AuthorDetailDto đã được tạo</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AuthorDetailDto>> Create([FromBody] CreateAuthorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdAuthor = await _authorService.AddAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdAuthor.Id }, createdAuthor);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin tác giả
        /// </summary>
        /// <param name="id">ID của tác giả</param>
        /// <param name="dto">Thông tin cập nhật</param>
        /// <returns>AuthorDetailDto đã được cập nhật</returns>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AuthorDetailDto>> Update(Guid id, [FromBody] UpdateAuthorDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID trong URL không khớp với ID trong body" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedAuthor = await _authorService.UpdateAsync(dto);
                return Ok(updatedAuthor);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa tác giả
        /// </summary>
        /// <param name="id">ID của tác giả</param>
        /// <returns>NoContent nếu thành công</returns>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _authorService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Không tìm thấy tác giả với ID: {id}" });

            return NoContent();
        }

        /// <summary>
        /// Kiểm tra tên tác giả đã tồn tại chưa
        /// </summary>
        /// <param name="name">Tên tác giả</param>
        /// <param name="excludeId">ID tác giả cần loại trừ (dùng khi update)</param>
        /// <returns>True nếu đã tồn tại</returns>
        [HttpGet("check-name")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> CheckNameExists([FromQuery] string name, [FromQuery] Guid? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "Tên không được để trống" });

            var exists = await _authorService.IsNameExistsAsync(name, excludeId);
            return Ok(new { exists });
        }
    }
}
