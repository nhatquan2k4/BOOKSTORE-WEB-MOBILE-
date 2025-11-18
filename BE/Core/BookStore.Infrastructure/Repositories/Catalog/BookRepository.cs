using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class BookRepository : GenericRepository<Book>, IBookRepository
    {
        public BookRepository(AppDbContext context) : base(context)
        {
        }

        // Override GetAllAsync to include related entities
        // NOTE: Removed Reviews Include to avoid schema issues
        public override async Task<IEnumerable<Book>> GetAllAsync()
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories)
                    .ThenInclude(bc => bc.Category)
                .Include(b => b.Prices)
                .Include(b => b.StockItem)
                .ToListAsync();
        }

        public async Task<Book?> GetByISBNAsync(string isbn)
        {
            return await _dbSet
                .FirstOrDefaultAsync(b => b.ISBN.Value == isbn);
        }


        public async Task<Book?> GetDetailByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories)
                    .ThenInclude(bc => bc.Category)
                .Include(b => b.Images)
                .Include(b => b.Files)
                .Include(b => b.Metadata)
                .Include(b => b.Prices)
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Book>> SearchAsync(string searchTerm)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Where(b => b.Title.Contains(searchTerm) ||
                           b.Description!.Contains(searchTerm) ||
                           b.BookAuthors.Any(ba => ba.Author.Name.Contains(searchTerm)))
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByCategoryAsync(Guid categoryId)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories)
                    .ThenInclude(bc => bc.Category)
                .Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId))
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByAuthorAsync(Guid authorId)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId))
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByPublisherAsync(Guid publisherId)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Where(b => b.PublisherId == publisherId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetLatestBooksAsync(int count)
        {
            return await _dbSet
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .OrderByDescending(b => b.PublicationYear)
                .Take(count)
                .ToListAsync();
        }

        public async Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeId = null)
        {
            var query = _dbSet.Where(b => b.ISBN.Value == isbn);

            if (excludeId.HasValue)
            {
                query = query.Where(b => b.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}