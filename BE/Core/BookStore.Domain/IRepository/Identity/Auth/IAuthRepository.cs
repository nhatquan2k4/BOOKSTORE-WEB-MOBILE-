using BookStore.Domain.Entities.Identity;
using UserEntity = BookStore.Domain.Entities.Identity.User;

namespace BookStore.Domain.IRepository.Identity.Auth
{
    public interface IAuthRepository
    {
        Task<UserEntity?> AuthenticateAsync(string email, string passwordHash);
        Task<UserEntity> RegisterUserAsync(UserEntity user);
        Task<bool> VerifyEmailAsync(Guid userId);
        Task<bool> UpdatePasswordAsync(Guid userId, string newPasswordHash);
        Task<bool> EmailExistsAsync(string email);
        Task<UserEntity?> GetUserWithRolesAndPermissionsAsync(string email);
        Task<bool> LockUserAccountAsync(Guid userId);
        Task<bool> UnlockUserAccountAsync(Guid userId);
    }
}
