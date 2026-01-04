using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog.BookImages
{
    public static class BookImageMapper
    {

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

        public static List<BookImageDto> ToDtoList(this IEnumerable<BookImage> bookImages)
        {
            return bookImages.Select(bi => bi.ToDto()).ToList();
        }
        public static BookImage ToEntity(this CreateBookImageDto dto, string imageUrl)
        {
            return new BookImage
            {
                Id = Guid.NewGuid(),
                BookId = dto.BookId,
                ImageUrl = imageUrl,
                IsCover = dto.IsCover,
                DisplayOrder = dto.DisplayOrder
            };
        }

        public static void UpdateFromDto(this BookImage bookImage, UpdateBookImageDto dto)
        {
            bookImage.IsCover = dto.IsCover;
            bookImage.DisplayOrder = dto.DisplayOrder;
        }
    }
}
