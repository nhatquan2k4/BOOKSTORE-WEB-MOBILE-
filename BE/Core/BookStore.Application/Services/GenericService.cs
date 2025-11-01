using BookStore.Application.IService;
using BookStore.Domain.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookStore.Application.Service
{

    public abstract class GenericService<TEntity, TDto, TCreateDto, TUpdateDto>
        : IGenericService<TDto, TCreateDto, TUpdateDto>
        where TEntity : class
        where TDto : class
        where TCreateDto : class
        where TUpdateDto : class
    {
        protected readonly IGenericRepository<TEntity> _repository;

        protected GenericService(IGenericRepository<TEntity> repository)
        {
            _repository = repository;
        }

        /// Lấy tất cả entity và map sang DTO.
        public virtual async Task<IEnumerable<TDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return entities.Select(MapToDto);
        }

        /// Lấy 1 entity theo ID.
        public virtual async Task<TDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        /// Thêm entity mới từ DTO tạo.
        public virtual async Task<TDto> AddAsync(TCreateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var entity = MapToEntity(dto);
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return MapToDto(entity);
        }

        /// Cập nhật entity.
        public virtual async Task<TDto> UpdateAsync(TUpdateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var entity = MapToEntity(dto);
            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return MapToDto(entity);
        }

        /// Xóa entity theo ID.
        public virtual async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        /// Kiểm tra entity có tồn tại không.
        public virtual async Task<bool> ExistsAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity != null;

        }

        /// Lưu thay đổi (nếu cần thủ công).
        public virtual async Task SaveChangesAsync()
        {
            await _repository.SaveChangesAsync();
        }


        protected abstract TDto MapToDto(TEntity entity);
        protected abstract TEntity MapToEntity(TCreateDto dto);
        protected abstract TEntity MapToEntity(TUpdateDto dto);

    }
}