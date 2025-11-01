using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.IService
{
    public interface IGenericService<TDto, TCreateDto, TUpdateDto>
        where TDto : class
        where TCreateDto : class
        where TUpdateDto : class

    {
        Task<IEnumerable<TDto>> GetAllAsync();
        Task<TDto?> GetByIdAsync(Guid id);
        Task<TDto> AddAsync(TCreateDto dto);
        Task<TDto> UpdateAsync(TUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task SaveChangesAsync();
        Task<bool> ExistsAsync(Guid id);
    }
}