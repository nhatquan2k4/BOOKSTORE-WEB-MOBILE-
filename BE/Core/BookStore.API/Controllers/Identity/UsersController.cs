using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.IService.Identity.User;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ApiControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }


        /// Lấy danh sách tất cả users

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return Ok(new
                {
                    Success = true,
                    Data = users
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


        /// Lấy users với phân trang và tìm kiếm

        [HttpGet("paged")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null)
        {
            try
            {
                var (users, totalCount) = await _userService.GetPagedUsersAsync(pageNumber, pageSize, searchTerm);
                return Ok(new
                {
                    Success = true,
                    Data = users,
                    TotalCount = totalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize
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


        /// Lấy user theo ID

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var user = await _userService.GetByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = user
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


        /// Lấy user theo email

        [HttpGet("by-email/{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = user
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


        /// Tạo user mới

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var user = await _userService.AddAsync(createUserDto);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, new
                {
                    Success = true,
                    Message = "Tạo user thành công",
                    Data = user
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
                    Message = "Đã xảy ra lỗi khi tạo user",
                    Error = ex.Message
                });
            }
        }


        /// Xóa user

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var success = await _userService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Xóa user thành công"
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


        /// Kích hoạt user

        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Activate(Guid id)
        {
            try
            {
                var success = await _userService.ActivateUserAsync(id);
                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Kích hoạt user thành công"
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


        /// Vô hiệu hóa user

        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            try
            {
                var success = await _userService.DeactivateUserAsync(id);
                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Vô hiệu hóa user thành công"
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


        /// Lấy roles của user

        [HttpGet("{id}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserRoles(Guid id)
        {
            try
            {
                var roles = await _userService.GetUserRolesAsync(id);
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


        /// Gán role cho user

        [HttpPost("{userId}/roles/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole(Guid userId, Guid roleId)
        {
            try
            {
                var success = await _userService.AssignRoleToUserAsync(userId, roleId);
                if (!success)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không thể gán role cho user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Gán role thành công"
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


        /// Xóa role khỏi user

        [HttpDelete("{userId}/roles/{roleId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveRole(Guid userId, Guid roleId)
        {
            try
            {
                var success = await _userService.RemoveRoleFromUserAsync(userId, roleId);
                if (!success)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không thể xóa role khỏi user"
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


        /// Gán nhiều roles cho user

        [HttpPost("{userId}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRoles(Guid userId, [FromBody] List<Guid> roleIds)
        {
            try
            {
                var success = await _userService.AssignRolesToUserAsync(userId, roleIds);
                if (!success)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không thể gán roles cho user"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Gán roles thành công"
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


        /// Lấy permissions của user

        [HttpGet("{id}/permissions")]
        public async Task<IActionResult> GetUserPermissions(Guid id)
        {
            try
            {
                var permissions = await _userService.GetUserPermissionsAsync(id);
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


        /// Kiểm tra email đã tồn tại

        [HttpGet("check-email/{email}")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckEmailExists(string email)
        {
            try
            {
                var exists = await _userService.EmailExistsAsync(email);
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
