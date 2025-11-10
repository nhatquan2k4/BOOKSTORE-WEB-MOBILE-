using BookStore.Application.Dtos.Cart;
using BookStore.Domain.Entities.Cart;

namespace BookStore.Application.Mappers.Cart
{
    public static class CartMapper
    {
        // Cart Entity -> CartDto
        public static CartDto ToDto(this Domain.Entities.Cart.Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                IsActive = cart.IsActive,
                CreatedAt = cart.CreatedAt,
                Items = cart.Items?.Select(i => i.ToDto()).ToList() ?? new List<CartItemDto>()
            };
        }

        // CartItem Entity -> CartItemDto
        public static CartItemDto ToDto(this CartItem item)
        {
            return new CartItemDto
            {
                Id = item.Id,
                CartId = item.CartId,
                BookId = item.BookId,
                BookTitle = item.Book?.Title ?? string.Empty,
                BookISBN = item.Book?.ISBN?.Value ?? string.Empty,
                BookImageUrl = item.Book?.Images?.FirstOrDefault()?.ImageUrl,
                BookPrice = item.UnitPrice,
                Quantity = item.Quantity,
                AddedAt = item.AddedAt,
                UpdatedAt = item.AddedAt, // CartItem doesn't have UpdatedAt, using AddedAt

                // Extra book info (populated from Book entity if available)
                AuthorNames = item.Book?.BookAuthors != null
                    ? string.Join(", ", item.Book.BookAuthors.Select(ba => ba.Author?.Name ?? ""))
                    : null,
                PublisherName = item.Book?.Publisher?.Name,
                IsAvailable = item.Book != null, // Simplified check
                StockQuantity = 0 // Would need to fetch from StockItem if required
            };
        }

        // CreateCartDto -> Cart Entity
        public static Domain.Entities.Cart.Cart ToEntity(this CreateCartDto dto)
        {
            return new Domain.Entities.Cart.Cart
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }

        // CartItemDto -> CartItem Entity (for adding new item)
        public static CartItem ToEntity(this CartItemDto dto)
        {
            return new CartItem
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                CartId = dto.CartId,
                BookId = dto.BookId,
                Quantity = dto.Quantity,
                UnitPrice = dto.BookPrice,
                AddedAt = dto.AddedAt == default ? DateTime.UtcNow : dto.AddedAt
            };
        }

        // UpdateCartDto -> Update Cart Entity
        public static void UpdateFromDto(this Domain.Entities.Cart.Cart cart, UpdateCartDto dto)
        {
            // UpdateCartDto typically contains items to add/update/remove
            // This would be handled in service layer with more complex logic
            // For now, just mark as updated if there are changes
            if (dto.Items != null && dto.Items.Any())
            {
                // Service layer would handle the actual item updates
                // This mapper just provides the structure
            }
        }

        // Helper to update CartItem quantity
        public static void UpdateQuantity(this CartItem cartItem, int newQuantity)
        {
            cartItem.Quantity = newQuantity;
            // Note: CartItem doesn't have UpdatedAt field in entity
            // If you want to track updates, consider adding UpdatedAt to CartItem entity
        }
    }
}
