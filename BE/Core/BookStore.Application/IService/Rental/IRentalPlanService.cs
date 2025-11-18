using BookStore.Application.Dtos.Rental;

namespace BookStore.Application.IService.Rental
{
    public interface IRentalPlanService
    {
        // CRUD cho Admin
        Task<IEnumerable<RentalPlanDto>> GetAllRentalPlansAsync();
        Task<IEnumerable<RentalPlanDto>> GetActiveRentalPlansAsync();
        Task<RentalPlanDto?> GetRentalPlanByIdAsync(Guid id);
        Task<RentalPlanDto> CreateRentalPlanAsync(CreateRentalPlanDto dto);
        Task<RentalPlanDto> UpdateRentalPlanAsync(UpdateRentalPlanDto dto);
        Task DeleteRentalPlanAsync(Guid id);
    }
}
