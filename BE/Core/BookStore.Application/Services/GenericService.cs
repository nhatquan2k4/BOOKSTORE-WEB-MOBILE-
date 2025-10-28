using BookStore.Application.IService;
using BookStore.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BookStore.Application.Service
{
    /// <summary>
    /// Generic Service Base Class
    /// TEntity: Domain Entity (e.g., Author)
    /// TDto: DTO for List operations (e.g., AuthorDto)
    /// TDetailDto: DTO for Detail operations (e.g., AuthorDetailDto)
    /// TCreateDto: DTO for Create operations (e.g., CreateAuthorDto)
    /// TUpdateDto: DTO for Update operations (e.g., UpdateAuthorDto)
    /// </summary>
    public abstract class GenericService<TEntity, TDto, TDetailDto, TCreateDto, TUpdateDto>
        : IGenericService<TDto, TDetailDto, TCreateDto, TUpdateDto>
        where TEntity : class
        where TDto : class
        where TDetailDto : class
        where TCreateDto : class
        where TUpdateDto : class
    {
        protected readonly IGenericRepository<TEntity> _repository;

        protected GenericService(IGenericRepository<TEntity> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Lấy tất cả entity và map sang TDto (lightweight DTO for lists)
        /// </summary>
        public virtual async Task<IEnumerable<TDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return entities.Select(MapToDto);
        }

        /// <summary>
        /// Lấy 1 entity theo ID và map sang TDetailDto (full DTO with navigation properties)
        /// </summary>
        public virtual async Task<TDetailDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : MapToDetailDto(entity);
        }

        /// <summary>
        /// Thêm entity mới từ CreateDto và trả về DetailDto
        /// </summary>
        public virtual async Task<TDetailDto> AddAsync(TCreateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var entity = MapToEntity(dto);
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            return MapToDetailDto(entity);
        }

        /// <summary>
        /// Cập nhật entity từ UpdateDto và trả về DetailDto
        /// </summary>
        public virtual async Task<TDetailDto> UpdateAsync(TUpdateDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var entity = MapToEntity(dto);
            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            return MapToDetailDto(entity);
        }

        /// <summary>
        /// Xóa entity theo ID
        /// </summary>
        public virtual async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Kiểm tra entity có tồn tại không
        /// </summary>
        public virtual async Task<bool> ExistsAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity != null;
        }

        /// <summary>
        /// Lưu thay đổi (nếu cần thủ công)
        /// </summary>
        public virtual async Task SaveChangesAsync()
        {
            await _repository.SaveChangesAsync();
        }

        // Abstract mapping methods - must be implemented by derived classes
        protected abstract TDto MapToDto(TEntity entity);
        protected abstract TDetailDto MapToDetailDto(TEntity entity);
        protected abstract TEntity MapToEntity(TCreateDto dto);
        protected abstract TEntity MapToEntity(TUpdateDto dto);
    }
}
