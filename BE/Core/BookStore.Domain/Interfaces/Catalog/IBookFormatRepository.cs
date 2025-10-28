using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IBookFormatRepository : IGenericRepository<BookFormat>
    {
        Task<BookFormat?> GetByFormatType(string formatType);
        Task<bool> IsFormatTypeExistsAsync(string formatType, Guid? excludeId = null);
    }
}