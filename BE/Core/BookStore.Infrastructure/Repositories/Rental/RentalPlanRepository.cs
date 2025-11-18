using BookStore.Domain.Entities.Rental;
using BookStore.Domain.IRepository.Rental;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Rental
{
    public class RentalPlanRepository : GenericRepository<RentalPlan>, IRentalPlanRepository
    {
        public RentalPlanRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<RentalPlan>> GetActiveRentalPlansAsync()
        {
            return await _context.RentalPlans
                .Where(rp => rp.IsActive)
                .OrderBy(rp => rp.DurationDays)
                .ToListAsync();
        }

        public async Task<RentalPlan?> GetByNameAsync(string name)
        {
            return await _context.RentalPlans
                .FirstOrDefaultAsync(rp => rp.Name == name);
        }
    }
}
