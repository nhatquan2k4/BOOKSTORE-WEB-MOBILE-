using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class BookFormatRepository : GenericRepository<BookFormat>, IBookFormatRepository
    {
        public BookFormatRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<BookFormat?> GetByFormatType(string formatType)
        {
            return await _dbSet
                .FirstOrDefaultAsync(bf => bf.FormatType == formatType);
        }

        public async Task<bool> IsFormatTypeExistsAsync(string formatType, Guid? excludeId = null)
        {
            var query = _dbSet.Where(bf => bf.FormatType == formatType);

            if (excludeId.HasValue)
            {
                query = query.Where(bf => bf.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}