using BookStore.Application.Dtos.Identity.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.IService.Identity.User
{
    public interface IUserProfileService
    {
        Task<UserProfileDto?> GetUserProfileByUserIdAsync(Guid userId);
        Task<UserProfileDto> CreateUserProfileAsync(Guid userId, CreateUserProfileDto dto);
        Task<UserProfileDto?> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto);
    }
}
