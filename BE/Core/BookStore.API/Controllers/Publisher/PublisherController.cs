using BookStore.Application.Dtos.Catalog.Publisher;
using BookStore.Application.IService.Catalog;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Publisher
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublisherController : ApiControllerBase
    {
        private readonly IPublisherService _publisherService;

        public PublisherController(IPublisherService publisherService)
        {
            _publisherService = publisherService;
        }

        /// <summary>
        /// Lấy danh sách tất cả nhà xuất bản
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PublisherDto>>> GetAll()
        {
            var publishers = await _publisherService.GetAllAsync();
            return Ok(publishers);
        }

        /// <summary>
        /// Lấy chi tiết nhà xuất bản theo ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PublisherDetailDto>> GetById(Guid id)
        {
            var publisher = await _publisherService.GetByIdAsync(id);
            if (publisher == null)
                return NotFound(new { message = $"Không tìm thấy nhà xuất bản với ID: {id}" });

            return Ok(publisher);
        }

        /// <summary>
        /// Lấy nhà xuất bản theo tên
        /// </summary>
        [HttpGet("by-name/{name}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PublisherDetailDto>> GetByName(string name)
        {
            var publisher = await _publisherService.GetByNameAsync(name);
            if (publisher == null)
                return NotFound(new { message = $"Không tìm thấy nhà xuất bản: {name}" });

            return Ok(publisher);
        }

        /// <summary>
        /// Tìm kiếm nhà xuất bản theo tên
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PublisherDto>>> Search([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống" });

            var publishers = await _publisherService.SearchByNameAsync(searchTerm);
            return Ok(publishers);
        }

        /// <summary>
        /// Tạo mới nhà xuất bản
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PublisherDetailDto>> Create([FromBody] CreatePublisherDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdPublisher = await _publisherService.AddAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdPublisher.Id }, createdPublisher);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật nhà xuất bản
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PublisherDetailDto>> Update(Guid id, [FromBody] UpdatePublisherDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID trong URL không khớp với ID trong body" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedPublisher = await _publisherService.UpdateAsync(dto);
                return Ok(updatedPublisher);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa nhà xuất bản
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _publisherService.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Không tìm thấy nhà xuất bản với ID: {id}" });

            return NoContent();
        }

        /// <summary>
        /// Kiểm tra tên nhà xuất bản đã tồn tại chưa
        /// </summary>
        [HttpGet("check-name")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> CheckNameExists([FromQuery] string name, [FromQuery] Guid? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest(new { message = "Tên không được để trống" });

            var exists = await _publisherService.IsNameExistsAsync(name, excludeId);
            return Ok(new { exists });
        }
    }
}
