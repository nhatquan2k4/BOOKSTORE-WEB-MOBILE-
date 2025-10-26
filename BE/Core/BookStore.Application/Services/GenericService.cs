using BookStore.Application.Interfaces;
using BookStore.Domain.Interfaces;

namespace BookStore.Application.Services
{
    /// <summary>
    /// Generic Service Implementation - Base class cho tất cả services
    /// Cung cấp các CRUD operations cơ bản thông qua Generic Repository
    /// Các service con sẽ kế thừa và implement thêm logic nghiệp vụ riêng
    /// </summary>
    /// <typeparam name="TEntity">Domain Entity type</typeparam>
    /// <typeparam name="TDto">DTO type để trả về cho client</typeparam>
    /// <typeparam name="TCreateDto">DTO type cho việc tạo mới entity</typeparam>
    /// <typeparam name="TUpdateDto">DTO type cho việc cập nhật entity</typeparam>
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

        /// <summary>
        /// Lấy tất cả entities và map sang DTO
        /// </summary>
        public virtual async Task<IEnumerable<TDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return entities.Select(MapToDto);
        }

        /// <summary>
        /// Lấy entity theo ID và map sang DTO
        /// </summary>
        public virtual async Task<TDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : MapToDto(entity);
        }

        /// <summary>
        /// Tạo mới entity từ CreateDto
        /// </summary>
        public virtual async Task<TDto> CreateAsync(TCreateDto createDto)
        {
            // Validate business rules (override trong class con nếu cần)
            await ValidateCreate(createDto);

            // Map CreateDto to Entity
            var entity = MapCreateDtoToEntity(createDto);

            // Add to repository
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            // Return DTO
            return MapToDto(entity);
        }

        /// <summary>
        /// Cập nhật entity từ UpdateDto
        /// </summary>
        public virtual async Task<TDto> UpdateAsync(TUpdateDto updateDto)
        {
            // Get entity ID (phải override GetEntityId trong class con)
            var entityId = GetEntityId(updateDto);

            var entity = await _repository.GetByIdAsync(entityId);
            if (entity == null)
            {
                throw new InvalidOperationException($"Entity với ID {entityId} không tồn tại");
            }

            // Validate business rules (override trong class con nếu cần)
            await ValidateUpdate(updateDto, entity);

            // Update entity properties
            UpdateEntityFromDto(entity, updateDto);

            // Save changes
            _repository.Update(entity);
            await _repository.SaveChangesAsync();

            // Return DTO
            return MapToDto(entity);
        }

        /// <summary>
        /// Xóa entity theo ID
        /// </summary>
        public virtual async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            // Validate business rules before delete (override trong class con nếu cần)
            await ValidateDelete(id, entity);

            _repository.Delete(entity);
            await _repository.SaveChangesAsync();

            return true;
        }

        #region Abstract Methods - PHẢI implement trong class con

        /// <summary>
        /// Map Entity sang DTO - PHẢI implement trong class con
        /// </summary>
        protected abstract TDto MapToDto(TEntity entity);

        /// <summary>
        /// Map CreateDto sang Entity - PHẢI implement trong class con
        /// </summary>
        protected abstract TEntity MapCreateDtoToEntity(TCreateDto createDto);

        /// <summary>
        /// Update Entity từ UpdateDto - PHẢI implement trong class con
        /// </summary>
        protected abstract void UpdateEntityFromDto(TEntity entity, TUpdateDto updateDto);

        /// <summary>
        /// Lấy ID từ UpdateDto - PHẢI implement trong class con
        /// </summary>
        protected abstract Guid GetEntityId(TUpdateDto updateDto);

        #endregion

        #region Virtual Methods - CÓ THỂ override trong class con nếu cần validation

        /// <summary>
        /// Validate trước khi tạo mới - Override trong class con nếu cần
        /// </summary>
        protected virtual Task ValidateCreate(TCreateDto createDto)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Validate trước khi cập nhật - Override trong class con nếu cần
        /// </summary>
        protected virtual Task ValidateUpdate(TUpdateDto updateDto, TEntity entity)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Validate trước khi xóa - Override trong class con nếu cần
        /// </summary>
        protected virtual Task ValidateDelete(Guid id, TEntity entity)
        {
            return Task.CompletedTask;
        }

        #endregion
    }
}
