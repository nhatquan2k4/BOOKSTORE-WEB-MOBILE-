using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;
using BookStore.Infrastructure.Data;

namespace BookStore.Infrastructure.Repository.Catalog
{
    public class BookFileRepository : GenericRepository<BookFile>, IBookFileRepository
    {
        public BookFileRepository(AppDbContext context) : base(context)
        {
        }
    }
}
