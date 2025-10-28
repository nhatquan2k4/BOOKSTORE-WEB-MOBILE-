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

        public async Task<IEnumerable<BookImage>> GetByBookIdAsync(Guid bookId)
        {
            return await _dbSet
                .Where(bi => bi.BookId == bookId)
                .ToListAsync();
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