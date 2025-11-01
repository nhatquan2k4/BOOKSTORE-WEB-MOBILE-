namespace BookStore.Domain.IRepository.Identity
{
    public interface IManyToManyRepository<TEntity> where TEntity : class
    {
        Task<IEnumerable<TEntity>> GetByLeftKeyAsync(Guid leftId);

        Task<IEnumerable<TEntity>> GetByRightKeyAsync(Guid rightId);

        Task AddAsync(TEntity entity);

        Task AddRangeAsync(IEnumerable<TEntity> entities);

        Task RemoveAsync(Guid leftId, Guid rightId);

        Task RemoveAllByLeftKeyAsync(Guid leftId);

        Task<bool> ExistsAsync(Guid leftId, Guid rightId);

        Task SaveChangesAsync();
    }
}
