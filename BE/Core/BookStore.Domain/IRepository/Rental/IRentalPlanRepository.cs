using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IRentalPlanRepository : IGenericRepository<RentalPlan>
    {

        Task<IEnumerable<RentalPlan>> GetActiveRentalPlansAsync();
        Task<IEnumerable<RentalPlan>> GetActiveRentalPlansByTypeAsync(string planType);


        Task<RentalPlan?> GetByNameAsync(string name);
        Task<RentalPlan?> GetByDurationDaysAsync(int durationDays);
        Task<RentalPlan?> GetDefaultAsync();
    }
}
