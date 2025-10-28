using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog.Book
{
    /// <summary>
    /// Mapper thủ công cho BookImage entity
    /// </summary>
    public static class BookImageMapper
    {
        /// <summary>
        /// Map BookImage entity sang BookImageDto
        /// </summary>
        public static BookImageDto ToDto(this BookImage bookImage)
        {
            return new BookImageDto
            {
                Id = bookImage.Id,
                ImageUrl = bookImage.ImageUrl,
                IsCover = bookImage.IsCover,
                DisplayOrder = bookImage.DisplayOrder,
                BookId = bookImage.BookId
            };
        }

        /// <summary>
        /// Map collection BookImage entities sang collection BookImageDto
        /// </summary>
        public static List<BookImageDto> ToDtoList(this IEnumerable<BookImage> bookImages)
        {
            return bookImages.Select(bi => bi.ToDto()).ToList();
        }

        /// <summary>
        /// Map BookImageDto sang BookImage entity (for Create)
        /// </summary>
        public static BookImage ToEntity(this BookImageDto dto)
        {
            return new BookImage
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                ImageUrl = dto.ImageUrl,
                IsCover = dto.IsCover,
                DisplayOrder = dto.DisplayOrder,
                BookId = dto.BookId
            };
        }

        /// <summary>
        /// Update BookImage entity từ BookImageDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this BookImage bookImage, BookImageDto dto)
        {
            bookImage.ImageUrl = dto.ImageUrl;
            bookImage.IsCover = dto.IsCover;
            bookImage.DisplayOrder = dto.DisplayOrder;
            bookImage.BookId = dto.BookId;
        }
    }
}