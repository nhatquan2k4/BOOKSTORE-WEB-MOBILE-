using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Mappers.Catalog.Book;
using AuthorEntity = BookStore.Domain.Entities.Catalog.Author;

namespace BookStore.Application.Mappers.Catalog.Author
{
    public static class AuthorDetailMapper
    {
        // Entity → AuthorDetailDto
        public static AuthorDetailDto ToDetailDto(this AuthorEntity author)
        {
            return new AuthorDetailDto
            {
                Id = author.Id,
                Name = author.Name,
                Biography = author.Biography,
                AvartarUrl = author.AvartarUrl,
                BookCount = author.BookAuthors?.Count ?? 0,
                Books = author.BookAuthors?
                    .Select(ba => BookMapper.ToDto(ba.Book))
                    .ToList() ?? new List<BookDto>()
            };
        }
    }
}