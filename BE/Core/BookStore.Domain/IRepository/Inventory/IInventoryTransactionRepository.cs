using BookStore.Domain.Entities.Pricing___Inventory;

namespace BookStore.Domain.IRepository.Inventory
{
    public interface IInventoryTransactionRepository : IGenericRepository<InventoryTransaction>
    {
        Task<IEnumerable<InventoryTransaction>> GetByWarehouseIdAsync(Guid warehouseId, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<InventoryTransaction>> GetByBookIdAsync(Guid bookId, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<InventoryTransaction>> GetByWarehouseAndBookAsync(Guid warehouseId, Guid bookId, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<InventoryTransaction>> GetByTypeAsync(InventoryTransactionType type, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<InventoryTransaction>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<InventoryTransaction>> GetFilteredAsync(
            Guid? warehouseId = null,
            Guid? bookId = null,
            InventoryTransactionType? type = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            int pageNumber = 1,
            int pageSize = 20);
        Task<int> GetTotalCountAsync(
            Guid? warehouseId = null,
            Guid? bookId = null,
            InventoryTransactionType? type = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);
        Task<InventoryTransaction> CreateTransactionAsync(
            Guid warehouseId,
            Guid bookId,
            InventoryTransactionType type,
            int quantityChange,
            string? referenceId = null,
            string? note = null);
    }
}
