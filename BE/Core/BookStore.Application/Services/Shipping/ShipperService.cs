using BookStore.Application.Dtos.Shipping;
using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.IService.Shipping;
using BookStore.Application.Mappers.Shipping;
using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Shipping;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Shipping
{
    public class ShipperService : IShipperService
    {
        private readonly IShipperRepository _shipperRepository;
        private readonly IAuthService _authService;
        private readonly ILogger<ShipperService> _logger;

        public ShipperService(
            IShipperRepository shipperRepository,
            IAuthService authService,
            ILogger<ShipperService> logger)
        {
            _shipperRepository = shipperRepository;
            _authService = authService;
            _logger = logger;
        }

        #region CRUD Operations

        public async Task<ShipperDto> CreateShipperAsync(CreateShipperDto dto)
        {
            // Validate phone number uniqueness
            var phoneExists = await _shipperRepository.IsPhoneNumberExistsAsync(dto.PhoneNumber);
            Guard.Against(phoneExists, $"Số điện thoại {dto.PhoneNumber} đã được sử dụng");

            // Validate email uniqueness if provided
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailExists = await _shipperRepository.IsEmailExistsAsync(dto.Email);
                Guard.Against(emailExists, $"Email {dto.Email} đã được sử dụng");
            }

            // Create User account with "Shipper" role
            string email = dto.Email ?? $"{dto.PhoneNumber}@shipper.bookstore.com"; // Auto-generate email if not provided
            Guid userId;
            try
            {
                userId = await _authService.CreateUserAccountAsync(
                    email: email,
                    password: dto.Password,
                    fullName: dto.Name,
                    phoneNumber: dto.PhoneNumber,
                    roleName: "Shipper"
                );
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Không thể tạo tài khoản đăng nhập: {ex.Message}");
            }

            // Create Shipper entity
            var shipper = dto.ToEntity();
            shipper.UserId = userId; // Link shipper với user account

            await _shipperRepository.AddAsync(shipper);
            await _shipperRepository.SaveChangesAsync();

            _logger.LogInformation($"Created new shipper: {shipper.Name} (ID: {shipper.Id}) with User account (UserID: {userId})");

            return shipper.ToDto();
        }

        public async Task<ShipperDto?> GetShipperByIdAsync(Guid id)
        {
            var shipper = await _shipperRepository.GetByIdAsync(id);
            return shipper?.ToDto();
        }

        public async Task<ShipperDetailDto?> GetShipperDetailByIdAsync(Guid id)
        {
            var shipper = await _shipperRepository.GetShipperWithShipmentsAsync(id);
            return shipper?.ToDetailDto();
        }

        public async Task<ShipperDto> UpdateShipperAsync(Guid id, UpdateShipperDto dto)
        {
            var shipper = await _shipperRepository.GetByIdAsync(id);
            Guard.Against(shipper == null, "Không tìm thấy shipper");

            // Validate phone number uniqueness (excluding current shipper)
            var phoneExists = await _shipperRepository.IsPhoneNumberExistsAsync(dto.PhoneNumber, id);
            Guard.Against(phoneExists, $"Số điện thoại {dto.PhoneNumber} đã được sử dụng");

            // Validate email uniqueness if provided (excluding current shipper)
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailExists = await _shipperRepository.IsEmailExistsAsync(dto.Email, id);
                Guard.Against(emailExists, $"Email {dto.Email} đã được sử dụng");
            }

            shipper!.UpdateFromDto(dto);
            _shipperRepository.Update(shipper);
            await _shipperRepository.SaveChangesAsync();

            _logger.LogInformation($"Updated shipper: {shipper.Name} (ID: {shipper.Id})");

            return shipper.ToDto();
        }

        public async Task<bool> DeleteShipperAsync(Guid id)
        {
            var shipper = await _shipperRepository.GetByIdAsync(id);
            if (shipper == null)
                return false;

            // Check if shipper has any shipments
            var shipmentCount = await _shipperRepository.GetShipmentCountAsync(id);
            Guard.Against(shipmentCount > 0,
                $"Không thể xóa shipper vì đã có {shipmentCount} đơn hàng được giao bởi shipper này. Hãy deactivate thay vì xóa.");

            _shipperRepository.Delete(shipper!);
            await _shipperRepository.SaveChangesAsync();

            _logger.LogInformation($"Deleted shipper: {shipper.Name} (ID: {shipper.Id})");

            return true;
        }

        #endregion

        #region Query Operations

        public async Task<IEnumerable<ShipperDto>> GetAllShippersAsync()
        {
            var shippers = await _shipperRepository.GetAllAsync();
            return shippers.Select(s => s.ToDto());
        }

        public async Task<IEnumerable<ShipperDto>> GetActiveShippersAsync()
        {
            var shippers = await _shipperRepository.GetActiveShippersAsync();
            return shippers.Select(s => s.ToDto());
        }

        public async Task<PagedShipperDto> GetPagedShippersAsync(
            int pageNumber,
            int pageSize,
            bool? isActive = null,
            string? searchTerm = null)
        {
            Guard.Against(pageNumber < 1, "Page number phải lớn hơn 0");
            Guard.Against(pageSize < 1 || pageSize > 100, "Page size phải từ 1 đến 100");

            var (items, totalCount) = await _shipperRepository.GetPagedShippersAsync(
                pageNumber, pageSize, isActive, searchTerm);

            return items.ToPagedDto(pageNumber, pageSize, totalCount);
        }

        #endregion

        #region Business Logic

        public async Task<bool> ActivateShipperAsync(Guid id)
        {
            var shipper = await _shipperRepository.GetByIdAsync(id);
            if (shipper == null)
                return false;

            if (shipper.IsActive)
                return true; // Already active

            await _shipperRepository.SetShipperStatusAsync(id, true);
            await _shipperRepository.SaveChangesAsync();

            _logger.LogInformation($"Activated shipper: {shipper.Name} (ID: {shipper.Id})");

            return true;
        }

        public async Task<bool> DeactivateShipperAsync(Guid id)
        {
            var shipper = await _shipperRepository.GetByIdAsync(id);
            if (shipper == null)
                return false;

            if (!shipper.IsActive)
                return true; // Already inactive

            await _shipperRepository.SetShipperStatusAsync(id, false);
            await _shipperRepository.SaveChangesAsync();

            _logger.LogInformation($"Deactivated shipper: {shipper.Name} (ID: {shipper.Id})");

            return true;
        }

        public async Task<bool> IsPhoneNumberAvailableAsync(string phoneNumber, Guid? excludeShipperId = null)
        {
            var exists = await _shipperRepository.IsPhoneNumberExistsAsync(phoneNumber, excludeShipperId);
            return !exists;
        }

        public async Task<bool> IsEmailAvailableAsync(string email, Guid? excludeShipperId = null)
        {
            if (string.IsNullOrWhiteSpace(email))
                return true;

            var exists = await _shipperRepository.IsEmailExistsAsync(email, excludeShipperId);
            return !exists;
        }

        public async Task<int> GetShipmentCountAsync(Guid shipperId)
        {
            return await _shipperRepository.GetShipmentCountAsync(shipperId);
        }

        public async Task<ShipperDto?> GetShipperByUserIdAsync(Guid userId)
        {
            var shipper = await _shipperRepository.GetByUserIdAsync(userId);
            return shipper?.ToDto();
        }

        #endregion
    }
}
