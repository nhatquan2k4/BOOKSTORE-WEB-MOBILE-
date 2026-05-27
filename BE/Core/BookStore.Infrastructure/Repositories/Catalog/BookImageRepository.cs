using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class BookImageRepository : GenericRepository<BookImage>, IBookImageRepository
    {
        public BookImageRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<BookImage>> GetAllOrderedAsync()
        {
            return await _dbSet
                .OrderBy(bi => bi.BookId)
                .ThenBy(bi => bi.DisplayOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<BookImage>> GetByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(bi => bi.BookId == bookId)
                .OrderBy(bi => bi.DisplayOrder)
                .ToListAsync();
        }

        public async Task<BookImage?> GetCoverByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(bi => bi.BookId == bookId && bi.IsCover)
                .OrderBy(bi => bi.DisplayOrder)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetMaxDisplayOrderAsync(Guid bookId)
        {
            return await _dbSet
                .Where(bi => bi.BookId == bookId)
                .Select(bi => (int?)bi.DisplayOrder)
                .MaxAsync() ?? -1;
        }

        public async Task DeleteByBookIdAsync(Guid bookId)
        {
            var images = await _dbSet
                .Where(bi => bi.BookId == bookId)
                .ToListAsync();

            _dbSet.RemoveRange(images);
        }
    }
}
