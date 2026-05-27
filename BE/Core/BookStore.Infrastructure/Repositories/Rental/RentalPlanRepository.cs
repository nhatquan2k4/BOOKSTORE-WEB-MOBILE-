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

        public async Task<IEnumerable<RentalPlan>> GetActiveRentalPlansByTypeAsync(string planType)
        {
            var normalizedPlanType = planType.Trim().ToLower();

            return await _context.RentalPlans
                .Where(rp => rp.IsActive && rp.PlanType.ToLower() == normalizedPlanType)
                .OrderBy(rp => rp.DurationDays)
                .ToListAsync();
        }

        public async Task<RentalPlan?> GetByNameAsync(string name)
        {
            return await _context.RentalPlans
                .FirstOrDefaultAsync(rp => rp.Name == name);
        }

        public async Task<RentalPlan?> GetByDurationDaysAsync(int durationDays)
        {
            return await _context.RentalPlans
                .OrderByDescending(rp => rp.IsActive)
                .FirstOrDefaultAsync(rp => rp.DurationDays == durationDays);
        }

        public async Task<RentalPlan?> GetDefaultAsync()
        {
            return await _context.RentalPlans
                .OrderByDescending(rp => rp.IsActive)
                .ThenBy(rp => rp.DurationDays)
                .FirstOrDefaultAsync();
        }
    }
}
