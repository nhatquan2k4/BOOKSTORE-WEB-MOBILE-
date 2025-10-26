using BookStore.Application.DTOs.Catalog.Author;
using BookStore.Application.Interfaces.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;

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
            return authors.Select(a => new AuthorDto
            {
                Id = a.Id,
                Name = a.Name,
                Biography = a.Biography,
                AvartarUrl = a.AvartarUrl
            });
        }

        public async Task<AuthorDto?> GetByIdAsync(Guid id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            if (author == null) return null;

            return new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Biography = author.Biography,
                AvartarUrl = author.AvartarUrl
            };
        }

        public async Task<AuthorDto?> GetByNameAsync(string name)
        {
            var author = await _authorRepository.GetByNameAsync(name);
            if (author == null) return null;

            return new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Biography = author.Biography,
                AvartarUrl = author.AvartarUrl
            };
        }

        public async Task<IEnumerable<AuthorDto>> SearchByNameAsync(string searchTerm)
        {
            var authors = await _authorRepository.SearchByNameAsync(searchTerm);
            return authors.Select(a => new AuthorDto
            {
                Id = a.Id,
                Name = a.Name,
                Biography = a.Biography,
                AvartarUrl = a.AvartarUrl
            });
        }

        public async Task<AuthorDto> CreateAsync(AuthorDto dto)
        {
            // Validate name exists
            if (await _authorRepository.IsNameExistsAsync(dto.Name))
            {
                throw new InvalidOperationException($"Tác giả với tên '{dto.Name}' đã tồn tại");
            }

            var author = new Author
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Biography = dto.Biography,
                AvartarUrl = dto.AvartarUrl
            };

            await _authorRepository.AddAsync(author);
            await _authorRepository.SaveChangesAsync();

            dto.Id = author.Id;
            return dto;
        }

        public async Task<AuthorDto> UpdateAsync(AuthorDto dto)
        {
            var author = await _authorRepository.GetByIdAsync(dto.Id);
            if (author == null)
            {
                throw new InvalidOperationException("Tác giả không tồn tại");
            }

            // Validate name exists (exclude current author)
            if (await _authorRepository.IsNameExistsAsync(dto.Name, dto.Id))
            {
                throw new InvalidOperationException($"Tác giả với tên '{dto.Name}' đã được sử dụng");
            }

            author.Name = dto.Name;
            author.Biography = dto.Biography;
            author.AvartarUrl = dto.AvartarUrl;

            _authorRepository.Update(author);
            await _authorRepository.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            if (author == null) return false;

            _authorRepository.Delete(author);
            await _authorRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsNameExistsAsync(string name, Guid? excludeId = null)
        {
            return await _authorRepository.IsNameExistsAsync(name, excludeId);
        }
    }
}