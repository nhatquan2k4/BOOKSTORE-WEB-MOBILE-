namespace BookStore.Application.IService
{
    /// <summary>
    /// Generic Service Interface
    /// TDto: DTO for List operations (e.g., AuthorDto)
    /// TDetailDto: DTO for Detail operations (e.g., AuthorDetailDto)
    /// TCreateDto: DTO for Create operations (e.g., CreateAuthorDto)
    /// TUpdateDto: DTO for Update operations (e.g., UpdateAuthorDto)
    /// </summary>
    public interface IGenericService<TDto, TDetailDto, TCreateDto, TUpdateDto>
        where TDto : class
        where TDetailDto : class
        where TCreateDto : class
        where TUpdateDto : class
    {
        // Queries - List
        Task<IEnumerable<TDto>> GetAllAsync();

        // Queries - Detail
        Task<TDetailDto?> GetByIdAsync(Guid id);

        // Commands
        Task<TDetailDto> AddAsync(TCreateDto dto);
        Task<TDetailDto> UpdateAsync(TUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);

        // Utilities
        Task<bool> ExistsAsync(Guid id);
    }
}
