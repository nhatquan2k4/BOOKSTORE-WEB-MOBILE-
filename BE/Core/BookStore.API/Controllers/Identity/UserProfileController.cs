using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.IService.Identity.User;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Identity
{
    /// <summary>
    /// API cho user tự quản lý profile và địa chỉ của mình
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserProfileController : ApiControllerBase
    {
        private readonly IUserService _userService;
        private readonly IUserProfileService _userProfileService;
        private readonly IUserAddressService _userAddressService;

        public UserProfileController(
            IUserService userService,
            IUserProfileService userProfileService,
            IUserAddressService userAddressService)
        {
            _userService = userService;
            _userProfileService = userProfileService;
            _userAddressService = userAddressService;
        }

        #region Profile Management

        /// <summary>
        /// Lấy thông tin profile của user hiện tại
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userProfileService.GetUserProfileByUserIdAsync(userId);
                
                if (profile == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy thông tin profile"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = profile
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
        /// Cập nhật thông tin profile của user hiện tại
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userProfileService.UpdateUserProfileAsync(userId, dto);
                
                return Ok(new
                {
                    Success = true,
                    Message = "Cập nhật thông tin thành công",
                    Data = profile
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

        #region Address Management

        /// <summary>
        /// Lấy danh sách địa chỉ của user hiện tại
        /// </summary>
        [HttpGet("addresses")]
        public async Task<IActionResult> GetMyAddresses()
        {
            try
            {
                var userId = GetCurrentUserId();
                var addresses = await _userAddressService.GetAddressesByUserIdAsync(userId);
                
                return Ok(new
                {
                    Success = true,
                    Data = addresses
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
        /// Lấy địa chỉ mặc định của user hiện tại
        /// </summary>
        [HttpGet("addresses/default")]
        public async Task<IActionResult> GetDefaultAddress()
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.GetDefaultAddressAsync(userId);
                
                if (address == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Chưa có địa chỉ mặc định"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = address
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
        /// Thêm địa chỉ mới
        /// </summary>
        [HttpPost("addresses")]
        public async Task<IActionResult> AddAddress([FromBody] CreateUserAddressDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.AddAddressAsync(userId, dto);
                
                return CreatedAtAction(nameof(GetAddressById), new { id = address.Id }, new
                {
                    Success = true,
                    Message = "Thêm địa chỉ thành công",
                    Data = address
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
        /// Lấy thông tin địa chỉ theo ID
        /// </summary>
        [HttpGet("addresses/{id}")]
        public async Task<IActionResult> GetAddressById(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.GetAddressByIdAsync(id);
                
                if (address == null || address.UserId != userId)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy địa chỉ"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = address
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
        /// Cập nhật địa chỉ
        /// </summary>
        [HttpPut("addresses/{id}")]
        public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] UpdateUserAddressDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.UpdateAddressAsync(userId, id, dto);
                
                if (address == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy địa chỉ"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Cập nhật địa chỉ thành công",
                    Data = address
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
        /// Xóa địa chỉ
        /// </summary>
        [HttpDelete("addresses/{id}")]
        public async Task<IActionResult> DeleteAddress(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _userAddressService.DeleteAddressAsync(userId, id);
                
                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy địa chỉ"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Xóa địa chỉ thành công"
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
        /// Đặt địa chỉ mặc định
        /// </summary>
        [HttpPut("addresses/{id}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _userAddressService.SetDefaultAddressAsync(userId, id);
                
                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy địa chỉ"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Đã đặt địa chỉ mặc định"
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

        #region Helper Methods

        /// <summary>
        /// Lấy userId từ JWT token của user hiện tại
        /// </summary>
        private Guid GetCurrentUserId()
        {
            // Thử tìm claim "userId" hoặc "sub" (standard JWT claim)
            var userIdClaim = User.FindFirst("userId")?.Value 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Token không hợp lệ hoặc không chứa userId");
            }
            
            return userId;
        }

        #endregion
    }
}
