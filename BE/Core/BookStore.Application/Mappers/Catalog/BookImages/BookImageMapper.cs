using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog.BookImages
{
    public static class BookImageMapper
    {
        /// <summary>
        /// Entity → BookImageDto (Response)
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
        /// Collection mapping
        /// </summary>
        public static List<BookImageDto> ToDtoList(this IEnumerable<BookImage> bookImages)
        {
            return bookImages.Select(bi => bi.ToDto()).ToList();
        }

        /// <summary>
        /// CreateBookImageDto → Entity (Create)
        /// imageUrl sẽ được set sau khi upload lên MinIO
        /// </summary>
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

        /// <summary>
        /// UpdateBookImageDto → Update existing entity
        /// Chỉ update metadata, không update ImageUrl
        /// </summary>
        public static void UpdateFromDto(this BookImage bookImage, UpdateBookImageDto dto)
        {
            bookImage.IsCover = dto.IsCover;
            bookImage.DisplayOrder = dto.DisplayOrder;
        }
    }
}
