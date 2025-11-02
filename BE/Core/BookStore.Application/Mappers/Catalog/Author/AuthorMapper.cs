using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Shared.Utilities;
using AuthorEntity = BookStore.Domain.Entities.Catalog.Author;

namespace BookStore.Application.Mappers.Catalog.Author
{
    public static class AuthorMapper
    {
        // Entity → AuthorDto (Response)
        public static AuthorDto ToDto(this AuthorEntity author)
        {
            return new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                AvartarUrl = author.AvartarUrl,
                BookCount = author.BookAuthors?.Count ?? 0
            };
        }

        // Collection mapping
        public static List<AuthorDto> ToDtoList(this IEnumerable<AuthorEntity> authors)
        {
            return authors.Select(a => AuthorMapper.ToDto(a)).ToList();
        }

        // CreateAuthorDto → Entity (Create)
        public static AuthorEntity ToEntity(this CreateAuthorDto dto)
        {
            return new AuthorEntity
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.NormalizeSpace(),
                Biography = dto.Biography?.NormalizeSpace(),
                AvartarUrl = dto.AvartarUrl?.Trim()
            };
        }

        // UpdateAuthorDto → Update existing entity
        public static void UpdateFromDto(this AuthorEntity author, UpdateAuthorDto dto)
        {
            author.Name = dto.Name.NormalizeSpace();
            author.Biography = dto.Biography?.NormalizeSpace();
            author.AvartarUrl = dto.AvartarUrl?.Trim();
        }
    }
}