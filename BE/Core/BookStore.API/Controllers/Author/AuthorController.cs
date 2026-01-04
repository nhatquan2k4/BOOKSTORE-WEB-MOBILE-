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

        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<AuthorDto>>> Search([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống" });

            var authors = await _authorService.SearchByNameAsync(searchTerm);
            return Ok(authors);
        }


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
