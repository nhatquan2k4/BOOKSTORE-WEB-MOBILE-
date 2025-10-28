using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IBookFileRepository : IGenericRepository<BookFile>
    {
    }
}