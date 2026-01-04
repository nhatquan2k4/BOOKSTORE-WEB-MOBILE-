using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog.Book
{
    public static class BookFileMapper
    {

        public static BookFileDto ToDto(this BookFile bookFile)
        {
            return new BookFileDto
            {
                Id = bookFile.Id,
                FileUrl = bookFile.FileUrl,
                FileType = bookFile.FileType,
                FileSize = bookFile.FileSize,
                IsPreview = bookFile.IsPreview,
                BookId = bookFile.BookId
            };
        }

        public static List<BookFileDto> ToDtoList(this IEnumerable<BookFile> bookFiles)
        {
            return bookFiles.Select(bf => bf.ToDto()).ToList();
        }

        public static BookFile ToEntity(this BookFileDto dto)
        {
            return new BookFile
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                FileUrl = dto.FileUrl,
                FileType = dto.FileType,
                FileSize = dto.FileSize,
                IsPreview = dto.IsPreview,
                BookId = dto.BookId
            };
        }

        public static void UpdateFromDto(this BookFile bookFile, BookFileDto dto)
        {
            bookFile.FileUrl = dto.FileUrl;
            bookFile.FileType = dto.FileType;
            bookFile.FileSize = dto.FileSize;
            bookFile.IsPreview = dto.IsPreview;
            bookFile.BookId = dto.BookId;
        }
    }
}