using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.IService.Identity.User;
using BookStore.Application.IService;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
// Thêm namespace để xử lý File và Path
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;

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
        private readonly IMinIOService _minioService;
        private readonly ILogger<UserProfileController> _logger;

        public UserProfileController(
            IUserService userService,
            IUserProfileService userProfileService,
            IUserAddressService userAddressService,
            IMinIOService minioService,
            ILogger<UserProfileController> logger)
        {
            _userService = userService;
            _userProfileService = userProfileService;
            _userAddressService = userAddressService;
            _minioService = minioService;
            _logger = logger;
        }

        #region Profile Management

        /// Lấy thông tin profile của user hiện tại
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userProfileService.GetUserProfileByUserIdAsync(userId);
                
                if (profile == null)
                {
                    return NotFound(new { Success = false, Message = "Không tìm thấy thông tin profile" });
                }

                return Ok(new { Success = true, Data = profile });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        /// Cập nhật thông tin profile của user hiện tại
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
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        /// <summary>
        /// Upload ảnh đại diện cho user hiện tại (xóa ảnh cũ nếu có)
        /// </summary>
        [HttpPost("profile/avatar")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Không có file nào được cung cấp"
                    });
                }

                // Validate file size (max 5MB cho avatar)
                const long maxFileSize = 5 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Kích thước file vượt quá giới hạn 5MB"
                    });
                }

                // Validate file type (images only)
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Chỉ cho phép các file hình ảnh (.jpg, .jpeg, .png, .webp)"
                    });
                }

                // Lấy profile hiện tại để check ảnh cũ
                var currentProfile = await _userProfileService.GetUserProfileByUserIdAsync(userId);

                // Xóa ảnh cũ nếu có
                if (currentProfile != null && !string.IsNullOrEmpty(currentProfile.AvatarUrl))
                {
                    try
                    {
                        // Extract filename from URL (nếu là MinIO URL)
                        var oldFileName = ExtractFileNameFromUrl(currentProfile.AvatarUrl);
                        if (!string.IsNullOrEmpty(oldFileName))
                        {
                            var exists = await _minioService.FileExistsAsync(oldFileName, "user-avatars");
                            if (exists)
                            {
                                await _minioService.DeleteFileAsync(oldFileName, "user-avatars");
                                _logger.LogInformation("Đã xóa ảnh đại diện cũ: {FileName}", oldFileName);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể xóa ảnh đại diện cũ");
                        // Tiếp tục upload ảnh mới dù không xóa được ảnh cũ
                    }
                }

                // Upload ảnh mới lên MinIO
                var fileName = $"avatar_{userId}_{Guid.NewGuid()}{extension}";
                using var stream = file.OpenReadStream();
                var avatarUrl = await _minioService.UploadFileAsync(
                    fileName,
                    stream,
                    file.ContentType,
                    "user-avatars");

                _logger.LogInformation("Ảnh đại diện mới được tải lên: {FileName}", fileName);

                // Cập nhật URL ảnh vào profile
                var updateDto = new UpdateUserProfileDto
                {
                    AvatarUrl = avatarUrl
                };

                var updatedProfile = await _userProfileService.UpdateUserProfileAsync(userId, updateDto);

                return Ok(new
                {
                    Success = true,
                    Message = "Cập nhật ảnh đại diện thành công",
                    Data = new
                    {
                        AvatarUrl = avatarUrl,
                        FileName = fileName,
                        Size = file.Length
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi upload ảnh đại diện");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Lỗi khi upload ảnh đại diện",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Xóa ảnh đại diện của user hiện tại
        /// </summary>
        [HttpDelete("profile/avatar")]
        public async Task<IActionResult> DeleteAvatar()
        {
            try
            {
                var userId = GetCurrentUserId();
                var currentProfile = await _userProfileService.GetUserProfileByUserIdAsync(userId);

                if (currentProfile == null || string.IsNullOrEmpty(currentProfile.AvatarUrl))
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy ảnh đại diện"
                    });
                }

                // Xóa file từ MinIO
                var fileName = ExtractFileNameFromUrl(currentProfile.AvatarUrl);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var exists = await _minioService.FileExistsAsync(fileName, "user-avatars");
                    if (exists)
                    {
                        await _minioService.DeleteFileAsync(fileName, "user-avatars");
                    }
                }

                // Cập nhật profile (set AvatarUrl = null)
                var updateDto = new UpdateUserProfileDto
                {
                    AvatarUrl = null
                };

                await _userProfileService.UpdateUserProfileAsync(userId, updateDto);

                return Ok(new
                {
                    Success = true,
                    Message = "Đã xóa ảnh đại diện"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa ảnh đại diện");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Lỗi khi xóa ảnh đại diện",
                    Error = ex.Message
                });
            }
        }

        #endregion

        #region Address Management

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
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        [HttpGet("addresses/default")]
        public async Task<IActionResult> GetDefaultAddress()
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.GetDefaultAddressAsync(userId);

                if (address == null)
                    return NotFound(new { Success = false, Message = "Chưa có địa chỉ mặc định" });

                return Ok(new { Success = true, Data = address });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

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
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        [HttpGet("addresses/{id}")]
        public async Task<IActionResult> GetAddressById(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.GetAddressByIdAsync(id);

                if (address == null || address.UserId != userId)
                    return NotFound(new { Success = false, Message = "Không tìm thấy địa chỉ" });

                return Ok(new { Success = true, Data = address });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        [HttpPut("addresses/{id}")]
        public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] UpdateUserAddressDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var address = await _userAddressService.UpdateAddressAsync(userId, id, dto);

                if (address == null)
                    return NotFound(new { Success = false, Message = "Không tìm thấy địa chỉ" });

                return Ok(new { Success = true, Message = "Cập nhật địa chỉ thành công", Data = address });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        [HttpDelete("addresses/{id}")]
        public async Task<IActionResult> DeleteAddress(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _userAddressService.DeleteAddressAsync(userId, id);

                if (!success)
                    return NotFound(new { Success = false, Message = "Không tìm thấy địa chỉ" });

                return Ok(new { Success = true, Message = "Xóa địa chỉ thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        [HttpPut("addresses/{id}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _userAddressService.SetDefaultAddressAsync(userId, id);

                if (!success)
                    return NotFound(new { Success = false, Message = "Không tìm thấy địa chỉ" });

                return Ok(new { Success = true, Message = "Đã đặt địa chỉ mặc định" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = "Đã xảy ra lỗi", Error = ex.Message });
            }
        }

        #endregion

        #region Helper Methods


        /// Lấy userId từ JWT token của user hiện tại

        private new Guid GetCurrentUserId()
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

        /// <summary>
        /// Extract filename từ MinIO URL
        /// Ví dụ: http://localhost/storage/user-avatars/avatar_xxx.jpg -> avatar_xxx.jpg
        /// </summary>
        private string? ExtractFileNameFromUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return null;

            try
            {
                // Lấy phần sau cùng của URL (filename)
                var uri = new Uri(url);
                var segments = uri.Segments;

                // Lấy segment cuối cùng (filename)
                if (segments.Length > 0)
                {
                    var fileName = segments[segments.Length - 1];
                    return Uri.UnescapeDataString(fileName); // Decode URL encoding
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể extract filename từ URL: {Url}", url);
            }

            return null;
        }

        #endregion
    }
}