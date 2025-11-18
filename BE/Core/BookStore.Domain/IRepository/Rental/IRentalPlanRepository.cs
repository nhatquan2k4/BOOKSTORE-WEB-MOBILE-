using BookStore.Domain.Entities.Rental;

namespace BookStore.Domain.IRepository.Rental
{
    public interface IRentalPlanRepository : IGenericRepository<RentalPlan>
    {
        /// <summary>
        /// Lấy tất cả gói thuê đang active
        /// </summary>
        Task<IEnumerable<RentalPlan>> GetActiveRentalPlansAsync();

        /// <summary>
        /// Lấy gói thuê theo tên
        /// </summary>
        Task<RentalPlan?> GetByNameAsync(string name);
    }
}
