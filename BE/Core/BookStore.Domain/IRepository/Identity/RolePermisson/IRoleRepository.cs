using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.RolePermisson
{
    public interface IRoleRepository : IGenericRepository<Role>
    {
        Task<Role?> GetByNameAsync(string name);

        Task<Role?> GetByIdWithPermissionsAsync(Guid id);

        Task<IEnumerable<Role>> GetRolesByUserIdAsync(Guid userId);

        Task<bool> ExistsByNameAsync(string name);

        Task<(IEnumerable<Role> Roles, int TotalCount)> GetPagedAsync(
            int page, 
            int size, 
            string? search = null);
    }
}
