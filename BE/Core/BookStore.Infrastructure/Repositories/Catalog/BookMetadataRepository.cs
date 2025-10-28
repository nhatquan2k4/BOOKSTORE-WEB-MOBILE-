using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class BookMetadataRepository : GenericRepository<BookMetadata>, IBookMetadataRepository
    {
        public BookMetadataRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<BookMetadata>> GetByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(bm => bm.BookId == bookId)
                .ToListAsync();
        }

        public async Task DeleteByBookIdAsync(Guid bookId)
        {
            var metadata = await _dbSet
                .Where(bm => bm.BookId == bookId)
                .ToListAsync();

            _dbSet.RemoveRange(metadata);
        }
    }
}