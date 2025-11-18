using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService.Rental;
using BookStore.Application.Mappers.Rental;
using BookStore.Domain.IRepository.Rental;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Rental
{
    public class RentalPlanService : IRentalPlanService
    {
        private readonly IRentalPlanRepository _rentalPlanRepository;
        private readonly ILogger<RentalPlanService> _logger;

        public RentalPlanService(
            IRentalPlanRepository rentalPlanRepository,
            ILogger<RentalPlanService> logger)
        {
            _rentalPlanRepository = rentalPlanRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<RentalPlanDto>> GetAllRentalPlansAsync()
        {
            var plans = await _rentalPlanRepository.GetAllAsync();
            return plans.Select(p => p.ToDto());
        }

        public async Task<IEnumerable<RentalPlanDto>> GetActiveRentalPlansAsync()
        {
            var plans = await _rentalPlanRepository.GetActiveRentalPlansAsync();
            return plans.Select(p => p.ToDto());
        }

        public async Task<RentalPlanDto?> GetRentalPlanByIdAsync(Guid id)
        {
            var plan = await _rentalPlanRepository.GetByIdAsync(id);
            return plan?.ToDto();
        }

        public async Task<RentalPlanDto> CreateRentalPlanAsync(CreateRentalPlanDto dto)
        {
            // Validate
            Guard.Against(string.IsNullOrWhiteSpace(dto.Name), "Tên gói thuê không được để trống");
            Guard.Against(dto.Price <= 0, "Giá gói thuê phải lớn hơn 0");
            Guard.Against(dto.DurationDays <= 0, "Thời hạn gói thuê phải lớn hơn 0");

            // Check duplicate name
            var existingPlan = await _rentalPlanRepository.GetByNameAsync(dto.Name);
            Guard.Against(existingPlan != null, $"Gói thuê với tên '{dto.Name}' đã tồn tại");

            var entity = dto.ToEntity();
            await _rentalPlanRepository.AddAsync(entity);
            await _rentalPlanRepository.SaveChangesAsync();

            _logger.LogInformation($"Created rental plan: {entity.Name} (ID: {entity.Id})");
            return entity.ToDto();
        }

        public async Task<RentalPlanDto> UpdateRentalPlanAsync(UpdateRentalPlanDto dto)
        {
            var entity = await _rentalPlanRepository.GetByIdAsync(dto.Id);
            Guard.Against(entity == null, "Không tìm thấy gói thuê");

            // Check duplicate name (nếu đổi tên)
            if (entity!.Name != dto.Name)
            {
                var existingPlan = await _rentalPlanRepository.GetByNameAsync(dto.Name);
                Guard.Against(existingPlan != null, $"Gói thuê với tên '{dto.Name}' đã tồn tại");
            }

            entity.UpdateEntity(dto);
            _rentalPlanRepository.Update(entity);
            await _rentalPlanRepository.SaveChangesAsync();

            _logger.LogInformation($"Updated rental plan: {entity.Name} (ID: {entity.Id})");
            return entity.ToDto();
        }

        public async Task DeleteRentalPlanAsync(Guid id)
        {
            var entity = await _rentalPlanRepository.GetByIdAsync(id);
            Guard.Against(entity == null, "Không tìm thấy gói thuê");

            var planName = entity!.Name;
            _rentalPlanRepository.Delete(entity);
            await _rentalPlanRepository.SaveChangesAsync();

            _logger.LogInformation($"Deleted rental plan: {planName} (ID: {id})");
        }
    }
}
