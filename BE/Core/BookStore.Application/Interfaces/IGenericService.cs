namespace BookStore.Application.Interfaces
{
    /// <summary>
    /// Generic Service Interface cung cấp các CRUD operations cơ bản
    /// </summary>
    /// <typeparam name="TDto">DTO type để trả về cho client</typeparam>
    /// <typeparam name="TCreateDto">DTO type cho việc tạo mới entity</typeparam>
    /// <typeparam name="TUpdateDto">DTO type cho việc cập nhật entity</typeparam>
    public interface IGenericService<TDto, TCreateDto, TUpdateDto>
        where TDto : class
        where TCreateDto : class
        where TUpdateDto : class
    {
        /// <summary>
        /// Lấy tất cả entities
        /// </summary>
        Task<IEnumerable<TDto>> GetAllAsync();

        /// <summary>
        /// Lấy entity theo ID
        /// </summary>
        Task<TDto?> GetByIdAsync(Guid id);

        /// <summary>
        /// Tạo mới entity
        /// </summary>
        Task<TDto> CreateAsync(TCreateDto createDto);

        /// <summary>
        /// Cập nhật entity
        /// </summary>
        Task<TDto> UpdateAsync(TUpdateDto updateDto);

        /// <summary>
        /// Xóa entity theo ID
        /// </summary>
        Task<bool> DeleteAsync(Guid id);
    }
}
