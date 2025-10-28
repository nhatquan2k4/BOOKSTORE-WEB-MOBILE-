using BookStore.Application.Dtos.Identity.Role;
using BookStore.Application.IService.Identity.Role;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        /// <summary>
        /// Lấy danh sách tất cả roles
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var roles = await _roleService.GetAllAsync();
                return Ok(new
                {
                    Success = true,
                    Data = roles
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy roles với phân trang và tìm kiếm
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? search = null)
        {
            try
            {
                var (roles, totalCount) = await _roleService.GetPagedRolesAsync(page, size, search);
                return Ok(new
                {
                    Success = true,
                    Data = roles,
                    TotalCount = totalCount,
                    Page = page,
                    Size = size
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy role theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var role = await _roleService.GetByIdAsync(id);
                if (role == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy role"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy role theo tên
        /// </summary>
        [HttpGet("by-name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            try
            {
                var role = await _roleService.GetRoleByNameAsync(name);
                if (role == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy role"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy role với permissions
        /// </summary>
        [HttpGet("{id}/with-permissions")]
        public async Task<IActionResult> GetWithPermissions(Guid id)
        {
            try
            {
                var role = await _roleService.GetRoleWithPermissionsAsync(id);
                if (role == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy role"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Tạo role mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoleDto createRoleDto)
        {
            try
            {
                var role = await _roleService.AddAsync(createRoleDto);
                return CreatedAtAction(nameof(GetById), new { id = role.Id }, new
                {
                    Success = true,
                    Message = "Tạo role thành công",
                    Data = role
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi tạo role",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Xóa role
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var success = await _roleService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy role"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Xóa role thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy permissions của role
        /// </summary>
        [HttpGet("{id}/permissions")]
        public async Task<IActionResult> GetRolePermissions(Guid id)
        {
            try
            {
                var permissions = await _roleService.GetRolePermissionsAsync(id);
                return Ok(new
                {
                    Success = true,
                    Data = permissions
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Gán permissions cho role
        /// </summary>
        [HttpPost("{roleId}/permissions")]
        public async Task<IActionResult> AssignPermissions(Guid roleId, [FromBody] List<Guid> permissionIds)
        {
            try
            {
                var success = await _roleService.AssignPermissionsToRoleAsync(roleId, permissionIds);
                if (!success)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không thể gán permissions cho role"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Gán permissions thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Xóa permission khỏi role
        /// </summary>
        [HttpDelete("{roleId}/permissions/{permissionId}")]
        public async Task<IActionResult> RemovePermission(Guid roleId, Guid permissionId)
        {
            try
            {
                var success = await _roleService.RemovePermissionFromRoleAsync(roleId, permissionId);
                if (!success)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không thể xóa permission khỏi role"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Xóa permission thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Kiểm tra tên role đã tồn tại
        /// </summary>
        [HttpGet("check-name/{name}")]
        public async Task<IActionResult> CheckNameExists(string name)
        {
            try
            {
                var exists = await _roleService.RoleNameExistsAsync(name);
                return Ok(new
                {
                    Success = true,
                    Exists = exists
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }
    }
}
