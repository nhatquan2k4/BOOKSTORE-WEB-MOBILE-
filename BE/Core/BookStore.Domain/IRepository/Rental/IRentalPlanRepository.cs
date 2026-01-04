using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IRentalPlanRepository : IGenericRepository<RentalPlan>
    {

        Task<IEnumerable<RentalPlan>> GetActiveRentalPlansAsync();


        Task<RentalPlan?> GetByNameAsync(string name);
    }
}
