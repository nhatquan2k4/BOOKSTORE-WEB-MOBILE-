using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.IService.Catalog;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Category
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ApiControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Lấy danh sách tất cả danh mục với phân trang
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null)
        {
            var allCategories = await _categoryService.GetAllAsync();
            
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                allCategories = allCategories.Where(c => c.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }
            
            var totalCount = allCategories.Count();
            var items = allCategories
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
        /// Lấy chi tiết danh mục theo ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CategoryDetailDto>> GetById(Guid id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = $"Không tìm thấy danh mục với ID: {id}" });

            return Ok(category);
        }

        /// <summary>
        /// Lấy danh sách danh mục con theo parent ID
        /// </summary>
        [HttpGet("{parentId:guid}/subcategories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetSubCategories(Guid parentId)
        {
            var subcategories = await _categoryService.GetSubCategoriesAsync(parentId);
            return Ok(subcategories);
        }

        /// <summary>
        /// Lấy cây danh mục (hierarchical tree)
        /// </summary>
        [HttpGet("tree")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<CategoryTreeDto>>> GetTree()
        {
            var tree = await _categoryService.GetCategoryTreeAsync();
            return Ok(tree);
        }

        /// <summary>
        /// Lấy breadcrumb của danh mục
        /// </summary>
        [HttpGet("{id:guid}/breadcrumb")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<CategoryBreadcrumbDto>>> GetBreadcrumb(Guid id)
        {
            var breadcrumbs = await _categoryService.GetBreadcrumbAsync(id);
            if (breadcrumbs == null || !breadcrumbs.Any())
                return NotFound(new { message = $"Không tìm thấy danh mục với ID: {id}" });

            return Ok(breadcrumbs);
        }

        /// <summary>
        /// Tạo mới danh mục
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CategoryDetailDto>> Create([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdCategory = await _categoryService.AddAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = createdCategory.Id }, createdCategory);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật danh mục
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CategoryDetailDto>> Update(Guid id, [FromBody] UpdateCategoryDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID trong URL không khớp với ID trong body" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedCategory = await _categoryService.UpdateAsync(dto);
                return Ok(updatedCategory);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa danh mục
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _categoryService.DeleteAsync(id);
                if (!result)
                    return NotFound(new { message = $"Không tìm thấy danh mục với ID: {id}" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kiểm tra danh mục có danh mục con không
        /// </summary>
        [HttpGet("{id:guid}/has-subcategories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> HasSubCategories(Guid id)
        {
            var hasSubCategories = await _categoryService.HasSubCategoriesAsync(id);
            return Ok(new { hasSubCategories });
        }

        /// <summary>
        /// Kiểm tra danh mục có sách không
        /// </summary>
        [HttpGet("{id:guid}/has-books")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> HasBooks(Guid id)
        {
            var hasBooks = await _categoryService.HasBooksAsync(id);
            return Ok(new { hasBooks });
        }
    }
}
