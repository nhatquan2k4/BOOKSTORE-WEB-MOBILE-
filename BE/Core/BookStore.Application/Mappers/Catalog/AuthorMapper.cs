using BookStore.Application.DTOs.Catalog.Author;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho Author entity
    /// </summary>
    public static class AuthorMapper
    {
        /// <summary>
        /// Map Author entity sang AuthorDto
        /// </summary>
        public static AuthorDto ToDto(this Author author)
        {
            return new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                Biography = author.Biography,
                AvartarUrl = author.AvartarUrl
            };
        }

        /// <summary>
        /// Map collection Author entities sang collection AuthorDto
        /// </summary>
        public static List<AuthorDto> ToDtoList(this IEnumerable<Author> authors)
        {
            return authors.Select(a => a.ToDto()).ToList();
        }

        /// <summary>
        /// Map AuthorDto sang Author entity (for Create)
        /// </summary>
        public static Author ToEntity(this AuthorDto dto)
        {
            return new Author
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                Name = dto.Name,
                Biography = dto.Biography,
                AvartarUrl = dto.AvartarUrl
            };
        }

        /// <summary>
        /// Update Author entity từ AuthorDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this Author author, AuthorDto dto)
        {
            author.Name = dto.Name;
            author.Biography = dto.Biography;
            author.AvartarUrl = dto.AvartarUrl;
        }
    }
}