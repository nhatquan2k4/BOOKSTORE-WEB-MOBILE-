using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho BookFile entity
    /// </summary>
    public static class BookFileMapper
    {
        /// <summary>
        /// Map BookFile entity sang BookFileDto
        /// </summary>
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

        /// <summary>
        /// Map collection BookFile entities sang collection BookFileDto
        /// </summary>
        public static List<BookFileDto> ToDtoList(this IEnumerable<BookFile> bookFiles)
        {
            return bookFiles.Select(bf => bf.ToDto()).ToList();
        }

        /// <summary>
        /// Map BookFileDto sang BookFile entity (for Create)
        /// </summary>
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

        /// <summary>
        /// Update BookFile entity từ BookFileDto (for Update)
        /// </summary>
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