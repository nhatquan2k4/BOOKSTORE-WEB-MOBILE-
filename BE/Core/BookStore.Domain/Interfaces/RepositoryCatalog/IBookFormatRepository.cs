using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IBookFormatRepository : IGenericRepository<BookFormat>
    {
        Task<BookFormat?> GetByFormatType(string formatType);
        Task<bool> IsFormatTypeExistsAsync(string formatType, Guid? excludeId = null);
    }
}