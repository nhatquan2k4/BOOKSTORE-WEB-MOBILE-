using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.IService.Identity.User;
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
        // Mới thêm: Môi trường host để lấy đường dẫn lưu file
        private readonly IWebHostEnvironment _env;

        public UserProfileController(
            IUserService userService,
            IUserProfileService userProfileService,
            IUserAddressService userAddressService,
            IWebHostEnvironment env) // Inject môi trường vào đây
        {
            _userService = userService;
            _userProfileService = userProfileService;
            _userAddressService = userAddressService;
            _env = env;
        }

        #region Profile Management

        /// <summary>
        /// Upload Avatar (MỚI THÊM)
        /// </summary>
        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { Success = false, Message = "Vui lòng chọn file ảnh" });

            try
            {
                // 1. Kiểm tra đuôi file (Bảo mật: chỉ cho phép ảnh)
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLower();
                
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { Success = false, Message = "Chỉ chấp nhận file ảnh (.jpg, .png, .gif, .webp)" });
                }

                // 2. Tạo tên file độc nhất để tránh trùng lặp
                var fileName = $"{Guid.NewGuid()}{extension}";

                // 3. Xử lý đường dẫn lưu file (FIX LỖI NULL PATH Ở ĐÂY)
                // Nếu WebRootPath bị null (do chưa có folder wwwroot), ta lấy ContentRootPath + "wwwroot"
                string rootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
                
                // Đường dẫn: wwwroot/uploads/avatars
                var uploadFolder = Path.Combine(rootPath, "uploads", "avatars");
                
                // 4. Tự động tạo thư mục nếu chưa có
                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                var filePath = Path.Combine(uploadFolder, fileName);

                // 5. Lưu file xuống ổ cứng
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 6. Trả về URL tương đối để Frontend lưu vào DB
                var fileUrl = $"/uploads/avatars/{fileName}";

                return Ok(new 
                { 
                    Success = true, 
                    Message = "Upload ảnh thành công", 
                    AvatarUrl = fileUrl 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Lỗi khi upload ảnh",
                    Error = ex.Message
                });
            }
        }

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

        #endregion

        #region Address Management

        [HttpGet("addresses")]
        public async Task<IActionResult> GetMyAddresses()
        {
            try
            {
                var userId = GetCurrentUserId();
                var addresses = await _userAddressService.GetAddressesByUserIdAsync(userId);
                return Ok(new { Success = true, Data = addresses });
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

        private Guid GetCurrentUserId()
        {
            // Lấy UserID từ Token (Claim "userId" hoặc "sub" hoặc "nameidentifier")
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