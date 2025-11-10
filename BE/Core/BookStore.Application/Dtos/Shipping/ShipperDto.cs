using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Shipping
{
    // DTO for returning Shipper data
    public class ShipperDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? Email { get; set; }
        public string? VehicleNumber { get; set; }
        public bool IsActive { get; set; }
        public int TotalShipments { get; set; }
    }

    // DTO for creating new Shipper
    public class CreateShipperDto
    {
        [Required(ErrorMessage = "Tên shipper là bắt buộc")]
        [StringLength(150, ErrorMessage = "Tên shipper không được quá 150 ký tự")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [StringLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
        public string PhoneNumber { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [StringLength(150, ErrorMessage = "Email không được quá 150 ký tự")]
        public string? Email { get; set; }

        [StringLength(50, ErrorMessage = "Biển số xe không được quá 50 ký tự")]
        public string? VehicleNumber { get; set; }

        public bool IsActive { get; set; } = true;

        // Password để tạo tài khoản đăng nhập cho shipper
        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự")]
        public string Password { get; set; } = null!;
    }

    // DTO for updating Shipper
    public class UpdateShipperDto
    {
        [Required(ErrorMessage = "Tên shipper là bắt buộc")]
        [StringLength(150, ErrorMessage = "Tên shipper không được quá 150 ký tự")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [StringLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
        public string PhoneNumber { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [StringLength(150, ErrorMessage = "Email không được quá 150 ký tự")]
        public string? Email { get; set; }

        [StringLength(50, ErrorMessage = "Biển số xe không được quá 50 ký tự")]
        public string? VehicleNumber { get; set; }

        public bool IsActive { get; set; }
    }

    // DTO for Shipper list with pagination
    public class PagedShipperDto
    {
        public IEnumerable<ShipperDto> Items { get; set; } = new List<ShipperDto>();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }

    // DTO for Shipper with detailed shipments
    public class ShipperDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? Email { get; set; }
        public string? VehicleNumber { get; set; }
        public bool IsActive { get; set; }
        public int TotalShipments { get; set; }
        public List<ShipmentSummaryDto>? RecentShipments { get; set; }
    }

    // Simple DTO for Shipment summary (used in ShipperDetailDto)
    public class ShipmentSummaryDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string TrackingCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
}
