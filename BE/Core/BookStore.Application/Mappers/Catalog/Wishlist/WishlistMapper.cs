using BookStore.Application.Dtos.Catalog.Wishlist;
using BookStore.Application.Mappers.Catalog.Book;
using WishlistEntity = BookStore.Domain.Entities.Catalog.Wishlist;

namespace BookStore.Application.Mappers.Catalog.Wishlist
{
    public static class WishlistMapper
    {
        public static WishlistDto ToDto(this WishlistEntity wishlist)
        {
            return new WishlistDto
            {
                Id = wishlist.Id,
                UserId = wishlist.UserId,
                BookId = wishlist.BookId,
                CreatedAt = wishlist.CreatedAt,
                BookTitle = wishlist.Book?.Title ?? string.Empty,
                BookISBN = wishlist.Book?.ISBN?.Value,
                BookImageUrl = wishlist.Book?.Images?
                    .OrderBy(image => image.DisplayOrder)
                    .FirstOrDefault()?.ImageUrl,
                BookPrice = wishlist.Book?.GetCurrentPriceAmount(),
                BookDiscountPrice = wishlist.Book?.GetCurrentDiscountPriceAmount(),
                AuthorNames = wishlist.Book?.BookAuthors == null
                    ? null
                    : string.Join(", ", wishlist.Book.BookAuthors.Select(bookAuthor => bookAuthor.Author.Name)),
                PublisherName = wishlist.Book?.Publisher?.Name
            };
        }

        public static List<WishlistDto> ToDtoList(this IEnumerable<WishlistEntity> wishlists)
        {
            return wishlists.Select(wishlist => wishlist.ToDto()).ToList();
        }

        public static WishlistSummaryDto ToSummaryDto(this IReadOnlyCollection<Guid> bookIds)
        {
            return new WishlistSummaryDto
            {
                TotalItems = bookIds.Count,
                BookIds = bookIds.ToList()
            };
        }
    }
}
