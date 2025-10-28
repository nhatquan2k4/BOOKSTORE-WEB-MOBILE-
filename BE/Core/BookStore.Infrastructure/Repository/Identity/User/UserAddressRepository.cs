using BookStore.Domain.Entities.Identity;
using BookStore.Domain.Interfaces.Identity.User;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Infrastructure.Repository.Identity.User
{
    public class UserAddressRepository : IUserAddressRepository
    {

        private readonly AppDbContext _context;
        public UserAddressRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(UserAddress entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }
            await _context.UserAddresses.AddAsync(entity);
           
        }
        public async void Update(UserAddress entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            var existingEntity = await _context.UserAddresses.FindAsync(entity.Id);
            if (existingEntity != null)
            {
               _context.UserAddresses.Update(entity);
            }

        }

        public async void Delete(UserAddress entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));
            var existingEntity = await _context.UserAddresses.FindAsync(entity.Id);
            if (existingEntity != null)
            {
                _context.UserAddresses.Remove(existingEntity);
            }

        }

        public async Task<IEnumerable<UserAddress>> GetAllAsync()
        {
            return await _context.UserAddresses.
                Include(ua => ua.User).
                ToListAsync();
        }

        public async Task<UserAddress?> GetByIdAsync(Guid id)
        {
            return await _context.UserAddresses.
                Include(ua => ua.User).
                FirstOrDefaultAsync(ua => ua.Id == id);
        }

        public async Task<IEnumerable<UserAddress>> GetByUserIdAsync(Guid userId)
        {
            return await _context.UserAddresses.
                Include(ua => ua.User).
                Where(ua => ua.UserId == userId).
                ToListAsync();
        }

        public async Task<UserAddress?> GetDefaultAddressByUserIdAsync(Guid userId)
        {
            return await _context.UserAddresses.
                Include(ua => ua.User).
                FirstOrDefaultAsync(ua => ua.UserId == userId && ua.IsDefault);

        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task SetDefaultAddressAsync(Guid addressId, Guid userId)
        {
            
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address != null)
            {
                address.IsDefault = true;
                _context.UserAddresses.Update(address);
            }

        }

        
    }
}
