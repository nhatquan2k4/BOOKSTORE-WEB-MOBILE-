using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface IAuthorService : IGenericService<AuthorDto, CreateAuthorDto, UpdateAuthorDto>
    {
        // Lấy chi tiết 1 tác giả theo Id
        new Task<AuthorDetailDto?> GetByIdAsync(Guid id);

        // Tạo mới tác giả và trả về thông tin chi tiết tác giả sau khi tạo
        new Task<AuthorDetailDto> AddAsync(CreateAuthorDto dto);

        // Cập nhật tác giả và trả về chi tiết sau update
        new Task<AuthorDetailDto> UpdateAsync(UpdateAuthorDto dto);

        // Tìm kiếm theo tên tác giả
        Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm);

        //  Tìm chính xác theo tên
        Task<AuthorDetailDto?> GetByNameAsync(string name);

        // Kiểm tra tên tác giả đã tồn tại chưa
        Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null);
    }
}