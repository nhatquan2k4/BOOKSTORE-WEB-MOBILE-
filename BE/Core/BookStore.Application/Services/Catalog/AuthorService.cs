using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.Mappers.Catalog.Author;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Exceptions;
using BookStore.Shared.Utilities;

namespace BookStore.Application.Services.Catalog
{
    public class AuthorService : IAuthorService
    {
        private readonly IAuthorRepository _authorRepository;

        public AuthorService(IAuthorRepository authorRepository)
        {
            _authorRepository = authorRepository;
        }

        public async Task<IEnumerable<AuthorDto>> GetAllAsync()
        {
            var authors = await _authorRepository.GetAllAsync();
            return authors.ToDtoList();
        }

        // Explicit implementation for IGenericService (returns AuthorDto)
        async Task<AuthorDto?> IGenericService<AuthorDto, CreateAuthorDto, UpdateAuthorDto>.GetByIdAsync(Guid id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            return author?.ToDto();
        }

        // Public implementation for IAuthorService (returns AuthorDetailDto)
        public async Task<AuthorDetailDto?> GetByIdAsync(Guid id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            if (author == null) return null;

            return author.ToDetailDto();
        }

        public async Task<AuthorDetailDto?> GetByNameAsync(string name)
        {
            var author = await _authorRepository.GetByNameAsync(name);
            if (author == null) return null;

            return author.ToDetailDto();
        }

        public async Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm)
        {
            var authors = await _authorRepository.SearchByNameAsync(searchTerm);
            return authors.ToDtoList();
        }

        // Explicit implementation for IGenericService (returns AuthorDto)
        async Task<AuthorDto> IGenericService<AuthorDto, CreateAuthorDto, UpdateAuthorDto>.AddAsync(CreateAuthorDto dto)
        {
            // Validate name
            Guard.AgainstNullOrWhiteSpace(dto.Name, nameof(dto.Name));

            // Validate name exists
            if (await _authorRepository.IsNameExistsAsync(dto.Name))
            {
                throw new UserFriendlyException($"Tác giả với tên '{dto.Name}' đã tồn tại");
            }

            var author = dto.ToEntity();

            await _authorRepository.AddAsync(author);
            await _authorRepository.SaveChangesAsync();

            return author.ToDto();
        }

        // Public implementation for IAuthorService (returns AuthorDetailDto)
        public async Task<AuthorDetailDto> AddAsync(CreateAuthorDto dto)
        {
            // Validate name
            Guard.AgainstNullOrWhiteSpace(dto.Name, nameof(dto.Name));

            // Validate name exists
            if (await _authorRepository.IsNameExistsAsync(dto.Name))
            {
                throw new UserFriendlyException($"Tác giả với tên '{dto.Name}' đã tồn tại");
            }

            var author = dto.ToEntity();

            await _authorRepository.AddAsync(author);
            await _authorRepository.SaveChangesAsync();

            return author.ToDetailDto();
        }

        // Explicit implementation for IGenericService (returns AuthorDto)
        async Task<AuthorDto> IGenericService<AuthorDto, CreateAuthorDto, UpdateAuthorDto>.UpdateAsync(UpdateAuthorDto dto)
        {
            var author = await _authorRepository.GetByIdAsync(dto.Id);
            if (author == null)
            {
                throw new NotFoundException($"Không tìm thấy tác giả với ID {dto.Id}");
            }

            // Validate name
            Guard.AgainstNullOrWhiteSpace(dto.Name, nameof(dto.Name));

            // Validate name exists (exclude current author)
            if (await _authorRepository.IsNameExistsAsync(dto.Name, dto.Id))
            {
                throw new UserFriendlyException($"Tác giả với tên '{dto.Name}' đã được sử dụng");
            }

            author.UpdateFromDto(dto);

            _authorRepository.Update(author);
            await _authorRepository.SaveChangesAsync();

            return author.ToDto();
        }

        // Public implementation for IAuthorService (returns AuthorDetailDto)
        public async Task<AuthorDetailDto> UpdateAsync(UpdateAuthorDto dto)
        {
            var author = await _authorRepository.GetByIdAsync(dto.Id);
            if (author == null)
            {
                throw new NotFoundException($"Không tìm thấy tác giả với ID {dto.Id}");
            }

            // Validate name
            Guard.AgainstNullOrWhiteSpace(dto.Name, nameof(dto.Name));

            // Validate name exists (exclude current author)
            if (await _authorRepository.IsNameExistsAsync(dto.Name, dto.Id))
            {
                throw new UserFriendlyException($"Tác giả với tên '{dto.Name}' đã được sử dụng");
            }

            author.UpdateFromDto(dto);

            _authorRepository.Update(author);
            await _authorRepository.SaveChangesAsync();

            return author.ToDetailDto();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            if (author == null) return false;

            _authorRepository.Delete(author);
            await _authorRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            return author != null;
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null)
        {
            return await _authorRepository.IsNameExistsAsync(name, excludeId);
        }

        public async Task SaveChangesAsync()
        {
            await _authorRepository.SaveChangesAsync();
        }
    }
}