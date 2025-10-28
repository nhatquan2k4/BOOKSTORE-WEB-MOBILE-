using BookStore.Domain.Entities.Identity;
using BookStore.Domain.Interfaces;
using BookStore.Domain.Interfaces.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Infrastructure.Repository.Identity.User
{
    public class UserDeviceRepository : IUserDeviceRepository
    {

        private readonly AppDbContext _context;
        public UserDeviceRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(UserDevice entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

             await _context.AddAsync(entity);

        }

        public async void Delete(UserDevice entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            _context.UserDevices.Remove(entity);

        }

        public async Task<IEnumerable<UserDevice>> GetAllAsync()
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .ToListAsync();

        }

        public async Task<UserDevice?> GetByDeviceNameAsync(Guid userId, string deviceName)
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .FirstOrDefaultAsync(ud => ud.UserId == userId && ud.DeviceName == deviceName);

        }

        public async Task<UserDevice?> GetByIdAsync(Guid id)
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .FirstOrDefaultAsync(ud => ud.Id == id);

        }

        public async Task<IEnumerable<UserDevice>> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .Where(ud => ud.UserId == userId)
                .ToListAsync();

        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();

        }

        public async Task Update(UserDevice entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            _context.UserDevices.Update(entity);

        }

        public async Task UpdateLastLoginAsync(Guid deviceId, string ipAddress)
        {
            var userDevice = await _context.UserDevices.FindAsync(deviceId);
            if (userDevice != null)
            {
                userDevice.LastLoginAt = DateTime.UtcNow;
                _context.UserDevices.Update(userDevice);

            }
        }

        void IGenericRepository<UserDevice>.Update(UserDevice entity)
        {
            throw new NotImplementedException();
        }
    }
}
