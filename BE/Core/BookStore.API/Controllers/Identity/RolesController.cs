using BookStore.Application.Dtos.Identity.Role;
using BookStore.Application.IService.Identity.Role;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")]
    public class RolesController : ApiControllerBase
    {
        private readonly IRoleService _roleService;

        public RolesController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        #region Query Methods

        /// Lấy danh sách tất cả roles

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


        /// Lấy roles với phân trang và tìm kiếm

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


        /// Lấy role theo ID

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


        /// Lấy role theo tên

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


        /// Lấy role với permissions

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

        #endregion

        #region Create Operations

        /// Tạo role mới

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

        #endregion

        #region Delete Operations

        /// Xóa role

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

        #endregion

        #region Permission Management

        /// Lấy permissions của role

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


        /// Gán permissions cho role

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


        /// Xóa permission khỏi role

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

        #endregion

        #region Utility Methods

        /// Kiểm tra tên role đã tồn tại

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

        #endregion
    }
}
