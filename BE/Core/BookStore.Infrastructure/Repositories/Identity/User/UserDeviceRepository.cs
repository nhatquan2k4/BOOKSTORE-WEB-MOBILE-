using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookStore.Shared.Utilities;

namespace BookStore.Infrastructure.Repository.Identity.User
{
    public class UserDeviceRepository : GenericRepository<UserDevice>, IUserDeviceRepository
    {
        public UserDeviceRepository(AppDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<UserDevice>> GetAllAsync()
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<UserDevice?> GetByIdAsync(Guid id)
        {
            Guard.Against(id == Guid.Empty, "Id không được để trống");

            return await _context.UserDevices
                .Include(ud => ud.User)
                .FirstOrDefaultAsync(ud => ud.Id == id);
        }

        public override async Task AddAsync(UserDevice entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            if (entity!.Id == Guid.Empty)
                entity.Id = Guid.NewGuid();

            await base.AddAsync(entity);
        }

        public override void Update(UserDevice entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            base.Update(entity!);
        }

        public override void Delete(UserDevice entity)
        {
            Guard.Against(entity == null, "Entity không được null");

            base.Delete(entity!);
        }

        public async Task<IEnumerable<UserDevice>> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<UserDevice>();

            return await _context.UserDevices
                .Include(ud => ud.User)
                .Where(ud => ud.UserId == userId)
                .OrderByDescending(ud => ud.LastLoginAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<UserDevice?> GetByDeviceNameAsync(Guid userId, string deviceName)
        {
            if (userId == Guid.Empty || string.IsNullOrWhiteSpace(deviceName))
                return null;

            return await _context.UserDevices
                .Include(ud => ud.User)
                .FirstOrDefaultAsync(ud => ud.UserId == userId && ud.DeviceName == deviceName);
        }

        public async Task UpdateLastLoginAsync(Guid deviceId, string ipAddress)
        {
            if (deviceId == Guid.Empty)
                return;

            var userDevice = await _context.UserDevices.FindAsync(deviceId);
            if (userDevice != null)
            {
                userDevice.LastLoginAt = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(ipAddress))
                {
                    userDevice.LastLoginIp = ipAddress;
                }

                _context.UserDevices.Update(userDevice);
            }
        }
    }
}
